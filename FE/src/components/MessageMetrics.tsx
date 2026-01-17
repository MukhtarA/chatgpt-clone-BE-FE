import FeedbackButtons, { type MessageFeedbackType } from "./FeedbackButtons";

interface MessageMEetricsProps {
    metrics: {
        response_time_ms: number;
        response_length: number;
        word_count: number;
        sentiment: string;
    },
    messageId: string;
    currentFeedback: MessageFeedbackType;
    onFeedback: (
        messageId: string,
        feedback: MessageFeedbackType
    ) => void
}

export default function MessageMetrics({ metrics, messageId, currentFeedback, onFeedback }: MessageMEetricsProps) {

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment.toLowerCase()) {
            case 'positive':
                return 'text-green-400';
            case 'negative':
                return 'text-red-400';
            case 'neutral':
                return 'text-slate-400';
        }
    }

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment.toLowerCase()) {
            case 'positive':
                return '😊';
            case 'negative':
                return '😢';
            case 'neutral':
                return '😐';
        }
    }

    return (
        <div className="mt-2 border-t border-slate-300">
            <div className="flex mt-2 items-center gap-2 justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                    <span>{getSentimentIcon(metrics.sentiment)}</span>
                    <span className={getSentimentColor(metrics.sentiment)}>{metrics.sentiment}</span>
                    <span>{metrics.response_time_ms} ms</span>
                    <span>{metrics.word_count} words</span>
                </div>
                <div className="flex items-center space-x-1">
                    <FeedbackButtons messageId={messageId} currentFeedback={currentFeedback} onFeedback={onFeedback} />
                </div>
            </div>
        </div>
    )
}