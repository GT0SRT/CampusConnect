import { useState } from "react";

/**
 * Reusable reply form for answers and nested replies
 */
export default function ReplyForm({
    replyToName,
    onSubmit,
    onCancel,
    isSubmitting = false,
    theme = 'dark',
    placeholder = "Write your reply (plain text)..."
}) {
    const [content, setContent] = useState("");

    const handleSubmit = () => {
        if (!content.trim()) return;
        onSubmit(content);
        setContent("");
    };

    return (
        <div className={`px-6 py-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            } border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
            }`}>
            <div className="mb-3">
                {replyToName && (
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        } mb-2`}>
                        Reply to {replyToName}
                    </label>
                )}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 border ${theme === 'dark'
                            ? 'border-gray-600 bg-gray-600 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                    rows="3"
                />
            </div>
            <div className="flex gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !content.trim()}
                    className={`px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                >
                    {isSubmitting ? "Posting..." : "Post Reply"}
                </button>
                <button
                    onClick={() => {
                        setContent("");
                        onCancel();
                    }}
                    className={`px-4 py-2 border ${theme === 'dark'
                            ? 'border-gray-600 bg-gray-600 hover:bg-gray-600'
                            : 'border-gray-300 bg-white hover:bg-gray-100'
                        } rounded-lg font-medium transition text-sm`}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
