import { memo } from "react";
import { useUserStore } from "../../store/useUserStore";
import { X, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCommentsController } from "../../hooks/useCommentsController";

function CommentsModal({ postId, onClose }) {
  const { user } = useUserStore();
  const theme = useUserStore((state) => state.theme);
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-2xl flex flex-col h-[85vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border ${theme === 'dark'
        ? 'bg-slate-900 border-slate-700/60'
        : 'bg-white border-gray-200/60'
        }`}>

        {/* Header */}
        <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark'
          ? 'bg-slate-800/60 border-slate-700/60'
          : 'bg-gray-50 border-gray-200/70'
          }`}>
          <h3 className={`font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>Comments</h3>
          <button
            onClick={onClose}
            aria-label="Close comments"
            className={`p-1 rounded-full transition ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
          >
            <X className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading ? (
            <p className={`text-center py-10 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>Loading...</p>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                <img
                  src={comment.author?.profile_pic || `${import.meta.env.VITE_AVATAR_API_URL}?name=User&background=random&size=40`}
                  className={`w-9 h-9 rounded-full object-cover border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-200 border-gray-100'}`}
                />

                <div className="flex-1">
                  {/* Parent Comment */}
                  <div className="flex gap-2 items-baseline">
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>{comment.author?.name}</span>
                    <span className={`text-sm leading-snug ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>{comment.text}</span>
                  </div>

                  {/* Action Line */}
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      {comment.createdAt?.seconds ? formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: false }) : "now"}
                    </span>
                    <button
                      onClick={() => initiateReply(comment.id, comment.author?.name)}
                      aria-label={`Reply to ${comment.author?.name}'s comment`}
                      className={`text-xs font-semibold transition ${theme === 'dark' ? 'text-slate-300 hover:text-slate-100' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Reply
                    </button>
                  </div>

                  {/* --- INSTAGRAM STYLE THREADING --- */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2">
                      {/* 1. The "View replies" Toggle Line */}
                      {!expandedThreads[comment.id] ? (
                        <div className="flex items-center gap-3 my-2 group cursor-pointer" onClick={() => toggleThread(comment.id)}>
                          <div className={`h-px w-8 ${theme === 'dark' ? 'bg-slate-500 group-hover:bg-slate-400' : 'bg-gray-300 group-hover:bg-gray-400'}`}></div>
                          <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-500 group-hover:text-slate-400' : 'text-slate-500 group-hover:text-slate-700'}`}>
                            View {comment.replies.length} more replies
                          </span>
                        </div>
                      ) : (
                        // 2. The Expanded Replies List
                        <div className="space-y-4 mt-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <img src={reply.author?.profile_pic} className={`w-7 h-7 rounded-full object-cover ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`} />
                              <div className="flex-1">
                                <div className="flex gap-2 items-baseline">
                                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>{reply.author?.name}</span>
                                  {/* Auto-highlight the @Username if present */}
                                  <span className={`text-sm leading-snug ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                                    {reply.text.split(" ").map((word, i) =>
                                      word.startsWith("@") ? <span key={i} className={`mr-1 ${theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'}`}>{word}</span> : <span key={i}>{word} </span>
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                                    {/* Simple time logic since nested replies are strings in DB often */}
                                    Reply
                                  </span>
                                  <button
                                    onClick={() => initiateReply(comment.id, reply.author?.name)}
                                    aria-label={`Reply to ${reply.author?.name}'s comment`}
                                    className={`text-xs font-semibold transition ${theme === 'dark' ? 'text-slate-300 hover:text-slate-100' : 'text-gray-600 hover:text-gray-900'}`}
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Hide Button */}
                          <div className="flex items-center gap-3 mt-2 cursor-pointer" onClick={() => toggleThread(comment.id)}>
                            <div className={`h-px w-8 ${theme === 'dark' ? 'bg-slate-500 hover:bg-slate-400' : 'bg-gray-300 hover:bg-gray-400'}`}></div>
                            <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-500 hover:text-slate-400' : 'text-slate-500 hover:text-slate-700'}`}>Hide replies</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-20 flex flex-col items-center ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>
              <p>No comments yet.</p>
              <p className="text-xs mt-1">Start the conversation.</p>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className={`p-3 border-t transition-all ${theme === 'dark'
          ? 'bg-slate-900/60 border-slate-700/50'
          : 'bg-white/60 border-gray-200/50'
          } flex items-center gap-3`}>
          <img src={user?.profile_pic} className={`w-8 h-8 rounded-full border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'
            }`} />
          <form onSubmit={handleCommentSubmit} className={`flex-1 flex items-center gap-2 rounded-full px-4 py-2 border transition ${theme === 'dark'
            ? 'bg-slate-800/60 border-slate-700/50 focus-within:border-cyan-500/50'
            : 'bg-gray-100/60 border-gray-200/50 focus-within:border-cyan-500/50'
            }`}>
            <input
              id="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? `Replying to ${replyingTo.username}...` : "Add a comment..."}
              className={`flex-1 bg-transparent border-none text-sm focus:ring-0 outline-none ${theme === 'dark'
                ? 'text-slate-100 placeholder:text-slate-400'
                : 'text-slate-900 placeholder:text-slate-500'
                }`}
              autoComplete="off"
            />
            {replyingTo && (
              <button type="button" onClick={() => { setReplyingTo(null); setNewComment(""); }} aria-label="Cancel reply" className={`text-xs font-bold transition ${theme === 'dark'
                ? 'text-slate-500 hover:text-slate-400'
                : 'text-slate-600 hover:text-slate-900'
                }`}>X</button>
            )}
            <button type="submit" disabled={!newComment.trim()} className={`text-sm font-semibold disabled:opacity-50 transition ${theme === 'dark'
              ? 'text-cyan-400 hover:text-cyan-300'
              : 'text-cyan-600 hover:text-cyan-700'
              }`}>
              Post
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default memo(CommentsModal);