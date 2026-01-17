export interface MessageType {
    id: string;
    response: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    metrics?: {
        response_time_ms: number;
        response_length: number;
        word_count: number;
        sentiment: string;
    };
    feedback?: 'like' | 'dislike' | null;
    isStreaming?: boolean;
    image?: string;
}

type MessageAction =
    | { type: 'ADD_MESSAGE'; payload: MessageType }
    | { type: 'ADD_STREAMING_MESSAGE' }
    | { type: 'UPDATE_STREAMING_MESSAGE'; payload: string }
    | { 
        type: 'COMPLETE_STREAMING_MESSAGE'; 
        payload: { 
            response: string;
            metrics?: MessageType['metrics']; 
        } 
      }
    | { 
        type: 'SET_FEEDBACK'; 
        payload: { 
            messageId: string;
            feedback?: MessageType['feedback']; 
        } 
      };

export const messageReducer = (
    state: MessageType[],
    action: MessageAction
): MessageType[] => {
    switch (action.type) {
        case 'ADD_MESSAGE':
            return [...state, action.payload];

        case 'ADD_STREAMING_MESSAGE':
            return [
                ...state,
                {
                    id: Math.random().toString(),
                    response: '',
                    sender: 'ai',
                    timestamp: new Date(),
                    isStreaming: true,
                    feedback: null,
                }
            ]

        case 'UPDATE_STREAMING_MESSAGE':
            const updatedState = state.map((msg) => {
                const updatedText = msg.response + action.payload;
                return msg.isStreaming ? { ...msg, response: updatedText } : msg;
            })

            return updatedState;

        case 'COMPLETE_STREAMING_MESSAGE':
            return state.map((msg) => {
                return msg.isStreaming ? {
                    ...msg,
                    response: action.payload.response,
                    isStreaming: false,
                    metrics: action.payload.metrics,
                } : msg;
            });
        case 'SET_FEEDBACK':
            return state.map((msg) => {
                return msg.id === action.payload.messageId ? {
                    ...msg,
                    feedback: action.payload.feedback,
                } : msg;
            })
        
        default:
            return state;
    }
}