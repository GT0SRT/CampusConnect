import { mockPosts, getPostById, getPaginatedPosts } from "../data/mockData";

export async function createPost() {
    return { id: `post-${Date.now()}` };
}

export async function deletePost() {
    return { success: true };
}

export async function getPostsByIds(ids = []) {
    return mockPosts.filter((post) => ids.includes(post.id));
}

export async function getPostsByUserId(uid) {
    if (!uid) return [];
    return mockPosts.filter((post) => post.uid === uid);
}

/**
 * Backend pagination endpoint
 * Simulates: GET /api/posts?page=1&limit=5&category=global
 * Returns: { data: [...items], page, limit, total, hasMore }
 */
export async function getPaginatedFeed(page = 1, limit = 5) {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            const result = getPaginatedPosts(page, limit);
            resolve({
                data: result.items,
                page,
                limit,
                total: result.total,
                hasMore: result.hasMore
            });
        }, 500);
    });
}

export async function getPostDetailsForDisplay(post) {
    return post || getPostById(post?.id);
}

