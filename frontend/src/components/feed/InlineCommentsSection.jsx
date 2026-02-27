import { memo } from "react";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCommentsController } from "../../hooks/useCommentsController";

function InlineCommentsSection({ postId, user, theme }) {
    const {
        comments,
        newComment,
        setNewComment,
        loading,
        replyingTo,
        setReplyingTo,
        expandedThreads,
        handleCommentSubmit,
        initiateReply,
        toggleThread,
    } = useCommentsController({ postId, user });

    const getAuthorHandle = (author) => {
        const raw = author?.username || author?.name || "user";
        return `@${String(raw).replace(/^@/, "").trim()}`;
    };

    return (
        <div className={`mt-2 border-t pt-3 space-y-3 ${theme === "dark" ? "border-slate-700/70" : "border-gray-200"}`}>
            <div className="max-h-64 overflow-y-auto pr-1 space-y-3">
                {loading ? (
                    <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>Loading comments...</p>
                ) : comments.length ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                            <img
                                src={comment.author?.profile_pic || `${import.meta.env.VITE_AVATAR_API_URL}?name=${encodeURIComponent(comment.author?.name || "User")}&background=random&size=28`}
                                alt={comment.author?.name || "User"}
                                className={`w-7 h-7 rounded-full object-cover ${theme === "dark" ? "bg-slate-700" : "bg-gray-200"}`}
                            />
                            <div className="min-w-0 flex-1">
                                <p className={`text-xs leading-relaxed wrap-break-word ${theme === "dark" ? "text-slate-200" : "text-gray-800"}`}>
                                    <span className="font-semibold mr-1">{getAuthorHandle(comment.author)}</span>
                                    {comment.text}
                                </p>
                                <div className="mt-1 flex items-center gap-3">
                                    <span className={`text-[11px] ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                                        {comment.createdAt
                                            ? formatDistanceToNow(
                                                new Date(comment.createdAt?.seconds ? comment.createdAt.seconds * 1000 : comment.createdAt),
                                                { addSuffix: true }
                                            )
                                            : "now"}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => initiateReply(comment.id, comment.author?.username || comment.author?.name || "user")}
                                        className={`text-[11px] font-semibold ${theme === "dark" ? "text-slate-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                                    >
                                        Reply
                                    </button>
                                </div>

                                {comment.replies?.length ? (
                                    <div className="mt-2">
                                        {!expandedThreads[comment.id] ? (
                                            <button
                                                type="button"
                                                onClick={() => toggleThread(comment.id)}
                                                className={`text-[11px] font-semibold ${theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-800"}`}
                                            >
                                                View {comment.replies.length} replies
                                            </button>
                                        ) : (
                                            <div className="mt-2 pl-3 border-l space-y-2 border-slate-300/50 dark:border-slate-700/70">
                                                {comment.replies.map((reply) => (
                                                    <p key={reply.id} className={`text-xs wrap-break-word ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                                                        <span className="font-semibold mr-1">{getAuthorHandle(reply.author)}</span>
                                                        {reply.text}
                                                    </p>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleThread(comment.id)}
                                                    className={`text-[11px] font-semibold ${theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-800"}`}
                                                >
                                                    Hide replies
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>No comments yet.</p>
                )}
            </div>

            <form onSubmit={handleCommentSubmit} className={`flex items-center gap-2 rounded-full px-3 py-2 border ${theme === "dark" ? "border-slate-700 bg-slate-800/70" : "border-gray-200 bg-gray-50"}`}>
                <input
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    placeholder={replyingTo ? `Replying to ${replyingTo.username}...` : "Add a comment..."}
                    className={`flex-1 bg-transparent text-sm outline-none ${theme === "dark" ? "text-slate-100 placeholder:text-slate-400" : "text-gray-900 placeholder:text-gray-500"}`}
                />
                {replyingTo ? (
                    <button
                        type="button"
                        onClick={() => {
                            setReplyingTo(null);
                            setNewComment("");
                        }}
                        className={`text-xs font-semibold ${theme === "dark" ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                    >
                        Cancel
                    </button>
                ) : null}
                <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className={`p-1 rounded-full disabled:opacity-50 ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`}
                    aria-label="Post comment"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}

export default memo(InlineCommentsSection);
