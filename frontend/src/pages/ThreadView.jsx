import { useParams, Link } from "react-router-dom";
import SimpleEditor from '../components/threads/SimpleEditor';
import { ArrowLeft, MessageSquare, Reply, Zap, Bookmark, ChevronUp, ChevronDown } from "lucide-react";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";
import { toDateSafe, formatRelativeTime } from "../utils/dateUtils";
import { countReplies, useThreadViewController } from "../hooks/useThreadViewController";

function ThreadView() {
  const { thread_id } = useParams();
  const {
    user,
    theme,
    thread,
    loading,
    showAnswerForm,
    setShowAnswerForm,
    answerContent,
    setAnswerContent,
    submitingAnswer,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    submittingReply,
    votingAnswers,
    votingThread,
    openReplies,
    setOpenReplies,
    isSaved,
    handleVote,
    handleSaveThread,
    handleSubmitAnswer,
    handleSubmitReply,
    handleAnswerVote,
  } = useThreadViewController(thread_id);

  const getAuthorHandle = (author) => {
    const raw = author?.username || author?.name || author?.displayName || "user";
    return `@${String(raw).replace(/^@/, "").trim()}`;
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
          <div key={reply.id} className={`pl-6 border-l mt-3 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {replyAuthor?.profile_pic && (
                  <img
                    src={getOptimizedImageUrl(replyAuthor.profile_pic.slice(0, -3) + "webp", 'profile-small')}
                    alt={`${replyAuthor.name || replyAuthor.displayName || "User"}'s profile picture`}
                    width="32"
                    height="32"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{getAuthorHandle(replyAuthor)}</div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{formatRelativeTime(reply.createdAt || reply.timestamp)}</div>
                </div>
              </div>
              {user && (
                <button
                  onClick={() => {
                    const next = isReplyingHere ? null : { answerId: parentAnswerId, replyId: reply.id };
                    setReplyingTo(next);
                    setReplyContent("");
                  }}
                  className={`text-xs transition ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  Reply
                </button>
              )}
            </div>
            <p className={`mt-2 text-sm whitespace-pre-wrap wrap-break-word ${theme === 'dark' ? 'text-gray-100' : 'text-black'}`}>{reply.content || ""}</p>

            {isReplyingHere && (
              <div className="mt-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${theme === 'dark'
                    ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400'
                    : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-500'
                    }`}
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
                    aria-label="Cancel reply"
                    className={`px-3 py-2 rounded-lg text-sm transition ${theme === 'dark'
                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
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
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 h-96 animate-pulse">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-xl mx-auto pt-10 px-4">
        <div className="flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 overflow-hidden">
          <img
            className="w-full max-w-md"
            src="https://cdn.svgator.com/images/2024/04/book-with-broken-pages-animation-404-error.webp"
            alt="Thread not found - 404 error illustration"
            width="600"
            height="400"
            loading="lazy"
          />
          <div className="pb-8 px-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Thread not found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 mt-2">This topic might have been deleted or doesn't exist.</p>
            <Link to="/threads" className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition">
              Go back to Threads
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const authorName = typeof thread.author === "object" ? thread.author.name : thread.author;
  const authorUsername = typeof thread.author === "object" ? thread.author.username : "";
  const netThreadVotes = (thread.upvotes?.length || 0) - (thread.downvotes?.length || 0);
  const threadVoteDisplay = Number.isFinite(netThreadVotes) ? netThreadVotes : (thread.votes || 0);

  return (
    <div className="max-w-4xl mx-auto pb-32 px-4 md:px-0">
      {/* Back Button */}
      <Link to="/threads" className={`inline-flex items-center gap-2 mb-4 mt-4 transition
        ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back to Threads</span>
      </Link>

      {/* Main Thread Card */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden mb-6`}>
        {/* Author and Meta Info */}
        <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            {thread.author?.profile_pic && (
              <img
                src={getOptimizedImageUrl(thread.author.profile_pic.slice(0, -3) + "webp", 'profile-small')}
                alt={`${authorName}'s profile picture`}
                width="48"
                height="48"
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{authorName}</p>

              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                {authorUsername ? (
                  <Link
                    to={`/profile/${authorUsername}`}
                    className={`text-sm font-medium hover:underline ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`}
                  >
                    @{authorUsername}
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {formatRelativeTime(thread.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Title and Category */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{thread.title}</h1>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full whitespace-nowrap">
              {thread.category}
            </span>
          </div>
        </div>

        {/* Description */}
        {thread.description && (
          <div className={`px-6 py-4 prose prose-sm max-w-none ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} [&_img]:max-h-96 [&_img]:rounded-lg`}>
            <div dangerouslySetInnerHTML={{ __html: thread.description }} />
          </div>
        )}

        {/* Stats and Actions */}
        <div className={`px-6 py-4 flex items-center justify-between border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className={`flex items-center gap-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="flex items-center gap-1">
              <MessageSquare size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
              <span className="font-medium">{thread.Discussion?.length || 0} Answers</span>
            </div>
          </div>

          {/* Vote Section */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveThread}
              aria-label={isSaved ? "Unsave thread" : "Save thread"}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition ${isSaved
                ? (theme === 'dark'
                  ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700'
                  : 'bg-yellow-50 text-yellow-700 border-yellow-200')
                : (theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100')
                }`}
            >
              <Bookmark size={16} className={isSaved ? "fill-current" : ""} />
              {isSaved ? "Saved" : "Save"}
            </button>
            <span className={`text-sm font-semibold px-3 py-1 rounded-lg border ${theme === 'dark'
              ? 'text-gray-200 bg-gray-700 border-gray-600'
              : 'text-gray-700 bg-white border-gray-200'
              }`}>
              ⭐ {threadVoteDisplay} votes
            </span>
            <button
              onClick={() => handleVote(thread.id, "up")}
              disabled={votingThread}
              aria-label="Upvote thread"
              className={`p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                ? 'text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-green-400'
                : 'text-gray-600 bg-white hover:bg-gray-100 hover:text-green-600'
                }`}
              title="Upvote"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={() => handleVote(thread.id, "down")}
              disabled={votingThread}
              aria-label="Downvote thread"
              className={`p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                ? 'text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-red-400'
                : 'text-gray-600 bg-white hover:bg-gray-100 hover:text-red-600'
                }`}
              title="Downvote"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Answers ({thread.Discussion?.length || 0})
          </h2>
          {user && (
            <button
              onClick={() => setShowAnswerForm(!showAnswerForm)}
              aria-label={showAnswerForm ? "Cancel answer" : "Add answer"}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition text-sm"
            >
              {showAnswerForm ? "Cancel" : "Add Answer"}
            </button>
          )}
        </div>

        {/* Add Answer Form */}
        {showAnswerForm && user && (
          <div className={`rounded-xl border p-6 mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Write your answer</h3>
            <SimpleEditor
              onChange={setAnswerContent}
              initialContent={answerContent}
              placeholder="Share your insights, knowledge, or experience..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmitAnswer}
                disabled={submitingAnswer || !answerContent.trim()}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitingAnswer ? "Posting..." : "Post Answer"}
              </button>
              <button
                onClick={() => {
                  setShowAnswerForm(false);
                  setAnswerContent("");
                }}
                aria-label="Cancel answer"
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
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
                <div key={answer.id} className={`${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl overflow-hidden`}>
                  {/* Answer Header */}
                  <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {answer.author?.profile_pic && (
                          <img
                            src={getOptimizedImageUrl(answer.author.profile_pic.slice(0, -3) + "webp", 'profile-small')}
                            alt={`${answer.author.name}'s profile picture`}
                            width="40"
                            height="40"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{getAuthorHandle(answer.author)}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{formatRelativeTime(answer.createdAt)}</p>
                        </div>
                      </div>
                      {user && (
                        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${theme === 'dark'
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-200'
                          }`}>
                          <Zap size={14} className="text-amber-500" />
                          <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            {(answer.upvotes?.length || 0) - (answer.downvotes?.length || 0)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAnswerVote(answer.id, "up");
                            }}
                            disabled={votingAnswers[answer.id]}
                            aria-label="Upvote answer"
                            className={`transition disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                              ? 'text-gray-400 hover:text-green-400'
                              : 'text-gray-600 hover:text-green-600'
                              }`}
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
                            aria-label="Downvote answer"
                            className={`transition disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                              ? 'text-gray-400 hover:text-red-400'
                              : 'text-gray-600 hover:text-red-600'
                              }`}
                            title="Downvote"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Answer Content */}
                  <div className={`px-6 py-4 prose prose-sm max-w-none ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} [&_img]:max-h-96 [&_img]:rounded-lg`}>
                    <div dangerouslySetInnerHTML={{ __html: answer.content }} />
                  </div>

                  {/* Answer Actions */}
                  <div className={`px-6 py-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} flex items-center justify-between`}>
                    <div className={`flex items-center gap-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <button
                        onClick={() => setOpenReplies(prev => ({ ...prev, [answer.id]: !prev[answer.id] }))}
                        aria-label={openReplies[answer.id] ? "Hide replies" : `View replies (${countReplies(answer.replies) || 0})`}
                        className={`text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition`}
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
                        className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hover:text-blue-600 dark:hover:text-blue-400 transition`}
                      >
                        <Reply size={16} />
                        Reply
                      </button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo?.answerId === answer.id && !replyingTo?.replyId && user && (
                    <div className={`px-6 py-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="mb-3">
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Reply to {getAuthorHandle(answer.author)}
                        </label>
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write your reply (plain text)..."
                          className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                          rows="3"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSubmitReply(answer.id)}
                          disabled={submittingReply || !replyContent.trim()}
                          className={`px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                        >
                          {submittingReply ? "Posting..." : "Post Reply"}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent("");
                          }}
                          className={`px-4 py-2 border ${theme === 'dark' ? 'border-gray-600 bg-gray-600 hover:bg-gray-600' : 'border-gray-300 bg-white hover:bg-gray-100'} rounded-lg font-medium transition text-sm`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies List */}
                  {openReplies[answer.id] && answer.replies && answer.replies.length > 0 && (
                    <div className={`px-6 py-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase">
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
          <div className={`rounded-xl border border-dashed p-8 text-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
            <MessageSquare size={32} className={`mx-auto mb-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>No answers yet</p>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Be the first to answer this question!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThreadView;