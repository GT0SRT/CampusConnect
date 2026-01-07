import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronUp, ChevronDown, MessageCircle, Zap, Trash2, MoreVertical, Bookmark } from "lucide-react";
import { getAuth } from "firebase/auth";
import { deleteThread } from "../../services/threadService";
import { useUserStore } from "../../store/useUserStore";

export default function ThreadCard({ thread, isDetailedView, onVote, onThreadDeleted }) {
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const { user: userData, updateUser } = useUserStore();
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
        className="bg-white  rounded-lg border border-gray-200  p-4 hover:border-blue-400  hover:shadow-md transition cursor-pointer"
      >
        <div className="flex items-start gap-4">
          {/* Vote column */}
          <div className="vote-buttons flex flex-col items-center gap-2 bg-gray-50 rounded-lg px-2 py-2 border border-gray-200 shrink-0">
            <button
              onClick={(e) => handleVote("up", e)}
              disabled={votingUp}
              className="text-gray-600 hover:text-green-600 transition disabled:opacity-50"
              title="Upvote"
            >
              <ChevronUp size={18} />
            </button>
            <span className="text-sm font-semiboldtext-gray-800  min-w-6 text-center">
              {voteDisplay}
            </span>
            <button
              onClick={(e) => handleVote("down", e)}
              disabled={votingDown}
              className="text-gray-600  hover:text-red-600  transition disabled:opacity-50"
              title="Downvote"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900  mb-2 line-clamp-2 leading-tight">{thread.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {authorName} • {thread.branch} • {thread.campus} • {thread.batch}
                </p>
              </div>
              {/* Bookmark button */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await handleSaveThread();
                }}
                className={`p-2 rounded-full border transition ${isSaved ? "bg-yellow-50  text-yellow-600  border-yellow-200 " : "bg-white  text-gray-500  hover:bg-gray-50  border-gray-200 "}`}
                title={isSaved ? "Unsave" : "Save"}
              >
                <Bookmark size={16} className={isSaved ? "fill-current" : ""} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5  bg-blue-50 rounded-full px-2.5 py-1 shrink-0">
                <MessageCircle size={14} className="text-blue-600 " />
                <span className="text-xs font-semibold text-blue-600 ">{discussionCount}</span>
              </div>
              <span className="text-[11px] text-gray-500  ml-auto">{thread.createdAt?.toDate ? new Date(thread.createdAt.toDate()).toLocaleDateString() : "Recently"}</span>
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
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 relative">
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

          {/* Actions */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={async () => {
                await handleSaveThread();
              }}
              className={`p-2 rounded-full border transition ${isSaved ? "bg-yellow-50 text-yellow-600 border-yellow-200" : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200"}`}
              title={isSaved ? "Unsave" : "Save"}
            >
              <Bookmark size={18} className={isSaved ? "fill-current" : ""} />
            </button>

            {/* Delete/Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition"
              >
                <MoreVertical size={20} />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {currentUser?.uid === thread.uid && (
                    <button
                      onClick={handleDeleteThread}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      Delete Thread
                    </button>
                  )}
                  {currentUser?.uid !== thread.uid && (
                    <button className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 text-sm">
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
      <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">{discussionCount} {discussionCount === 1 ? "answer" : "answers"}</span>
          </div>
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






