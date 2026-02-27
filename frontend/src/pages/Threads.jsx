import ThreadCard from "../components/threads/ThreadCard";
import FeedTabs from "../components/feed/FeedTabs";
import { useThreadsController } from "../hooks/useThreadsController";

export default function Threads() {
  const {
    theme,
    threads,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    hasMore,
    total,
    activeTab,
    setActiveTab,
    loadMoreThreads,
    reset,
    handleVote,
  } = useThreadsController();

  return (
    <div className="space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-40 transition-colors bg-transparent">
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="space-y-6">
        {isRefreshing && (
          <p className={`text-xs font-medium ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`}>
            Updating threads...
          </p>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className={`rounded-xl p-6 border backdrop-blur-xl transition-colors ${theme === 'dark'
            ? 'bg-red-500/10 border-red-500/30 text-red-300'
            : 'bg-red-50/60 border-red-200/50 text-red-700'
            }`}>
            <p className="font-medium mb-2">Error Loading Threads</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg bg-linear-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 transition text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Threads List */}
        {!isLoading && threads.length > 0 ? (
          <>
            {threads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onVote={handleVote}
              />
            ))}
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-6 pb-12">
                <button
                  onClick={loadMoreThreads}
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
                    total > 0 ? `Load More (${threads.length}/${total})` : `Load More (${threads.length})`
                  )}
                </button>
              </div>
            )}
          </>
        ) : !isLoading && !error ? (
          <div className={`flex min-h-[60vh] flex-col items-center justify-center text-center rounded-xl border border-dashed backdrop-blur-sm ${theme === 'dark'
            ? 'bg-slate-900/40 border-slate-700/30'
            : 'bg-white/40 border-gray-200/30'
            }`}>
            {/* <img
              className="h-48 md:h-64 opacity-75 mb-4"
              src="https://cdn.svgator.com/images/2024/04/book-with-broken-pages-animation-404-error.webp"
              alt="No threads found"
              width="300"
              height="300"
              loading="lazy"
            /> */}
            <p className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
              No threads found
            </p>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              Be the first to start a discussion
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}