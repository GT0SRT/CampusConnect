import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getThreadById, addAnswerToThread, addReplyToAnswer, voteOnThread, voteOnAnswer } from "../services/threadService";
import { toggleThreadBookmark } from "../services/interactionService";
import { useUserStore } from "../store/useUserStore";
import SimpleEditor from '../components/threads/SimpleEditor';
import { ArrowLeft, MessageSquare, Reply, ChevronUp, ChevronDown, Zap, Bookmark } from "lucide-react";

const toDateSafe = (value) => {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatRelativeTime = (value) => {
  const date = toDateSafe(value);
  if (!date) return "Recently";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffHr < 24) {
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${diffHr}h ago`;
  }

  if (diffDay === 1) return "1 day ago";
  if (diffDay < 7) return `${diffDay} days ago`;

  return date.toLocaleDateString();
};

function ThreadView() {
  const { thread_id } = useParams();
  const { user, updateUser } = useUserStore();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerContent, setAnswerContent] = useState("");
  const [submitingAnswer, setSubmittingAnswer] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [votingAnswers, setVotingAnswers] = useState({});
  const [votingThread, setVotingThread] = useState(false);
  const [openReplies, setOpenReplies] = useState({});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(!!user?.savedThreads?.includes(thread_id));
  }, [user?.savedThreads, thread_id]);

  useEffect(() => {
    fetchThread();
  }, [thread_id]);

  const fetchThread = async () => {
    try {
      setLoading(true);
      const data = await getThreadById(thread_id);
      setThread(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (threadId, voteType) => {
    if (votingThread || !user?.uid) return;

    try {
      setVotingThread(true);
      setThread(prevThread => {
        if (!prevThread) return prevThread;
        const upvotes = Array.isArray(prevThread.upvotes) ? [...prevThread.upvotes] : [];
        const downvotes = Array.isArray(prevThread.downvotes) ? [...prevThread.downvotes] : [];
        const inUp = upvotes.includes(user.uid);
        const inDown = downvotes.includes(user.uid);

        if (inUp || inDown) {
          if (inUp) upvotes.splice(upvotes.indexOf(user.uid), 1);
          if (inDown) downvotes.splice(downvotes.indexOf(user.uid), 1);
        } else {
          if (voteType === "up") upvotes.push(user.uid);
          if (voteType === "down") downvotes.push(user.uid);
        }

        const votes = upvotes.length - downvotes.length;

        return {
          ...prevThread,
          upvotes,
          downvotes,
          votes
        };
      });

      await voteOnThread(threadId, user.uid, voteType);
    } catch (error) {
      console.error("Error voting:", error);
      // Revert optimistic update on error
      await fetchThread();
    } finally {
      setVotingThread(false);
    }
  };

  const handleSaveThread = async () => {
    if (!user?.uid) {
      alert("Please login to save");
      return;
    }

    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    // optimistic update to store
    const currentSaved = user.savedThreads || [];
    const updatedSaved = nextSaved
      ? (currentSaved.includes(thread_id) ? currentSaved : [...currentSaved, thread_id])
      : currentSaved.filter(id => id !== thread_id);
    updateUser({ savedThreads: updatedSaved });

    try {
      await toggleThreadBookmark(user.uid, thread_id, isSaved);
    } catch (error) {
      console.error("Error saving thread:", error);
      // revert
      setIsSaved(!nextSaved);
      updateUser({ savedThreads: currentSaved });
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerContent.trim() || !user) return;

    try {
      setSubmittingAnswer(true);
      const tempId = `${Date.now()}`;
      const newAnswer = {
        id: tempId,
        uid: user.uid,
        author: {
          name: user.name || user.displayName || "User",
          profile_pic: user.profile_pic || user.photoURL || ""
        },
        content: answerContent,
        createdAt: new Date().toISOString(),
        replies: [],
        votes: 0,
        upvotes: [],
        downvotes: []
      };

      setThread(prev => {
        if (!prev) return prev;
        const discussion = Array.isArray(prev.Discussion) ? [...prev.Discussion, newAnswer] : [newAnswer];
        return { ...prev, Discussion: discussion };
      });

      setAnswerContent("");
      setShowAnswerForm(false);

      const newId = await addAnswerToThread(thread_id, user.uid, answerContent, user);

      if (newId && newId !== tempId) {
        // sync the optimistic id with the backend-generated id
        setThread(prev => {
          if (!prev) return prev;
          const discussion = (prev.Discussion || []).map(ans => ans.id === tempId ? { ...ans, id: newId } : ans);
          return { ...prev, Discussion: discussion };
        });
      }
    } catch (error) {
      console.error("Error adding answer:", error);
      alert("Failed to add answer");
      await fetchThread();
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleSubmitReply = async (answerId, parentReplyId = null) => {
    if (!replyContent.trim() || !user) return;

    try {
      setSubmittingReply(true);
      const tempId = `${Date.now()}`;
      const newReply = {
        id: tempId,
        uid: user.uid,
        author: {
          name: user.name || user.displayName || "User",
          profile_pic: user.profile_pic || user.photoURL || ""
        },
        content: replyContent,
        createdAt: new Date().toISOString(),
        parentId: parentReplyId,
        replies: []
      };

      const insertLocalReply = (targetReplies = []) => {
        if (!parentReplyId) return [...targetReplies, newReply];
        return targetReplies.map(r => {
          if (r.id === parentReplyId) {
            return { ...r, replies: [...(r.replies || []), newReply] };
          }
          return { ...r, replies: r.replies ? insertLocalReply(r.replies) : [] };
        });
      };

      // Optimistic UI update
      setThread(prev => {
        if (!prev) return prev;
        const discussion = (prev.Discussion || []).map(ans => {
          if (ans.id !== answerId) return ans;
          const updatedReplies = insertLocalReply(ans.replies || []);
          return { ...ans, replies: updatedReplies };
        });
        return { ...prev, Discussion: discussion };
      });

      setReplyContent("");
      setReplyingTo(null);
      setOpenReplies(prev => ({ ...prev, [answerId]: true }));

      const newId = await addReplyToAnswer(thread_id, answerId, user.uid, replyContent, user, parentReplyId);

      if (newId && newId !== tempId) {
        // sync optimistic id with backend id
        const syncIds = (items = []) => items.map(r => {
          const nested = r.replies ? syncIds(r.replies) : [];
          if (r.id === tempId) return { ...r, id: newId, replies: nested };
          return { ...r, replies: nested };
        });

        setThread(prev => {
          if (!prev) return prev;
          const discussion = (prev.Discussion || []).map(ans => {
            if (ans.id !== answerId) return ans;
            return { ...ans, replies: syncIds(ans.replies || []) };
          });
          return { ...prev, Discussion: discussion };
        });
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      alert("Failed to add reply");
      await fetchThread();
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleAnswerVote = async (answerId, voteType) => {
    if (votingAnswers[answerId] || !user?.uid) return;

    try {
      setVotingAnswers(prev => ({ ...prev, [answerId]: true }));
      setThread(prevThread => {
        if (!prevThread) return prevThread;
        const updatedDiscussion = prevThread.Discussion.map(answer => {
          if (answer.id !== answerId) return answer;

          const upvotes = Array.isArray(answer.upvotes) ? [...answer.upvotes] : [];
          const downvotes = Array.isArray(answer.downvotes) ? [...answer.downvotes] : [];
          const inUp = upvotes.includes(user.uid);
          const inDown = downvotes.includes(user.uid);

          if (inUp || inDown) {
            if (inUp) upvotes.splice(upvotes.indexOf(user.uid), 1);
            if (inDown) downvotes.splice(downvotes.indexOf(user.uid), 1);
          } else {
            if (voteType === "up") upvotes.push(user.uid);
            if (voteType === "down") downvotes.push(user.uid);
          }

          return {
            ...answer,
            upvotes,
            downvotes,
            votes: upvotes.length - downvotes.length
          };
        });
        return { ...prevThread, Discussion: updatedDiscussion };
      });

      await voteOnAnswer(thread_id, answerId, user.uid, voteType);
    } catch (error) {
      console.error("Error voting on answer:", error);
      // Revert optimistic update on error
      await fetchThread();
    } finally {
      setVotingAnswers(prev => ({ ...prev, [answerId]: false }));
    }
  };

  const countReplies = (replies = []) => {
    return replies.reduce((acc, reply) => acc + 1 + countReplies(reply.replies || []), 0);
  };

  const renderReplies = (replies = [], parentAnswerId) => {
    return replies
      .sort((a, b) => {
        const dateA = toDateSafe(a.createdAt || a.timestamp);
        const dateB = toDateSafe(b.createdAt || b.timestamp);
        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
      })
      .map((reply) => {
        const replyAuthor = reply.author || reply.user;
        const nestedReplies = reply.replies || [];
        const isReplyingHere = replyingTo?.replyId === reply.id;

        return (
          <div key={reply.id} className="pl-6 border-l border-gray-200 mt-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {replyAuthor?.profile_pic && (
                  <img
                    src={replyAuthor.profile_pic}
                    alt={replyAuthor.name || replyAuthor.displayName || "User"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="text-sm font-semibold text-gray-900">{replyAuthor?.name || replyAuthor?.displayName || "User"}</div>
                  <div className="text-xs text-gray-500">{formatRelativeTime(reply.createdAt || reply.timestamp)}</div>
                </div>
              </div>
              {user && (
                <button
                  onClick={() => {
                    const next = isReplyingHere ? null : { answerId: parentAnswerId, replyId: reply.id };
                    setReplyingTo(next);
                    setReplyContent("");
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Reply
                </button>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap break-words">{reply.content || ""}</p>

            {isReplyingHere && (
              <div className="mt-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows="3"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleSubmitReply(parentAnswerId, reply.id)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={submittingReply || !replyContent.trim()}
                  >
                    {submittingReply ? "Posting..." : "Reply"}
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent("");
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {nestedReplies.length > 0 && (
              <div className="mt-3 ml-4">
                {renderReplies(nestedReplies, parentAnswerId)}
              </div>
            )}
          </div>
        );
      });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 pt-4 px-4">
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="bg-white rounded-xl p-4 h-96 animate-pulse">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-xl mx-auto pt-10 px-4">
        <div className="flex flex-col items-center justify-center text-center bg-white rounded-xl border border-dashed border-gray-200 overflow-hidden">
          <img
            className="w-full max-w-md"
            src="https://cdn.svgator.com/images/2024/04/book-with-broken-pages-animation-404-error.gif"
            alt="Thread not found"
          />
          <div className="pb-8 px-4">
            <h2 className="text-xl font-bold text-gray-800">Thread not found</h2>
            <p className="text-gray-500 mb-6 mt-2">This topic might have been deleted or doesn't exist.</p>
            <Link to="/threads" className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition">
              Go back to Threads
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const authorName = typeof thread.author === "object" ? thread.author.name : thread.author;
  const netThreadVotes = (thread.upvotes?.length || 0) - (thread.downvotes?.length || 0);
  const threadVoteDisplay = Number.isFinite(netThreadVotes) ? netThreadVotes : (thread.votes || 0);

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 md:px-0">
      {/* Back Button */}
      <Link to="/threads" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4 mt-4 transition">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back to Threads</span>
      </Link>

      {/* Main Thread Card */}
      <div className="bg-white rounded-xl overflow-hidden mb-6">
        {/* Author and Meta Info */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {thread.author?.profile_pic && (
              <img
                src={thread.author.profile_pic}
                alt={authorName}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{authorName}</p>
              <div className="flex text-xs text-gray-500 flex-wrap">
                <span className="px-2 py-1 text-gray-500 rounded">{thread.campus}</span>
                <span className="mt-1">•</span>
                <span className="px-2 py-1 text-gray-500 rounded">{thread.branch}</span>
                <span className="mt-1">•</span>
                <span className="px-2 py-1 text-gray-500 rounded">{thread.batch}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {formatRelativeTime(thread.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Title and Category */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{thread.title}</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full whitespace-nowrap">
              {thread.category}
            </span>
          </div>
        </div>

        {/* Description */}
        {thread.description && (
          <div className="px-6 py-4 prose prose-sm max-w-none text-gray-700 [&_img]:max-h-96 [&_img]:rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: thread.description }} />
          </div>
        )}

        {/* Stats and Actions */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MessageSquare size={18} className="text-blue-600" />
              <span className="font-medium">{thread.Discussion?.length || 0} Answers</span>
            </div>
          </div>

          {/* Vote Section */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveThread}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition ${isSaved
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
            >
              <Bookmark size={16} className={isSaved ? "fill-current" : ""} />
              {isSaved ? "Saved" : "Save"}
            </button>
            <span className="text-sm font-semibold text-gray-700 px-3 py-1 bg-white rounded-lg border">
              ⭐ {threadVoteDisplay} votes
            </span>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Answers ({thread.Discussion?.length || 0})
          </h2>
          {user && (
            <button
              onClick={() => setShowAnswerForm(!showAnswerForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
            >
              {showAnswerForm ? "Cancel" : "Add Answer"}
            </button>
          )}
        </div>

        {/* Add Answer Form */}
        {showAnswerForm && user && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Write your answer</h3>
            <SimpleEditor
              onChange={setAnswerContent}
              initialContent={answerContent}
              placeholder="Share your insights, knowledge, or experience..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmitAnswer}
                disabled={submitingAnswer || !answerContent.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitingAnswer ? "Posting..." : "Post Answer"}
              </button>
              <button
                onClick={() => {
                  setShowAnswerForm(false);
                  setAnswerContent("");
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Answers List */}
        {thread.Discussion && thread.Discussion.length > 0 ? (
          <div className="space-y-4">
            {[...thread.Discussion]
              .sort((a, b) => {
                const votesA = (a.upvotes?.length || 0) - (a.downvotes?.length || 0);
                const votesB = (b.upvotes?.length || 0) - (b.downvotes?.length || 0);
                if (votesA !== votesB) return votesB - votesA;

                const timeA = toDateSafe(a.createdAt || a.timestamp)?.getTime() || 0;
                const timeB = toDateSafe(b.createdAt || b.timestamp)?.getTime() || 0;
                return timeA - timeB; // oldest first on tie
              })
              .map((answer) => (
                <div key={answer.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Answer Header */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {answer.author?.profile_pic && (
                          <img
                            src={answer.author.profile_pic}
                            alt={answer.author.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{answer.author?.name || "User"}</p>
                          <p className="text-xs text-gray-500">{formatRelativeTime(answer.createdAt)}</p>
                        </div>
                      </div>
                      {user && (
                        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
                          <Zap size={14} className="text-amber-500" />
                          <span className="text-xs font-semibold text-gray-700">
                            {(answer.upvotes?.length || 0) - (answer.downvotes?.length || 0)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAnswerVote(answer.id, "up");
                            }}
                            disabled={votingAnswers[answer.id]}
                            className="text-gray-600 hover:text-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Upvote"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAnswerVote(answer.id, "down");
                            }}
                            disabled={votingAnswers[answer.id]}
                            className="text-gray-600 hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Downvote"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Answer Content */}
                  <div className="px-6 py-4 prose prose-sm max-w-none text-gray-700 [&_img]:max-h-96 [&_img]:rounded-lg">
                    <div dangerouslySetInnerHTML={{ __html: answer.content }} />
                  </div>

                  {/* Answer Actions */}
                  <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <button
                        onClick={() => setOpenReplies(prev => ({ ...prev, [answer.id]: !prev[answer.id] }))}
                        className="text-gray-600 hover:text-blue-600 transition"
                      >
                        {openReplies[answer.id] ? "Hide replies" : `View replies (${countReplies(answer.replies) || 0})`}
                      </button>
                    </div>
                    {user && (
                      <button
                        onClick={() => {
                          const next = replyingTo?.answerId === answer.id && !replyingTo?.replyId
                            ? null
                            : { answerId: answer.id, replyId: null };
                          setReplyingTo(next);
                          setReplyContent("");
                          setOpenReplies(prev => ({ ...prev, [answer.id]: true }));
                        }}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition"
                      >
                        <Reply size={16} />
                        Reply
                      </button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo?.answerId === answer.id && !replyingTo?.replyId && user && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reply to {answer.author?.name}
                        </label>
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write your reply (plain text)..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          rows="3"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSubmitReply(answer.id)}
                          disabled={submittingReply || !replyContent.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {submittingReply ? "Posting..." : "Post Reply"}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent("");
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies List */}
                  {openReplies[answer.id] && answer.replies && answer.replies.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">
                        {countReplies(answer.replies)} {countReplies(answer.replies) === 1 ? "Reply" : "Replies"}
                      </p>
                      <div className="space-y-3 ml-2">
                        {renderReplies(answer.replies, answer.id)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <MessageSquare size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium">No answers yet</p>
            <p className="text-sm text-gray-500 mt-1">Be the first to answer this question!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThreadView;