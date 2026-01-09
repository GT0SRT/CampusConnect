// QUERY CLIENT CONFIGURATION
// Central configuration for all React Query caching behavior
// This ensures consistent cache behavior across the entire app

import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Mark data as stale after 5 minutes
        staleTime: 5 * 60 * 1000,

        // Keep data in cache for 10 minutes even if unused
        // Enables fast back-button navigation without refetch
        gcTime: 10 * 60 * 1000,

        // Retry twice on failure with exponential backoff
        // Handles temporary network blips gracefully
        retry: 2,
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch when window regains focus
        // Ensures data freshness when user switches tabs/windows back to app
        refetchOnWindowFocus: true,

        // Don't refetch when user is offline
        // Saves bandwidth, user can retry manually
        refetchOnReconnect: true,

        // Don't refetch on component mount if data exists and not stale
        // Reduces unnecessary requests during navigation
        refetchOnMount: false,
      },

      mutations: {
        // Retry mutations once on failure
        // Less aggressive than queries (mutations have side effects)
        retry: 1,
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
};

export const queryClient = createQueryClient();