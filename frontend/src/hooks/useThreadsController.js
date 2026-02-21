import { useEffect, useState } from "react";
import { voteOnThread, getPaginatedThreads_API } from "../services/threadService";
import { usePagination } from "../utils/usePagination";
import { useUserStore } from "../store/useUserStore";

export function useThreadsController() {
    const [votingThreads, setVotingThreads] = useState({});
    const [activeTab, setActiveTab] = useState("Global");
    const { user, theme } = useUserStore();

    const {
        items: threads,
        isLoading,
        isRefreshing,
        isLoadingMore,
        error,
        hasMore,
        total,
        loadMore: loadMoreThreads,
        reset,
        refetch,
    } = usePagination(getPaginatedThreads_API, 5);

    useEffect(() => {
        reset();
    }, [activeTab, reset]);

    const handleVote = async (threadId, voteType) => {
        if (votingThreads[threadId] || !user?.uid) return;

        try {
            setVotingThreads((prev) => ({ ...prev, [threadId]: true }));
            await voteOnThread(threadId, user.uid, voteType);
            await refetch();
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
        error,
        hasMore,
        total,
        activeTab,
        setActiveTab,
        loadMoreThreads,
        reset,
        handleVote,
    };
}
