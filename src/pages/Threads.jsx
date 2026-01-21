import { useEffect, useState, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import ThreadCard from "../components/threads/ThreadCard";
import { ThreadSkeleton, LoadingPagination, PaginationError } from "../components/common/SkeletonLoaders";
import { useLayeredThreads, usePrefetchThreads, useInvalidateCache } from "../hooks/useLayeredData";
import { useUserStore } from "../store/useUserStore";
import { voteOnThread } from "../services/threadService";
import FeedTabs from "../components/feed/FeedTabs";

/**
 * THREADS PAGE WITH OPTIMIZED DATA LOADING
 * 
 * Same optimization strategy as Home.jsx:
 * 
 * 1. CURSOR-BASED PAGINATION (10 items per page)
 *    - Replaces fetching ALL threads at once
 *    - Memory efficient, fast initial load
 * 
 * 2. LAYERED LOADING (3 phases)
 *    - Show skeleton immediately
 *    - Fetch minimal thread data (title, vote count, category)
 *    - Load full discussion/replies in background
 * 
 * 3. REACT QUERY CACHING
 *    - 5-minute stale time
 *    - Automatic refetch on window focus
 *    - Infinite scroll with cursor pagination
 * 
 * 4. CLIENT-SIDE FILTERING by tab
 *    - No extra queries for tab switches
 *    - Instant tab switching after first page loads
 */

export default function Threads() {
  // State for voting (local optimistic updates)
  const [votingThreads, setVotingThreads] = useState({});

  // Tab selection
  const [activeTab, setActiveTab] = useState("Global");

  // User data
  const { user } = useUserStore();

  // LAYER 1 + 2: Fetch paginated threads with React Query
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch
  } = useLayeredThreads(10); // 10 items per page

  // Setup prefetching
  const { prefetchNextPage } = usePrefetchThreads();

  // Get cache invalidation
  const { invalidateThreads } = useInvalidateCache();

  // Infinite scroll sentinel
  const { ref: bottomRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  });

  // Fetch next page when user scrolls to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  /**
   * Flatten paginated data into single array
   */
  const allThreads = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.items);
  }, [data]);

  /**
   * CLIENT-SIDE FILTERING by tab
   * Same logic as posts - filter already-loaded data for instant switching
   */
  const filteredThreads = useMemo(() => {
    return allThreads.filter((thread) => {
      if (activeTab === "Global") return true;
      if (!user) return false;

      if (activeTab === "Campus") {
        return thread.campus?.toLowerCase() === user.campus?.toLowerCase();
      }

      if (activeTab === "Branch") {
        return thread.branch?.toLowerCase() === user.branch?.toLowerCase();
      }

      if (activeTab === "Batch") {
        return thread.batch === user.batch;
      }

      return true;
    });
  }, [allThreads, activeTab, user]);

  /**
   * Handle voting on a thread
   * Uses optimistic updates: update UI immediately, sync to database in background
   * 
   * Pattern:
   * 1. Show vote immediately (responsive UI)
   * 2. Send to database
   * 3. If fails, revert vote and show error
   */
  /**
   * Handle thread creation
   * Invalidates cache so fresh data refetches automatically
   */
  const handleThreadCreated = async () => {
    await invalidateThreads();
  };

  const handleVote = async (threadId, voteType) => {
    if (votingThreads[threadId] || !user?.uid) return;

    try {
      // Optimistic update - immediately show the vote
      setVotingThreads(prev => ({ ...prev, [threadId]: true }));

      // Send to database (this may take 100-500ms)
      await voteOnThread(threadId, user.uid, voteType);

      // Success - invalidate cache to sync any changes
      await invalidateThreads();

    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to vote. Please try again.");
      // Refetch to revert the optimistic update
      await refetch();
    } finally {
      setVotingThreads(prev => ({ ...prev, [threadId]: false }));
    }
  };

  return (
    <div className="space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-40">
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="space-y-6">
        {/* PHASE 1: SKELETON LOADING */}
        {isLoading && (
          <ThreadSkeleton count={2} />
        )}

        {/* ERROR STATE */}
        {error && (
          <PaginationError
            error={error}
            onRetry={() => refetch()}
          />
        )}

        {/* PHASE 2: RENDER PAGINATED THREADS */}
        {!isLoading && filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onVote={handleVote}
            // ThreadCard will handle PHASE 3 (secondary data) internally
            />
          ))
        ) : (
          !isLoading && (
            <div className="flex min-h-[68vh] flex-col items-center justify-center text-center rounded-xl border border-dashed border-gray-200">
              <img
                className="h-[68vh] md:w-full rounded-xl"
                src="https://cdn.svgator.com/images/2024/04/book-with-broken-pages-animation-404-error.webp"
                alt="No threads found illustration"
                width="800"
                height="600"
                loading="lazy"
              />
            </div>
          )
        )}

        {/* INFINITE SCROLL SENTINEL */}
        <div ref={bottomRef} className="h-6" />

        {/* PHASE 2+: LOADING INDICATOR for next page */}
        {isFetchingNextPage && (
          <LoadingPagination />
        )}

        {/* End of pagination indicator */}
        {!hasNextPage && allThreads.length > 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">
            You've reached the end!
          </div>
        )}
      </div>
    </div>
  );
}