import { useState, useCallback } from "react";

/**
 * Reusable pagination hook for Home and Threads pages
 * Handles loading states, error states, pagination logic
 * 
 * @param {Function} fetchFunction - API function to fetch paginated data
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Object} Pagination state and methods
 */
export function usePagination(fetchFunction, itemsPerPage = 5) {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);

    /**
     * Fetch items for a specific page
     */
    const fetchItems = useCallback(async (page = 1, options = {}) => {
        const { preserveItems = false } = options;
        try {
            const hasExistingItems = items.length > 0;

            if (page === 1) {
                if (preserveItems && hasExistingItems) {
                    setIsRefreshing(true);
                } else {
                    setIsLoading(true);
                }
            } else {
                setIsLoadingMore(true);
            }

            setError(null);

            const data = await fetchFunction(page, itemsPerPage);

            if (page === 1) {
                setItems(data.data);
            } else {
                setItems(prev => [...prev, ...data.data]);
            }

            setCurrentPage(page);
            setHasMore(data.hasMore);
            setTotal(data.total);
        } catch (err) {
            console.error("Error fetching items:", err);
            setError(err.message || "Failed to load items");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsLoadingMore(false);
        }
    }, [fetchFunction, itemsPerPage, items.length]);

    /**
     * Load next page of items
     */
    const loadMore = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            fetchItems(currentPage + 1);
        }
    }, [isLoadingMore, hasMore, currentPage, fetchItems]);

    /**
     * Reset pagination and fetch from first page
     */
    const reset = useCallback(async (options = {}) => {
        const { preserveItems = false } = options;
        if (!preserveItems) {
            setItems([]);
        }
        setCurrentPage(1);
        await fetchItems(1, { preserveItems });
    }, [fetchItems]);

    /**
     * Refetch current page
     */
    const refetch = useCallback(async () => {
        await fetchItems(currentPage, { preserveItems: true });
    }, [fetchItems, currentPage]);

    return {
        items,
        isLoading,
        isRefreshing,
        isLoadingMore,
        error,
        currentPage,
        hasMore,
        total,
        fetchItems,
        loadMore,
        reset,
        refetch,
        setItems
    };
}
