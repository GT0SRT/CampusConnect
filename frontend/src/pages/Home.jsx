import CreateModal from "../components/modals/CreateModal";
import PostDetailModal from "../components/modals/PostDetailsModal";
import FeedTabs from "../components/feed/FeedTabs";
import PostCard from "../components/feed/PostCard";
import { useHomeFeedController } from "../hooks/useHomeFeedController";
import { useState } from "react";

export default function Home() {
  const [selectedPost, setSelectedPost] = useState(null);
  const {
    user,
    theme,
    posts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    hasMore,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    loadMorePosts,
    reset,
    handlePostCreated,
  } = useHomeFeedController();

  return (
    <div className={`space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-40 transition-colors ${theme === 'dark' ? 'bg-transparent' : 'bg-transparent'
      }`}>
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="space-y-6">
        {isRefreshing && (
          <p className={`text-xs font-medium ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`}>
            Updating feed...
          </p>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className={`rounded-xl p-6 border backdrop-blur-xl transition-colors ${theme === 'dark'
            ? 'bg-red-500/10 border-red-500/30 text-red-300'
            : 'bg-red-50/60 border-red-200/50 text-red-700'
            }`}>
            <p className="font-medium mb-2">Error Loading Posts</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg bg-linear-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 transition text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Posts List */}
        {!isLoading && posts.length > 0 ? (
          <>
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={reset}
                isPriority={index < 3}
                onOpenDetails={setSelectedPost}
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
                    "Load more"
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

      {selectedPost ? (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      ) : null}
    </div>
  );
}



