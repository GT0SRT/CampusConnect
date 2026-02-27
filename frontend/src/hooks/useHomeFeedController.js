import { useMemo, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "../store/useUserStore";
import { getPaginatedFeed } from "../services/postService";

export function useHomeFeedController() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Global");
    const { user, theme } = useUserStore();
    const queryClient = useQueryClient();

    const {
        data,
        error,
        isLoading,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["home-feed", activeTab],
        queryFn: ({ pageParam = null }) => getPaginatedFeed(pageParam, 5),
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    });

    const posts = useMemo(
        () => (data?.pages || []).flatMap((page) => page?.data || []),
        [data]
    );

    const total = data?.pages?.[0]?.total || posts.length;
    const isRefreshing = isFetching && !isLoading && !isFetchingNextPage;
    const isLoadingMore = isFetchingNextPage;
    const hasMore = Boolean(hasNextPage);

    const loadMorePosts = async () => {
        if (!hasNextPage || isFetchingNextPage) return;
        await fetchNextPage();
    };

    const reset = async () => {
        await refetch();
    };

    const handlePostCreated = async () => {
        await queryClient.invalidateQueries({ queryKey: ["home-feed"] });
    };

    return {
        user,
        theme,
        posts,
        isLoading,
        isRefreshing,
        isLoadingMore,
        error: error?.message || null,
        hasMore,
        total,
        activeTab,
        setActiveTab,
        isModalOpen,
        setIsModalOpen,
        loadMorePosts,
        reset,
        handlePostCreated,
    };
}
