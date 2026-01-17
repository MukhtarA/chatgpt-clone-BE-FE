import { MessageType } from "@/reducers/messageRuducer"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import MessageMetrics from "./MessageMetrics";
import { type MessageFeedbackType } from "./FeedbackButtons";

interface MessageProps {
    message: MessageType;
    onFeedback: (messageId: string, feedback: MessageFeedbackType) => void
}

export const Message: React.FC<MessageProps> = ({ message, onFeedback }) => {

    const handleImageClick = (base64Data: string) => {
        // 1. Split the header (data:image/png;base64,) from the actual data
        const byteString = atob(base64Data.split(',')[1]);
        const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];

        // 2. Create an ArrayBuffer and a typed array
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // 3. Create a Blob and an Object URL
        const blob = new Blob([ab], { type: mimeString });
        const url = URL.createObjectURL(blob);

        // 4. Open the window and clean up memory later
        window.open(url, '_blank');
        
        // Optional: Revoke the URL after some time to save memory
        setTimeout(() => URL.revokeObjectURL(url), 10000); 
    };

    return (
        <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 py-2 sm:px-4 sm:py2 rounded-lg ${
                message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-white'
            }`}>
                {/* 1. RENDER IMAGE IF IT EXISTS */}
                {message?.image && (
                    <div className="mb-2 overflow-hidden rounded-lg">
                        <img 
                            src={message.image} 
                            alt="Uploaded content" 
                            className="w-full h-auto max-h-60 object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
                            onClick={() => handleImageClick(message?.image ?? '')}
                        />
                    </div>
                )}
                <div className="text-sm sm:text-base">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}
                        components={{
                            code({node, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                return match ? (
                                    <div className="my-2 rounded-lg overflow-hidden">
                                        <div className="bg-slate-800 px-3 py-1 text-xs text-slate-400 border-b border-slate-700">
                                            {match[1]}
                                        </div>
                                        <pre className="bg-slate-900 p-3 text-sm text-slate-200 overflow-x-auto">
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        </pre>
                                    </div>
                                ) : (
                                    <code className="bg-slate-800 px-1 py-0.5 rounded text-sm" {...props}>
                                        {children}
                                    </code>
                                )
                            },
                            table({children}) {
                                return (
                                    <div className="my-2 overflow-x-auto">
                                        <table className="min-w-full border-collapse border border-slate-700 rounded-lg">
                                            {children}
                                        </table>
                                    </div>
                                )
                            },
                            th({children}) {
                                return (
                                    <th className="px-3 py-2 text-sm font-semibold text-slate-200 bg-slate-800 border border-slate-700">
                                        {children}
                                    </th>
                                )
                            },
                            td({children}) {
                                return (
                                    <td className="px-3 py-2 text-sm text-slate-200 border border-slate-700">
                                        {children}
                                    </td>
                                )
                            },
                            p({children}) {
                                return <p className="wrap-break-word mb-2 last:mb-0">{children}</p>
                            },
                            ul({children}) {
                                return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                            },
                            ol({children}) {
                                return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                            },
                            blockquote({children}) {
                                return (
                                    <blockquote className="border-l-4 border-slate-500 pl-4 italic text-slate-400 my-2">
                                        {children}
                                    </blockquote>
                                )
                            },
                            h1({children}) {
                                return <h1 className="text-2xl font-bold my-4">{children}</h1>
                            },
                            h2({children}) {
                                return <h2 className="text-xl font-bold my-3">{children}</h2>
                            },
                            h3({children}) {
                                return <h3 className="text-lg font-bold my-2">{children}</h3>
                            },
                            h4({children}) {
                                return <h4 className="text-md font-bold my-1">{children}</h4>
                            },
                            h5({children}) {
                                return <h5 className="text-sm font-bold my-1">{children}</h5>
                            },
                            h6({children}) {
                                return <h6 className="text-xs font-bold my-1">{children}</h6>
                            },
                        }}
                    >

                        {message.response}
                    </ReactMarkdown>
                    {message.isStreaming && (
                        <span className="
                            inline-block 
                            ml-1 
                            w-0.5
                            h-5 
                            bg-blue-500 
                            rounded-sm
                            animate-streaming-blink 
                            shadow-[0_0_8px_rgba(168,85,247,0.5)] 
                            vertical-align-middle" 
                            style={{ verticalAlign: 'middle', marginTop: '-2px' }}
                        />
                    )}
                    <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                    </p>

                    {
                        message.sender === 'ai' && message.metrics && !message.isStreaming && (
                            <MessageMetrics metrics={message.metrics} messageId={message.id} currentFeedback={message.feedback ?? null} onFeedback={onFeedback}/>
                        )
                    }
                </div>
            </div>
        </div>
    )
}