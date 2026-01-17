export default function LoadingIndicator() {
    return (
        <div className="flex justify-start items-center p-4">
            <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl shadow-sm">
                <div className="flex space-x-1.5 items-center h-4">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-duration:0.8s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.3s]"></div>
                </div>
            </div>
        </div>
    );
}