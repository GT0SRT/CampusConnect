import { useState, lazy, Suspense } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Send, Trash2, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { memo } from 'react';
import { toggleBookmark, toggleLike, addComment } from '../../services/interactionService';
import { deletePost } from '../../services/postService';
import { useUserStore } from '../../store/useUserStore';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

// Lazy load modal
const CommentsModal = lazy(() => import('../modals/CommentsModal'));

function PostCard({ post, onPostDeleted, isPriority = false }) {
  const { user: userData, updateUser } = useUserStore();
  const user = userData;
  const theme = useUserStore((state) => state.theme);
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
      alert("Comment added!");
    } catch (error) {
      console.error("Comment failed", error);
    }
  };

  // Safe Date Formatting
  const timeAgo = post.createdAt?.seconds
    ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true })
    : "Just now";

  return (
    <div className={`rounded-xl overflow-hidden mb-4 transition-all duration-300 ${theme === 'dark'
        ? 'bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl'
        : 'bg-white/60 border border-gray-200/50 backdrop-blur-xl'
      }`}>

      {/* Header */}
      <div className="p-4 flex items-center gap-3 relative">
        <img
          src={
            post.author?.profile_pic
              ? getOptimizedImageUrl(post.author.profile_pic.slice(0, -3) + "webp", 'profile-small')
              : `${import.meta.env.VITE_AVATAR_API_URL}?name=${encodeURIComponent(post.author?.name || "User")}&background=random&size=40`
          }
          alt={`${post.author?.name || "User"}'s profile picture`}
          width="40"
          height="40"
          className="w-10 h-10 rounded-full object-cover bg-gray-200 border border-gray-100"
        />
        <div className="flex-1">
          <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{post.author?.name || "Anonymous"}</p>
          <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {post.author?.campus || "General"} · {timeAgo}
          </p>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Post options menu"
            className="text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <MoreVertical size={20} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50">
              {user?.uid === post.uid && (
                <button
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 rounded-lg transition disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
              {user?.uid !== post.uid && (
                <button aria-label="Report post" className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm">
                  Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="w-full aspect-4/3 bg-gray-50 dark:bg-gray-700 overflow-hidden">
          <img
            src={getOptimizedImageUrl(post.imageUrl.slice(0, -3) + "webp", 'feed')}
            srcSet={`
              ${getOptimizedImageUrl(post.imageUrl.slice(0, -3) + "webp", 'feed')} 800w,
              ${getOptimizedImageUrl(post.imageUrl.slice(0, -3) + "webp", 'post')} 1200w
            `}
            sizes="(max-width: 768px) 100vw, 800px"
            alt={post.caption || `Post by ${post.author?.name || "User"}`}
            width="600"
            height="450"
            className="w-full h-full object-cover"
            loading={isPriority ? "eager" : "lazy"}
            fetchPriority={isPriority ? "high" : "auto"}
            decoding="async"
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className={`flex items-center justify-between ${theme === 'dark' ? 'text-gray-300' : 'text-black'}`}>
          <div className='flex gap-6'>
            {/* LIKE BUTTON */}
            <div className='flex flex-col items-center justify-center'>
              <button
                onClick={handleLike}
                aria-label={isLiked ? "Unlike post" : "Like post"}
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
                aria-label="View comments"
                className="hover:text-blue-500 transition"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
              {post.commentsCount || 0}
            </div>

            {/* SHARE */}
            <button aria-label="Share post" className="hover:text-green-500 mb-auto transition"><Share2 className="w-6 h-6" /></button>
          </div>

          {/* BOOKMARK */}
          <button
            onClick={handleBookmark}
            aria-label={isSaved ? "Remove bookmark" : "Bookmark post"}
            className={`hover:text-yellow-500 transition ${isSaved ? "text-yellow-500" : ""}`}
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Likes Count */}
        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{likesCount} likes</p>

        {/* Caption */}
        {post.caption && (
          <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-200' : 'text-black'}`}>
            <span className="font-semibold mr-2">{post.author?.name}</span>
            {post.caption}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Comment Input Box (Hidden by default) */}
        {showCommentInput && (
          <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 text-sm bg-gray-50 dark:bg-gray-700 border-none rounded-full px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-400 dark:placeholder-gray-300 text-gray-900 dark:text-white"
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
        <Suspense fallback={null}>
          <CommentsModal
            postId={post.id}
            onClose={() => setShowCommentsModal(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default memo(PostCard);