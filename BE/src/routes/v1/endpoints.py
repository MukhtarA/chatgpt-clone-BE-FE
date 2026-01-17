import json
import logging
import time
import base64
import asyncio

from fastapi import APIRouter, BackgroundTasks, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from openai import AsyncOpenAI
from src.settings import Settings

settings = Settings()
router = APIRouter(prefix="/api/v1")

logger = logging.getLogger(__name__)
openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

MODEL_NAME='gpt-5-nano'
MAX_TOKENS=500
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received WebSocket message: {data}")
            try:
                message = json.loads(data)
                user_message = message.get("message", "")
                use_streaming = message.get("stream", True)

                if not user_message:
                    await websocket.send_text(json.dumps({"error": "No message provided"}))
                    continue
                
                start_time = time.time()
                await generate_streaming_response(user_message, websocket, start_time)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "Invalid JSON format"}))
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                await websocket.send_text(json.dumps({"error": "Internal server error"}))
    except WebSocketDisconnect: 
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")

async def generate_streaming_response(user_message: str, websocket: WebSocket, start_time: float):
    try:
        await websocket.send_text(json.dumps({
            "type": "streaming_start",
            "timestamp": time.time(),
        }))

        stream = await openai_client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "developer", "content": "You are a helpful assistant that provides concise and clear answers"},
                {"role": "user", "content": user_message}
            ],
            max_completion_tokens=2000,
            reasoning_effort="minimal",
            stream=True
        )
     
        full_response = ""
        chunk_count = 0

        async for chunk in stream:
            logger.info(f"Received chunk: {chunk}")
            if chunk.choices[0].delta.content is not None:
                content = chunk.choices[0].delta.content
                full_response += content
                chunk_count += 1
                chunk_timestamp = time.time()
                chunk_message = json.dumps({
                    "type": "streaming_chunk",
                    "chunk": content,
                    "chunk_index": chunk_count,
                    "timestamp": chunk_timestamp,
                })

                await websocket.send_text(chunk_message)
                await asyncio.sleep(0.001)

        response_time = round((time.time() - start_time) * 1000, 2)

        await websocket.send_text(json.dumps({
            "type": "streaming_end",
            "response": full_response,
            "metrics": {
                "response_time_ms": response_time,
                "response_length": len(full_response),
                "word_count": len(full_response.split()),
                "sentiment": await analyze_sentiment(full_response),
            },
        }))      
    except Exception as e:
        logger.error(f"Error in ChatGpt streaming: {e}")
        await websocket.send_text(json.dumps({
            "type": "streaming_error",
            "error": str(e) # Для отладки лучше видеть ошибку
        }))
    
@router.post("/upload-image")
async def upload_file(file: UploadFile = File(...), message: str = Form(None)):
    start_time = time.time()
    try:
        image_data = await file.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        content_type = file.content_type

        if content_type not in ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/bmp", "image/webp"]:
            return {"error": "Unsupported file type"}
        
        if message and message.strip():
            prompt = f"{message.strip()} \n\n please analyze the image and respond to the user's request."
        else: 
            prompt = "Please analyze the image and provide a detailed description of its content."

        response = await openai_client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "user", "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:{content_type};base64,{image_base64}"}}
                ]}
            ],
            max_completion_tokens=2000,
            reasoning_effort="minimal",
        )

        analysis = response.choices[0].message.content
        response_time = round((time.time() - start_time) * 1000, 2)

        return {
            "success": True,
            "analysis": analysis,
            "file_name": file.filename,
            "content_type": content_type,
            "user_message": message,
            "metrics": {
                "response_time_ms": response_time,
                "response_length": len(analysis),
                "word_count": len(analysis.split()),
                "sentiment": await analyze_sentiment(analysis),
            },
        }
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        return {"error": str(e)}
    

async def analyze_sentiment(text: str) -> str:
    try:
        response = await openai_client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "developer",
                    "content": """Analyze the sentiment of the following text. Consider:
                        1. Context and tone  # Overall emotional context
                        2. Sarcasm and irony  # Detect when literal meaning differs from intent
                        3. Mixed emotions  # Handle conflicting sentiments in same text
                        4. Cultural context  # Consider cultural differences in expression
                        5. Politeness vs. actual sentiment  # Distinguish polite language from true sentiment

                        Respond with ONLY one word: 'positive', 'negative', or 'neutral'.
                        Be conservative - if unsure, choose 'neutral'."""
                },
                {
                    "role": "user", 
                    "content": text
                }
            ],
            max_completion_tokens=2000,
            reasoning_effort="minimal",
        )

        sentiment = response.choices[0].message.content.strip().lower()
        if sentiment in ['positive', 'negative', 'neutral']:
            return sentiment
        return 'neutral'
    except Exception as e:
        return  analyze_sentiment_fallback(text)
    

def analyze_sentiment_fallback(text: str) -> str:
    positive_keywords = ['good', 'great', 'excellent', 'happy', 'love', 'fantastic', 'positive', 'fortunate', 'correct', 'superior']
    negative_keywords = ['bad', 'terrible', 'awful', 'sad', 'hate', 'horrible', 'negative', 'unfortunate', 'wrong', 'inferior']

    text_lower = text.lower()
    positive_score = sum(text_lower.count(word) for word in positive_keywords)
    negative_score = sum(text_lower.count(word) for word in negative_keywords)

    if positive_score > negative_score:
        return 'positive'
    elif negative_score > positive_score:
        return 'negative'
    else:
        return 'neutral'