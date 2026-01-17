export type MessageFeedbackType = 'like' | 'dislike' | null

interface FeedbackButtonsProps {
    messageId: string,
    currentFeedback: MessageFeedbackType
    onFeedback: (messageId: string, feedback: MessageFeedbackType) => void
}

export default function FeedbackButtons({ messageId, currentFeedback, onFeedback }: FeedbackButtonsProps) {
    return (
        <div className="flex items-center justify-end space-x-2">
            <button className={`p-1 rounded ${
                currentFeedback === 'like' 
                ? 'text-green-400 bg-green-900/30'
                : 'text-slate-400 hover:text-green-400'
             }`} onClick={() => onFeedback(messageId, 'like')}>
                👍
            </button>
            <button className={`p-1 rounded ${
                currentFeedback === 'dislike' 
                ? 'text-red-400 bg-red-900/30'
                : 'text-slate-400 hover:text-red-400'
             }`}  onClick={() => onFeedback(messageId, 'dislike')}>
                👎
            </button>
        </div>
    )
}