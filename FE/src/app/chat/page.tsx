'use client'
import ChatHeader from "@/components/ChatHeader";
import { MessageFeedbackType } from "@/components/FeedbackButtons";
import LoadingIndicator from "@/components/LoadingIndicator";
import { Message } from "@/components/Message";
import MessageInput from "@/components/MessageInput";
import { messageReducer } from "@/reducers/messageRuducer";
import { useEffect, useReducer, useRef, useState } from "react";

export default function Chat() {
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [inpuutMessage, setInputMessage] = useState('');
    const [messages, dispatch] = useReducer(messageReducer, []);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const messageEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleImageUpload = async (file: File, message: string) => {
        if(!isConnected || isLoading || !file) return;

        if(!file.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            return;
        }

        if(file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB.');
            return;
        }
        
        setIsImageUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('message', message.trim());

        try {
            const response = await fetch('http://localhost:8081/api/v1/upload-image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const userMessage = message.trim() || "[Image Attached]";
            const imagePreview = await readFileAsDataURL(file);
            addMessage(userMessage, 'user', null, imagePreview ?? '');
            addMessage(data.analysis, 'ai', data?.metrics);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('An error occurred while uploading the image.');
        } finally {
            setIsImageUploading(false);
        }
    }

    const sendMessage = () => {
        const trimmed = inpuutMessage.trim();

        if(!trimmed || !isConnected || isLoading) return

        dispatch({ 
            type: 'ADD_MESSAGE', 
            payload: {
                id: crypto.randomUUID(),
                response: trimmed,
                sender: 'user',
                timestamp: new Date(),
                feedback: null,
            } 
        });

        setInputMessage('');
        setIsLoading(true);
        wsRef.current?.send(JSON.stringify({ message: trimmed, streaming: true }));
    }

    const addMessage = (response: string, sender: 'user' | 'ai', metrics?: any, imagePreview?: string) => {
        const message = {
            id: crypto.randomUUID(),
            response,
            sender,
            timestamp: new Date(),
            metrics,
            feedback: null,
            image: imagePreview
        };

        dispatch({ type: 'ADD_MESSAGE', payload: message });
    }

    const addStreamingMessage = () => {
        dispatch({ type: 'ADD_STREAMING_MESSAGE' });
    }

    const updateStreamingMessage = (content: string) => {
        dispatch({ type: 'UPDATE_STREAMING_MESSAGE', payload: content });
    }

    const completeStreamingMessage = (fullResponse: string, metrics: any) => {
        dispatch({ 
            type: 'COMPLETE_STREAMING_MESSAGE',
            payload: { 
                response: fullResponse, 
                metrics
            }
        });
    }

    useEffect(() => {
        const ws = new  WebSocket(`ws://localhost:8081/api/v1/ws`);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.error) {
                console.error('WebSocket error:', data.error);
                addMessage(`Error: ${data.error}`, 'ai');
            } else if (data.type === 'streaming_start') {
                addStreamingMessage();
                setIsLoading(false)
            } else if (data.type === 'streaming_chunk') {
                updateStreamingMessage(data.chunk);
            } else if (data.type === 'streaming_end') {
                completeStreamingMessage(data.response, data.metrics);
            } else if (data.response) {
                addMessage(data.response, 'ai', data.metrics);
                setIsLoading(false);
            }
        }   

        ws.onclose = () => {
            setIsConnected(false);
        }

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsConnected(false);
        }

        return () => {
            ws.close();
        }
    }, []);

    const handleFeedback = (messageId: string, feedback: MessageFeedbackType) => {
        dispatch({
            type: 'SET_FEEDBACK',
            payload: {
                messageId,
                feedback
            }
        })

    }

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-slate-200">
            <ChatHeader isConnected={isConnected} />
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
                    {messages.map((message) => <Message key={message.id} message={message} onFeedback={handleFeedback} />)}  
                    {isLoading && <LoadingIndicator />}  
                    <div ref={messageEndRef} />
                </div>
            </div>
            <MessageInput
                inputMessage={inpuutMessage}
                setInputMessage={setInputMessage}
                sendMessage={sendMessage}
                isConnected={isConnected}
                isLoading={isLoading || isImageUploading}
                onImageUpload={handleImageUpload}
            />  
        </div>
    )
}