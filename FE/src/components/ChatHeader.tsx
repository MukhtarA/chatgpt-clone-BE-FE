interface ChatHeaderProps {
    isConnected: boolean;
}

export default function ChatHeader({ isConnected }: ChatHeaderProps) {
    return (
        <div className="bg-slate-800 border-b border-slate-600 p-3 sm:p-4">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-200">ChatGPT Clone</h1>
            <div className="flex items-center mt-2">
                <div
                    className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <span className="text-sm text-yellow-500">
                    {isConnected ? 'Connected' : 'Disconnected'}
                </span>
            </div>
        </div>
    );
}