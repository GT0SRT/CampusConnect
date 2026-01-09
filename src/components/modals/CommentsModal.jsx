import { useState, useEffect, memo } from "react";
import { getComments, addComment, addReply } from "../../services/interactionService";
import { useUserStore } from "../../store/useUserStore";
import { X, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function CommentsModal({ postId, onClose }) {
  const { user } = useUserStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // LOGIC FOR INSTAGRAM STYLE REPLIES
  const [replyingTo, setReplyingTo] = useState(null); // { parentId, username }
  const [expandedThreads, setExpandedThreads] = useState({}); // Tracks which comments are expanded

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const data = await getComments(postId);
    setComments(data);
    setLoading(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    if (replyingTo) {
      // HANDLE REPLY
      await handleReplySubmit(replyingTo.parentId, newComment);
    } else {
      // HANDLE MAIN COMMENT
      try {
        const tempComment = {
          id: Date.now().toString(),
          text: newComment,
          createdAt: { seconds: Date.now() / 1000 },
          author: { name: user.name, profile_pic: user.profile_pic },
          replies: []
        };
        setComments([tempComment, ...comments]);
        setNewComment("");
        await addComment(user.uid, postId, newComment);
        fetchComments();
      } catch (error) {
        console.error("Failed to comment", error);
      }
    }
  };

  const handleReplySubmit = async (parentId, text) => {
    try {
      // Optimistic UI: Find parent and add reply
      setComments(prev => prev.map(c => {
        if (c.id === parentId) {
          const newReply = {
            id: Date.now().toString(),
            text: text,
            author: { name: user.name, profile_pic: user.profile_pic },
            createdAt: new Date().toISOString()
          };
          // Automatically expand the thread so we see our new reply
          setExpandedThreads(prev => ({ ...prev, [parentId]: true }));
          return { ...c, replies: [...(c.replies || []), newReply] };
        }
        return c;
      }));

      setNewComment("");
      setReplyingTo(null); // Reset mode

      await addReply(parentId, user, text);
    } catch (error) {
      console.error("Failed to reply", error);
    }
  };

  // Helper to set up the input box for a reply
  const initiateReply = (parentId, username) => {
    setReplyingTo({ parentId, username });
    setNewComment(`@${username} `); // Instagram style tag

    // Focus the input box (simple implementation)
    document.getElementById("comment-input")?.focus();
  };

  const toggleThread = (commentId) => {
    setExpandedThreads(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl flex flex-col h-[85vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">Comments</h3>
          <button onClick={onClose} aria-label="Close comments" className="p-1 hover:bg-gray-200 rounded-full"><X className="w-5 h-5 text-gray-700" /></button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading ? (
            <p className="text-center text-gray-400 py-10">Loading...</p>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                <img src={comment.author?.profile_pic || `${import.meta.env.VITE_AVATAR_API_URL}?name=User&background=random&size=40`} className="w-9 h-9 rounded-full object-cover bg-gray-200 border border-gray-100" />

                <div className="flex-1">
                  {/* Parent Comment */}
                  <div className="flex gap-2 items-baseline">
                    <span className="text-sm font-bold text-gray-900">{comment.author?.name}</span>
                    <span className="text-sm text-gray-800 leading-snug">{comment.text}</span>
                  </div>

                  {/* Action Line */}
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-600">
                      {comment.createdAt?.seconds ? formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: false }) : "now"}
                    </span>
                    <button
                      onClick={() => initiateReply(comment.id, comment.author.name)}
                      aria-label={`Reply to ${comment.author?.name}'s comment`}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900"
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
                          <div className="h-[1px] w-8 bg-gray-300 group-hover:bg-gray-400"></div>
                          <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-700">
                            View {comment.replies.length} more replies
                          </span>
                        </div>
                      ) : (
                        // 2. The Expanded Replies List
                        <div className="space-y-4 mt-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <img src={reply.author?.profile_pic} className="w-7 h-7 rounded-full object-cover bg-gray-200" />
                              <div className="flex-1">
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-sm font-bold text-gray-900">{reply.author?.name}</span>
                                  {/* Auto-highlight the @Username if present */}
                                  <span className="text-sm text-gray-800 leading-snug">
                                    {reply.text.split(" ").map((word, i) =>
                                      word.startsWith("@") ? <span key={i} className="text-blue-600 mr-1">{word}</span> : word + " "
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-xs text-gray-400">
                                    {/* Simple time logic since nested replies are strings in DB often */}
                                    Reply
                                  </span>
                                  <button
                                    onClick={() => initiateReply(comment.id, reply.author.name)}
                                    aria-label={`Reply to ${reply.author?.name}'s comment`}
                                    className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Hide Button */}
                          <div className="flex items-center gap-3 mt-2 cursor-pointer" onClick={() => toggleThread(comment.id)}>
                            <div className="h-[1px] w-8 bg-gray-300"></div>
                            <span className="text-xs font-semibold text-gray-400">Hide replies</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-400 flex flex-col items-center">
              <p>No comments yet.</p>
              <p className="text-xs mt-1">Start the conversation.</p>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t bg-white flex items-center gap-3">
          <img src={user?.profile_pic} className="w-8 h-8 rounded-full bg-gray-200 border border-gray-200" />
          <form onSubmit={handleCommentSubmit} className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-gray-300 transition">
            <input
              id="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? `Replying to ${replyingTo.username}...` : "Add a comment..."}
              className="flex-1 bg-transparent border-none text-sm focus:ring-0 outline-none placeholder:text-gray-500"
              autoComplete="off"
            />
            {replyingTo && (
              <button type="button" onClick={() => { setReplyingTo(null); setNewComment(""); }} aria-label="Cancel reply" className="text-xs font-bold text-gray-600 hover:text-gray-900">X</button>
            )}
            <button type="submit" disabled={!newComment.trim()} className="text-blue-600 font-semibold text-sm disabled:opacity-50 hover:text-blue-700">
              Post
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default memo(CommentsModal);