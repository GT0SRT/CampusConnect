import { useState, useEffect } from "react";
import CreateModal from "../components/modals/CreateModal";
import FeedTabs from "../components/feed/FeedTabs";
import PostCard from "../components/feed/PostCard";
import { PostSkeleton } from "../components/common/SkeletonLoaders";
import { useUserStore } from "../store/useUserStore";
import { getPaginatedFeed } from "../services/postService";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Global");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const { user, theme } = useUserStore();
  const POSTS_PER_PAGE = 5;

  // Fetch posts on tab change
  useEffect(() => {
    setPosts([]);
    setCurrentPage(1);
    fetchPosts(1);
  }, [activeTab]);

  const fetchPosts = async (page = 1) => {
    try {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      setError(null);

      // Backend pagination call (replace with real API endpoint later)
      // const response = await fetch(`/api/posts?page=${page}&limit=${POSTS_PER_PAGE}&category=${activeTab.toLowerCase()}`);
      // const data = await response.json();
      const data = await getPaginatedFeed(page, POSTS_PER_PAGE);

      if (page === 1) {
        setPosts(data.data);
      } else {
        setPosts(prev => [...prev, ...data.data]);
      }
      setCurrentPage(page);
      setHasMore(data.hasMore);
      setTotalPosts(data.total);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.message || "Failed to load posts");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMorePosts = () => {
    if (!isLoadingMore && hasMore) {
      fetchPosts(currentPage + 1);
    }
  };

  const handlePostCreated = async () => {
    // Refetch posts from first page after creation
    await fetchPosts(1);
  };

  return (
    <div className={`space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-40 transition-colors ${theme === 'dark' ? 'bg-transparent' : 'bg-transparent'
      }`}>
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && <PostSkeleton count={2} />}

        {/* Error State */}
        {error && !isLoading && (
          <div className={`rounded-xl p-6 border backdrop-blur-xl transition-colors ${theme === 'dark'
            ? 'bg-red-500/10 border-red-500/30 text-red-300'
            : 'bg-red-50/60 border-red-200/50 text-red-700'
            }`}>
            <p className="font-medium mb-2">Error Loading Posts</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchPosts()}
              className="px-4 py-2 rounded-lg bg-linear-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 transition text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Posts List */}
        {!isLoading && posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={() => fetchPosts(1)}
                isPriority={posts.indexOf(post) < 3}
              />
            ))}
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-6 pb-12">
                <button
                  onClick={loadMorePosts}
                  disabled={isLoadingMore}
                  className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${theme === 'dark'
                      ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed'
                      : 'bg-cyan-100/50 text-cyan-700 hover:bg-cyan-100/70 border border-cyan-200/50 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Load More (${posts.length}/${totalPosts})`
                  )}
                </button>
              </div>
            )}
          </>
        ) : !isLoading && !error ? (
          <div className={`rounded-xl p-12 border border-dashed backdrop-blur-sm transition-colors ${theme === 'dark'
            ? 'bg-slate-900/40 border-slate-700/30'
            : 'bg-white/40 border-gray-200/30'
            }`}>
            <p className={`text-center font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
              No posts found in {activeTab}
            </p>
            {activeTab !== "Global" && (
              <p className={`text-center text-xs mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                (Showing posts for {activeTab}: {user?.[activeTab.toLowerCase()] || "N/A"})
              </p>
            )}
            <div className="text-center mt-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-cyan-500 text-sm font-semibold hover:text-cyan-400 transition"
              >
                Create the first one!
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Create Post Modal */}
      {isModalOpen && (
        <CreateModal
          onClose={() => setIsModalOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
}