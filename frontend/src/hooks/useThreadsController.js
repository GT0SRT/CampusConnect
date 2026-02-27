import { useMemo, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { voteOnThread, getPaginatedThreads_API } from "../services/threadService";
import { useUserStore } from "../store/useUserStore";

export function useThreadsController() {
    const [votingThreads, setVotingThreads] = useState({});
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
        queryKey: ["threads-feed", activeTab],
        queryFn: ({ pageParam = null }) => getPaginatedThreads_API(pageParam, 5),
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    });

    const threads = useMemo(
        () => (data?.pages || []).flatMap((page) => page?.data || []),
        [data]
    );

    const total = data?.pages?.[0]?.total || threads.length;
    const isRefreshing = isFetching && !isLoading && !isFetchingNextPage;
    const isLoadingMore = isFetchingNextPage;
    const hasMore = Boolean(hasNextPage);

    const loadMoreThreads = async () => {
        if (!hasNextPage || isFetchingNextPage) return;
        await fetchNextPage();
    };

    const reset = async () => {
        await refetch();
    };

    const handleVote = async (threadId, voteType) => {
        if (votingThreads[threadId] || !user?.uid) return;

        try {
            setVotingThreads((prev) => ({ ...prev, [threadId]: true }));
            await voteOnThread(threadId, user.uid, voteType);
            await queryClient.invalidateQueries({ queryKey: ["threads-feed"] });
        } catch (err) {
            console.error("Error voting:", err);
        } finally {
            setVotingThreads((prev) => ({ ...prev, [threadId]: false }));
        }
    };

    return {
        user,
        theme,
        threads,
        isLoading,
        isRefreshing,
        isLoadingMore,
        error: error?.message || null,
        hasMore,
        total,
        activeTab,
        setActiveTab,
        loadMoreThreads,
        reset,
        handleVote,
    };
}
