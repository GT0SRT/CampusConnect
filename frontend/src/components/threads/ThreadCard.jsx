import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronUp, ChevronDown, MessageCircle, Zap, Trash2, MoreVertical, Bookmark } from "lucide-react";
import { getAuth } from "firebase/auth";
import { deleteThread } from "../../services/threadService";
import { useUserStore } from "../../store/useUserStore";
import { getOptimizedImageUrl } from "../../utils/imageOptimizer";

export default function ThreadCard({ thread, isDetailedView, onVote, onThreadDeleted }) {
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const { user: userData, updateUser } = useUserStore();
  const theme = useUserStore((state) => state.theme);
  const [isSaved, setIsSaved] = useState(userData?.savedThreads?.includes(thread.id) || false);
  const authorName = typeof thread.author === "object" ? thread.author.name : thread.author;
  const authorPic = typeof thread.author === "object" ? thread.author.profile_pic : "";
  const discussionCount = thread.Discussion?.length || 0;
  const netVotes = (thread.upvotes?.length || 0) - (thread.downvotes?.length || 0);
  const voteDisplay = Number.isFinite(netVotes) ? netVotes : (thread.votes || 0);
  const [votingUp, setVotingUp] = useState(false);
  const [votingDown, setVotingDown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteThread = async () => {
    if (!window.confirm("Are you sure you want to delete this thread?")) return;

    setIsDeleting(true);
    try {
      await deleteThread(thread.id, currentUser.uid);
      if (onThreadDeleted) onThreadDeleted(thread.id);
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete thread");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleSaveThread = async () => {
    if (!currentUser) return alert("Please login to save");

    setIsSaved(!isSaved);
    if (userData) {
      const updatedSavedThreads = isSaved
        ? userData.savedThreads?.filter(id => id !== thread.id) || []
        : [...(userData.savedThreads || []), thread.id];
      updateUser({ savedThreads: updatedSavedThreads });
    }

    try {
      const { toggleThreadBookmark } = await import("../../services/interactionService");
      await toggleThreadBookmark(currentUser.uid, thread.id, isSaved);
    } catch (error) {
      setIsSaved(!isSaved);
      console.error("Save failed", error);
    }
  };
  if (!isDetailedView) {
    return (
      <div
        onClick={handleCardClick}
        className={`${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition cursor-pointer`}
      >
        <div className="flex items-start gap-4">
          {/* Vote column */}
          <div className={`vote-buttons flex flex-col items-center gap-2 rounded-lg px-2 py-2 border shrink-0 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <button
              onClick={(e) => handleVote("up", e)}
              disabled={votingUp}
              aria-label="Upvote thread"
              className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition disabled:opacity-50"
              title="Upvote"
            >
              <ChevronUp size={18} />
            </button>
            <span className={`text-sm font-semibold min-w-6 text-center ${theme === 'dark' ? 'text-gray-200' : 'text-black'}`}>
              {voteDisplay}
            </span>
            <button
              onClick={(e) => handleVote("down", e)}
              disabled={votingDown}
              aria-label="Downvote thread"
              className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition disabled:opacity-50"
              title="Downvote"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-bold mb-2 line-clamp-2 leading-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{thread.title}</h3>
                <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {authorName} • {thread.branch} • {thread.campus} • {thread.batch}
                </p>
              </div>
              {/* Bookmark button */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await handleSaveThread();
                }}
                aria-label={isSaved ? "Unsave thread" : "Save thread"}
                className={`p-2 rounded-full border transition ${isSaved ? (theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-50 text-yellow-600 border-yellow-200') : (theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600' : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200')}`}
                title={isSaved ? "Unsave" : "Save"}
              >
                <Bookmark size={16} className={isSaved ? "fill-current" : ""} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5 bg-blue-50 rounded-full px-2.5 py-1 shrink-0">
                <MessageCircle size={14} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-600">{discussionCount}</span>
              </div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 ml-auto">{thread.createdAt?.toDate ? new Date(thread.createdAt.toDate()).toLocaleDateString() : "Recently"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detailed view
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl overflow-hidden transition-colors`}>
      {/* Author Profile Section */}
      <div className={`px-6 py-5 border-b relative ${theme === 'dark' ? 'border-gray-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center gap-4">
          {authorPic && (
            <img
              src={getOptimizedImageUrl(authorPic.slice(0, -3) + "webp", 'profile-small')}
              alt={`${authorName}'s profile picture`}
              width="64"
              height="64"
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
            />
          )}
          <div className="flex-1">
            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{authorName}</p>
            <p className={`text-sm mt-0.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {thread.campus}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {thread.branch} • {thread.batch}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={async () => {
                await handleSaveThread();
              }}
              aria-label={isSaved ? "Unsave thread" : "Save thread"}
              className={`p-2 rounded-full border transition ${isSaved ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700" : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600"}`}
              title={isSaved ? "Unsave" : "Save"}
            >
              <Bookmark size={18} className={isSaved ? "fill-current" : ""} />
            </button>

            {/* Delete/Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Thread options menu"
                className="text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <MoreVertical size={20} />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50">
                  {currentUser?.uid === thread.uid && (
                    <button
                      onClick={handleDeleteThread}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      Delete Thread
                    </button>
                  )}
                  {currentUser?.uid !== thread.uid && (
                    <button aria-label="Report thread" className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm">
                      Report Thread
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Stats */}
      <div className={`px-6 py-4 border-t  ${theme === 'dark' ? 'border-gray-700 bg-gradient-to-r from-gray-700 to-gray-700' : 'border-gray-200 bg-white'} flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-blue-600" />
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-black'}`}>{discussionCount} {discussionCount === 1 ? "answer" : "answers"}</span>
          </div>
        </div>
        <div className={`flex items-center gap-2 vote-buttons rounded-lg px-3 py-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
          <Zap size={16} className="text-amber-500" />
          <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-black'}`}>
            {voteDisplay}
          </span>
          <button
            onClick={(e) => handleVote("up", e)}
            disabled={votingUp}
            aria-label="Upvote thread"
            className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition disabled:opacity-50 ml-1"
            title="Upvote"
          >
            <ChevronUp size={18} />
          </button>
          <button
            onClick={(e) => handleVote("down", e)}
            disabled={votingDown}
            aria-label="Downvote thread"
            className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition disabled:opacity-50"
            title="Downvote"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}






