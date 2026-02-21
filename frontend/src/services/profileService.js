import { getPostsByIds, getPostsByUserId } from "./postService";
import { getThreadsByIds, getUserThreads } from "./threadService";
import { toggleBookmark, toggleThreadBookmark } from "./interactionService";
import { calculateUserKarma } from "./karmaService";

export async function fetchProfileCollections({
    userId,
    savedPostIds = [],
    savedThreadIds = [],
    isMe = false,
    fallbackKarma = 0,
}) {
    const [threads, ownPosts, savedPosts, savedThreads, karmaValue] = await Promise.all([
        getUserThreads(userId),
        getPostsByUserId(userId),
        savedPostIds.length > 0 ? getPostsByIds(savedPostIds) : Promise.resolve([]),
        savedThreadIds.length > 0 ? getThreadsByIds(savedThreadIds) : Promise.resolve([]),
        isMe ? calculateUserKarma(userId) : Promise.resolve(fallbackKarma),
    ]);

    const ownThreads = Array.isArray(threads) ? threads.filter((thread) => thread.uid === userId) : [];
    const computedKarma = typeof karmaValue === "number" ? karmaValue : karmaValue?.total || 0;

    return {
        ownPosts: ownPosts || [],
        ownThreads,
        savedPosts: savedPosts || [],
        savedThreads: savedThreads || [],
        karma: computedKarma,
    };
}

export async function removeSavedPost(userId, postId) {
    return toggleBookmark(userId, postId, true);
}

export async function removeSavedThread(userId, threadId) {
    return toggleThreadBookmark(userId, threadId, true);
}
