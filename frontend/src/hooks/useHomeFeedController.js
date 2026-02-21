import { useEffect, useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { getPaginatedFeed } from "../services/postService";
import { usePagination } from "../utils/usePagination";

export function useHomeFeedController() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Global");
    const { user, theme } = useUserStore();

    const {
        items: posts,
        isLoading,
        isRefreshing,
        isLoadingMore,
        error,
        hasMore,
        total,
        loadMore: loadMorePosts,
        reset,
    } = usePagination(getPaginatedFeed, 5);

    useEffect(() => {
        reset();
    }, [activeTab, reset]);

    const handlePostCreated = async () => {
        await reset({ preserveItems: true });
    };

    return {
        user,
        theme,
        posts,
        isLoading,
        isRefreshing,
        isLoadingMore,
        error,
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
