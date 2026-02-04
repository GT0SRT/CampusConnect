import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getPaginatedFeed, getPostDetailsForDisplay } from '../services/postService';
import { getPaginatedThreads, getThreadDetailsForDisplay } from '../services/threadService';

export const useLayeredFeed = (pageSize = 10) => {
  return useInfiniteQuery({
    queryKey: ['feed', 'paginated', pageSize],
    
    // Initial query for first page
    queryFn: ({ pageParam = null }) => getPaginatedFeed(pageParam, pageSize),
    
    // Use cursor-based pagination
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    
    // Cache this data for 5 minutes
    // After 5 mins, marked as stale (but not removed)
    // User can still see stale data while fresh fetches in background
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    // Cache the entire result for 10 minutes
    // Prevents redundant network requests during navigation
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    
    // Don't retry failed requests immediately
    // Reduces network churn if there's a brief outage
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const usePostDetails = (postId, enabled = true) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['post', 'details', postId],
    queryFn: () => getPostDetailsForDisplay(postId),
    enabled: !!postId && enabled,
    
    // Cache detailed view for 10 minutes
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    
    // Less aggressive retry for details (lower priority)
    retry: 1,
    
    // When this succeeds, automatically merge with list view in cache
    // Keeps data consistent across different query keys
    onSuccess: (data) => {
      // Update the infinite query cache with enriched data
      queryClient.setQueryData(['feed', 'paginated', 10], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            items: page.items.map(item =>
              item.id === postId ? { ...item, ...data } : item
            )
          }))
        };
      });
    }
  });
};

export const usePrefetchFeed = () => {
  const queryClient = useQueryClient();
  const prefetchNextPage = (nextCursor) => {
    queryClient.prefetchInfiniteQuery({
      queryKey: ['feed', 'paginated', 10],
      queryFn: ({ pageParam = null }) => getPaginatedFeed(pageParam, 10),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: nextCursor,
      pages: 1,
    });
  };

  return { prefetchNextPage };
};

export const useLayeredThreads = (pageSize = 10) => {
  return useInfiniteQuery({
    queryKey: ['threads', 'paginated', pageSize],
    queryFn: ({ pageParam = null }) => getPaginatedThreads(pageParam, pageSize),
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useThreadDetails = (threadId, enabled = true) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['thread', 'details', threadId],
    queryFn: () => getThreadDetailsForDisplay(threadId),
    enabled: !!threadId && enabled,
    
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    
    // Merge with thread list cache
    onSuccess: (data) => {
      queryClient.setQueryData(['threads', 'paginated', 10], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            items: page.items.map(item =>
              item.id === threadId ? { ...item, ...data } : item
            )
          }))
        };
      });
    }
  });
};

export const usePrefetchThreads = () => {
  const queryClient = useQueryClient();

  const prefetchNextPage = (nextCursor) => {
    queryClient.prefetchInfiniteQuery({
      queryKey: ['threads', 'paginated', 10],
      queryFn: ({ pageParam = null }) => getPaginatedThreads(pageParam, 10),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: nextCursor,
      pages: 1,
    });
  };

  return { prefetchNextPage };
};

export const useInvalidateCache = () => {
  const queryClient = useQueryClient();

  return {
    invalidateFeed: () => 
      queryClient.invalidateQueries({ queryKey: ['feed'] }),
    
    invalidateThreads: () => 
      queryClient.invalidateQueries({ queryKey: ['threads'] }),
    
    invalidatePost: (postId) => 
      queryClient.invalidateQueries({ queryKey: ['post', 'details', postId] }),
    
    invalidateThread: (threadId) =>
      queryClient.invalidateQueries({ queryKey: ['thread', 'details', threadId] }),
    
    // Clear all caches (logout, etc.)
    clearAllCaches: () => queryClient.clear(),
  };
};
