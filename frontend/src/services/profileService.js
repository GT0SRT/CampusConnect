import { getPostsByIds, getPostsByUserId, getSavedPosts } from "./postService";
import { getSavedThreads, getThreadsByIds, getUserThreads } from "./threadService";
import { toggleBookmark, toggleThreadBookmark } from "./interactionService";
import { calculateUserKarma } from "./karmaService";

export async function fetchProfileCollections({
    userId,
    savedPostIds = [],
    savedThreadIds = [],
    isMe = false,
    fallbackKarma = 0,
}) {
    const results = await Promise.allSettled([
        getUserThreads(userId),
        getPostsByUserId(userId),
        isMe
            ? getSavedPosts()
            : (savedPostIds.length > 0 ? getPostsByIds(savedPostIds) : Promise.resolve([])),
        isMe
            ? getSavedThreads()
            : (savedThreadIds.length > 0 ? getThreadsByIds(savedThreadIds) : Promise.resolve([])),
        isMe ? calculateUserKarma(userId) : Promise.resolve(fallbackKarma),
    ]);

    const [threadsResult, ownPostsResult, savedPostsResult, savedThreadsResult, karmaResult] = results;

    const ownThreads = threadsResult.status === "fulfilled" && Array.isArray(threadsResult.value)
        ? threadsResult.value
        : [];

    const ownPosts = ownPostsResult.status === "fulfilled" && Array.isArray(ownPostsResult.value)
        ? ownPostsResult.value
        : [];

    const savedPosts = savedPostsResult.status === "fulfilled" && Array.isArray(savedPostsResult.value)
        ? savedPostsResult.value
        : [];

    const savedThreads = savedThreadsResult.status === "fulfilled" && Array.isArray(savedThreadsResult.value)
        ? savedThreadsResult.value
        : [];

    const karmaValue = karmaResult.status === "fulfilled" ? karmaResult.value : fallbackKarma;
    const computedKarma = typeof karmaValue === "number" ? karmaValue : karmaValue?.total || 0;

    return {
        ownPosts,
        ownThreads,
        savedPosts,
        savedThreads,
        karma: computedKarma,
    };
}

export async function removeSavedPost(userId, postId) {
    return toggleBookmark(userId, postId, true);
}

export async function removeSavedThread(userId, threadId) {
    return toggleThreadBookmark(userId, threadId, true);
}
