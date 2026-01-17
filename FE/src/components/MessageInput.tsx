import { send } from "process";
import { useState } from "react";

interface MessageInputProps {
    inputMessage: string;
    setInputMessage: (message: string) => void;
    sendMessage: () => void;
    isConnected: boolean;
    isLoading: boolean;
    onImageUpload?: (file: File, message: string) => void;
}

export default function MessageInput({
    inputMessage,
    setInputMessage,
    sendMessage,
    isConnected,
    isLoading,
    onImageUpload,
}: MessageInputProps) {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        
        setSelectedImage(file);
        const reader = new FileReader();

        reader.onload = (e) => {
            setImagePreview(e?.target?.result as string);
        };

        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleImageSend = async () => {
        if (!selectedImage || !isConnected || isLoading || !onImageUpload) return;
        const message = inputMessage.trim();

        await onImageUpload(selectedImage, message);
        setSelectedImage(null);
        setImagePreview(null);
        setInputMessage('');
    }


    const removeSelectedImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    }

    const isImageMode = selectedImage !== null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            console.log(selectedImage)
            if (selectedImage) {
                handleImageSend()
            } else {
                sendMessage();
            }
        }
    }


    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 shadow-lg">
                {imagePreview && (
                    <div className="mb-3 p-6 bg-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-300">Image Preview:</span>                            
                            <button onClick={removeSelectedImage} className="text-red-500 hover:text-red-700">
                                Remove
                            </button>
                        </div>
                        <div className="flex items-center space-x-3">
                            <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                            <div className="flex-1">
                                <p className="text-sx text-slate-300">{selectedImage?.name}</p>
                                <p className="text-xs text-slate-400">{((selectedImage?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex space-x-2">
                    <label className="flex items-center px-3 py-2 bg-slate-700 text-slate-200 rounded-lg cursor-pointer hover:bg-slate-600">
                        <input 
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={!isConnected || isLoading}
                        />
                        <span>🏞️</span>
                    </label>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        disabled={!isConnected || isLoading}
                        className="flex-1 px-2 py-2 sm:px-4 text-sm sm:text-base border border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50 bg-slate-700 text-slate-200 placeholder-slate-400"
                    />
                    <button
                        onClick={isImageMode ? handleImageSend : sendMessage}
                        disabled={!isConnected || isLoading || (!inputMessage.trim() && !isImageMode)}
                        className="px-3 py-2 sm:px-6 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800"
                    >
                        {isLoading ? (
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <>
                                <span className="hidden sm:inline">
                                    {isImageMode ? 'Send Image' : 'Send'}
                                </span>
                                <span className="sm:hidden">➤</span>
                            </>
                        )}
                    </button>  
                </div>
            </div>
        </div>
    )
}