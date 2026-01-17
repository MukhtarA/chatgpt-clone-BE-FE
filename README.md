# Take Home Project: AI Chat App

## Overview

Build a chat application UI with WebSocket integration to interact with GPT. The application will allow users to chat with an AI assistant while visualizing response characteristics. It will feature real-time communication with the backend and an intuitive user experience.

## Provided Resources

- A React template repo for the frontend
- A FastAPI template repo for implementing the backend

## Tasks

### 1. Solution Overview

- Provide commentary on your solution in `README.md`, including key points such as UI architecture, design considerations, challenges faced, and how they were addressed. Keep the majority of your commentary high-level (we're not looking for an essay).

### 2. Backend WebSocket Implementation

- Create a simple WebSocket endpoint using FastAPI that accepts user inputs (start from `src/routes/v1/endpoints.py`)
- For each user input, generate a response using GPT
- Send the generated response back to the client over the WebSocket
- Implement proper error handling and connection management

### 3. Chat Interface Implementation

- Create a responsive chat UI with a clean and modern design
- Implement a main chat panel where user and AI messages are displayed
- Add input controls for users to submit messages
- Connect to the WebSocket endpoint to send user inputs and receive AI responses
- Display AI responses in real-time as they arrive from the backend

### 4. Response Visualization

- Display AI response with appropriate styling to distinguish it from user messages
- Implement a simple visualization component to show basic metrics about the response (e.g., response time, length, sentiment)
- Allow users to provide feedback on AI responses (thumbs up/down)

### 5. Bonus Tasks

- Implement response streaming from OpenAI API to the frontend through WebSockets
- Add a typing effect visualization for streaming responses
- Implement image upload functionality allowing users to send images to the chat
- Enable OpenAI's vision capabilities to analyze and respond to uploaded images
- Add responsive design for mobile and tablet devices

## Technical Considerations

- The frontend application should be built using modern React practices (hooks, context, etc.)
- The backend should use FastAPI for implementing the WebSocket endpoint
- Use proper error handling and loading states in both frontend and backend
- Implement WebSocket connection management (connection, reconnection, error handling)
- Optimize for performance and user experience
- Write clean, well-documented code following best practices

## Best Practices

- **Component Composition** - Build reusable UI components with clear responsibilities
- **State Management** - Use appropriate state management techniques for different types of data
- **Responsive Design** - Ensure the application works well on various screen sizes

## Evaluation Criteria

You will be assessed on:

- Your ability to clearly articulate your solution and approach in `README.md`
- Your ability to write clean, optimized code that solves each of the tasks
- Your ability to create an intuitive and responsive user interface
- Your frontend architecture decisions and code organization
- Your implementation of the WebSocket communication between frontend and backend
- Your understanding of asynchronous programming concepts

Please do not spend too much time on styling perfection. We expect this task to take you around 6-8 hours to complete.
