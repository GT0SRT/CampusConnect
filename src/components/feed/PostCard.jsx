import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Send, Trash2, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getAuth } from 'firebase/auth';
import { toggleBookmark, toggleLike, addComment } from '../../services/interactionService';
import { deletePost } from '../../services/postService';
import { useUserStore } from '../../store/useUserStore';
import CommentsModal from '../modals/CommentsModal';

export default function PostCard({ post, onPostDeleted }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const { user: userData, updateUser } = useUserStore();
  const [isLiked, setIsLiked] = useState(post.likedBy?.includes(user?.uid) || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [isSaved, setIsSaved] = useState(userData?.savedPosts?.includes(post.id) || false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleLike = async () => {
    if (!user) return alert("Please login to like");
    const newStatus = !isLiked;
    setIsLiked(newStatus);
    setLikesCount(prev => newStatus ? prev + 1 : prev - 1);

    try {
      await toggleLike(user.uid, post.id, !newStatus);
    } catch (error) {
      setIsLiked(!newStatus);
      setLikesCount(prev => !newStatus ? prev + 1 : prev - 1);
      console.error("Like failed", error);
    }
  };

  const handleBookmark = async () => {
    if (!user) return alert("Please login to save");

    setIsSaved(!isSaved);
    // Update store
    if (userData) {
      const updatedSavedPosts = isSaved
        ? userData.savedPosts?.filter(id => id !== post.id) || []
        : [...(userData.savedPosts || []), post.id];
      updateUser({ savedPosts: updatedSavedPosts });
    }

    try {
      await toggleBookmark(user.uid, post.id, isSaved);
    } catch (error) {
      setIsSaved(!isSaved);
      console.error("Bookmark failed", error);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      await deletePost(post.id, user.uid);
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete post");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    try {
      await addComment(user.uid, post.id, commentText);
      setCommentText("");
      setShowCommentInput(false);
      alert("Comment added!"); // Replace with toast notification later
    } catch (error) {
      console.error("Comment failed", error);
    }
  };

  // Safe Date Formatting
  const timeAgo = post.createdAt?.seconds
    ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true })
    : "Just now";

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm mb-4">

      {/* Header */}
      <div className="p-4 flex items-center gap-3 relative">
        <img
          src={post.author?.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || "User")}&background=random&size=40`}
          alt={post.author?.name}
          className="w-10 h-10 rounded-full object-cover bg-gray-200 border border-gray-100"
        />
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900">{post.author?.name || "Anonymous"}</p>
          <p className="text-xs text-gray-500 font-medium">
            {post.author?.campus || "General"} · {timeAgo}
          </p>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition"
          >
            <MoreVertical size={20} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              {user?.uid === post.uid && (
                <button
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg transition disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
              {user?.uid !== post.uid && (
                <button className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 text-sm">
                  Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="bg-gray-50 w-full flex justify-center">
          <img
            src={post.imageUrl}
            alt="Post content"
            className="w-full max-h-[500px] object-contain"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-gray-600">
          <div className='flex gap-6'>
            {/* LIKE BUTTON */}
            <div className='flex flex-col items-center justify-center'>
              <button
                onClick={handleLike}
                className={`transition-transform active:scale-90 hover:text-red-500 ${isLiked ? "text-red-500" : ""}`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
              </button>
              {likesCount}
            </div>

            {/* COMMENT TOGGLE */}
            <div className='flex flex-col items-center justify-center'>
              <button
                onClick={() => setShowCommentsModal(true)}
                className="hover:text-blue-500 transition"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
              {post.comments || 0}
            </div>

            {/* SHARE */}
            <button className="hover:text-green-500 mb-auto transition"><Share2 className="w-6 h-6" /></button>
          </div>

          {/* BOOKMARK */}
          <button
            onClick={handleBookmark}
            className={`hover:text-yellow-500 transition ${isSaved ? "text-yellow-500" : ""}`}
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Likes Count */}
        <p className="text-sm font-bold text-gray-900">{likesCount} likes</p>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-gray-800 leading-relaxed">
            <span className="font-semibold mr-2">{post.author?.name}</span>
            {post.caption}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Comment Input Box (Hidden by default) */}
        {showCommentInput && (
          <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center mt-3 pt-3 border-t border-gray-100">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 text-sm bg-gray-50 border-none rounded-full px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="text-blue-600 disabled:text-blue-300 font-semibold text-sm p-2"
            >
              Post
            </button>
          </form>
        )}
      </div>

      {/* RENDER MODAL OUTSIDE THE CARD */}
      {showCommentsModal && (
        <CommentsModal
          postId={post.id}
          onClose={() => setShowCommentsModal(false)}
        />
      )}
    </div>
  );
}