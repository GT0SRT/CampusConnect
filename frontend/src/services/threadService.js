import { getThreadById as getMockThread, mockThreads, getPaginatedThreads } from "../data/mockData";

export async function getThreadById(threadId) {
    const thread = getMockThread(threadId);
    return thread || mockThreads[0];
}

export async function addAnswerToThread() {
    return { success: true };
}

export async function addReplyToAnswer() {
    return { success: true };
}

export async function voteOnThread() {
    return { success: true };
}

export async function voteOnAnswer() {
    return { success: true };
}

/**
 * Backend pagination endpoint
 * Simulates: GET /api/threads?page=1&limit=5&category=global
 * Returns: { data: [...items], page, limit, total, hasMore }
 */
export async function getPaginatedThreads_API(page = 1, limit = 5) {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            const result = getPaginatedThreads(page, limit);
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

export async function getUserThreads() {
    return mockThreads;
}

export async function getThreadsByIds(ids = []) {
    return mockThreads.filter((t) => ids.includes(t.id));
}

export async function deleteThread() {
    return { success: true };
}

export async function CreateThread() {
    return { id: `thread-${Date.now()}` };
}

