import { useEffect, useState } from "react";
import ThreadCard from "../components/threads/ThreadCard";
import { ThreadSkeleton } from "../components/common/SkeletonLoaders";
import { useUserStore } from "../store/useUserStore";
import { voteOnThread, getPaginatedThreads_API } from "../services/threadService";
import FeedTabs from "../components/feed/FeedTabs";

export default function Threads() {
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [votingThreads, setVotingThreads] = useState({});
  const [activeTab, setActiveTab] = useState("Global");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalThreads, setTotalThreads] = useState(0);
  const { user, theme } = useUserStore();
  const THREADS_PER_PAGE = 5;

  useEffect(() => {
    setThreads([]);
    setCurrentPage(1);
    const loadThreads = async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      await fetchThreads(1);
    };
    loadThreads();
  }, [activeTab]);

  const fetchThreads = async (page = 1) => {
    try {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      setError(null);

      // Backend pagination call (replace with real API endpoint later)
      // const response = await fetch(`/api/threads?page=${page}&limit=${THREADS_PER_PAGE}&category=${activeTab.toLowerCase()}`);
      // const data = await response.json();
      const data = await getPaginatedThreads_API(page, THREADS_PER_PAGE);

      if (page === 1) {
        setThreads(data.data);
      } else {
        setThreads(prev => [...prev, ...data.data]);
      }
      setCurrentPage(page);
      setHasMore(data.hasMore);
      setTotalThreads(data.total);
    } catch (err) {
      console.error("Error fetching threads:", err);
      setError(err.message || "Failed to load threads");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreThreads = () => {
    if (!isLoadingMore && hasMore) {
      fetchThreads(currentPage + 1);
    }
  };

  const handleVote = async (threadId, voteType) => {
    if (votingThreads[threadId] || !user?.uid) return;

    try {
      setVotingThreads(prev => ({ ...prev, [threadId]: true }));
      await voteOnThread(threadId, user.uid, voteType);
      await fetchThreads();
    } catch (err) {
      console.error("Error voting:", err);
      setError("Failed to vote");
    } finally {
      setVotingThreads(prev => ({ ...prev, [threadId]: false }));
    }
  };

  return (
    <div className={`space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-40 transition-colors bg-transparent'
      }`}>
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && <ThreadSkeleton count={2} />}

        {/* Error State */}
        {error && !isLoading && (
          <div className={`rounded-xl p-6 border backdrop-blur-xl transition-colors ${theme === 'dark'
            ? 'bg-red-500/10 border-red-500/30 text-red-300'
            : 'bg-red-50/60 border-red-200/50 text-red-700'
            }`}>
            <p className="font-medium mb-2">Error Loading Threads</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchThreads()}
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
                    `Load More (${threads.length}/${totalThreads})`
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
            <img
              className="h-48 md:h-64 opacity-75 mb-4"
              src="https://cdn.svgator.com/images/2024/04/book-with-broken-pages-animation-404-error.webp"
              alt="No threads found"
              width="300"
              height="300"
              loading="lazy"
            />
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