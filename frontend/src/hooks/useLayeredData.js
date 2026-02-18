import { useMemo, useState } from "react";
import { mockPosts, mockThreads } from "../data/mockData";

export function useLayeredFeed() {
    return {
        data: { pages: [{ items: mockPosts }] },
        isLoading: false,
        error: null,
        hasNextPage: false,
        fetchNextPage: async () => { },
        isFetchingNextPage: false,
        refetch: async () => { },
    };
}

export function useLayeredThreads() {
    return {
        data: { pages: [{ items: mockThreads }] },
        isLoading: false,
        error: null,
        hasNextPage: false,
        fetchNextPage: async () => { },
        isFetchingNextPage: false,
        refetch: async () => { },
    };
}

export function usePrefetchFeed() {
    return { prefetchNextPage: async () => { } };
}

export function usePrefetchThreads() {
    return { prefetchNextPage: async () => { } };
}

export function useInvalidateCache() {
    const [tick, setTick] = useState(0);

    const api = useMemo(
        () => ({
            invalidateFeed: async () => setTick((t) => t + 1),
            invalidateThreads: async () => setTick((t) => t + 1),
            invalidateProfile: async () => setTick((t) => t + 1),
            invalidateAll: async () => setTick((t) => t + 1),
            _tick: tick,
        }),
        [tick]
    );

    return api;
}

