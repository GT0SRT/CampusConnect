import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronUp, ChevronDown, MessageCircle, Zap } from "lucide-react";

export default function ThreadCard({ thread, isDetailedView, onVote }) {
  const navigate = useNavigate();
  const authorName = typeof thread.author === "object" ? thread.author.name : thread.author;
  const authorPic = typeof thread.author === "object" ? thread.author.profile_pic : "";
  const discussionCount = thread.Discussion?.length || 0;
  const netVotes = (thread.upvotes?.length || 0) - (thread.downvotes?.length || 0);
  const voteDisplay = Number.isFinite(netVotes) ? netVotes : (thread.votes || 0);
  const [votingUp, setVotingUp] = useState(false);
  const [votingDown, setVotingDown] = useState(false);

  const handleCardClick = (e) => {
    // Don't navigate if clicking vote buttons
    if (e.target.closest(".vote-buttons")) return;

    if (!isDetailedView) {
      navigate(`/threads/${thread.id}`);
    }
  };

  const handleVote = async (type, e) => {
    e.stopPropagation();
    if (onVote) {
      if (type === "up") {
        setVotingUp(true);
        await onVote(thread.id, type);
        setVotingUp(false);
      } else {
        setVotingDown(true);
        await onVote(thread.id, type);
        setVotingDown(false);
      }
    }
  };

  // Regular feed view
  if (!isDetailedView) {
    return (
      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all cursor-pointer hover:shadow-lg hover:border-gray-300"
        onClick={handleCardClick}
      >
        <div className="flex gap-3 p-4">
          {/* Vote Section */}
          <div className="flex flex-col items-center justify-center gap-1 vote-buttons bg-gray-50 rounded-lg px-3 py-2 min-w-fit">
            <button
              onClick={(e) => handleVote("up", e)}
              disabled={votingUp}
              className="text-gray-600 hover:text-green-600 transition disabled:opacity-50"
              title="Upvote"
            >
              <ChevronUp size={20} className="font-bold" />
            </button>
            <span className="text-sm font-bold text-gray-800 min-w-[24px] text-center">
              {voteDisplay}
            </span>
            <button
              onClick={(e) => handleVote("down", e)}
              disabled={votingDown}
              className="text-gray-600 hover:text-red-600 transition disabled:opacity-50"
              title="Downvote"
            >
              <ChevronDown size={20} className="font-bold" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">{thread.title}</h3>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 truncate">
                {authorName} • {thread.branch} • {thread.campus} • {thread.batch}
              </p>
              <div className="flex items-center gap-1.5 ml-2 bg-blue-50 rounded-full px-2.5 py-1 flex-shrink-0">
                <MessageCircle size={14} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-600">{discussionCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detailed view
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Author Profile Section */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-4">
          {authorPic && (
            <img
              src={authorPic}
              alt={authorName}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
            />
          )}
          <div className="flex-1">
            <p className="text-lg font-bold text-gray-900">{authorName}</p>
            <p className="text-sm text-gray-600 mt-0.5">
              {thread.campus}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {thread.branch} • {thread.batch}
            </p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{thread.title}</h1>
      </div>

      {/* Description */}
      {thread.description && (
        <div className="px-6 py-4 prose prose-sm max-w-none text-gray-700 [&_img]:max-h-96 [&_img]:rounded-lg [&_img]:shadow-md">
          <div dangerouslySetInnerHTML={{ __html: thread.description }} />
        </div>
      )}

      {/* Stats */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">{discussionCount} {discussionCount === 1 ? "answer" : "answers"}</span>
        </div>
        <div className="flex items-center gap-2 vote-buttons bg-white rounded-lg px-3 py-2 border border-gray-200">
          <Zap size={16} className="text-amber-500" />
          <span className="text-sm font-semibold text-gray-700">
            {voteDisplay}
          </span>
          <button
            onClick={(e) => handleVote("up", e)}
            disabled={votingUp}
            className="text-gray-600 hover:text-green-600 transition disabled:opacity-50 ml-1"
            title="Upvote"
          >
            <ChevronUp size={18} />
          </button>
          <button
            onClick={(e) => handleVote("down", e)}
            disabled={votingDown}
            className="text-gray-600 hover:text-red-600 transition disabled:opacity-50"
            title="Downvote"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}