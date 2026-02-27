import api from "./api";

function normalizeComment(comment) {
    return {
        id: comment.id,
        text: comment.content || "",
        parentId: comment.parentId || null,
        createdAt: comment.createdAt,
        author: {
            uid: comment?.author?.id,
            username: comment?.author?.username || "",
            name: comment?.author?.fullName || comment?.author?.username || "User",
            profile_pic: comment?.author?.profileImageUrl || "",
        },
        replies: [],
    };
}

export async function toggleBookmark(userId, postId, remove = false) {
    const endpoint = remove ? "/posts/unsave" : "/posts/save";
    const response = await api.post(endpoint, { postId });
    return response.data;
}

export async function toggleLike(userId, postId, remove = false) {
    const endpoint = remove ? "/posts/unlike" : "/posts/like";
    const response = await api.post(endpoint, { postId });
    return response.data;
}

export async function addComment(userId, postId, text, parentId = null) {
    const response = await api.post("/posts/comment", {
        postId,
        content: text,
        parentId,
    });
    return normalizeComment(response.data);
}

export async function getComments(postId) {
    const response = await api.get(`/posts/comments/${postId}`);
    const flat = Array.isArray(response.data) ? response.data.map(normalizeComment) : [];
    const byId = new Map(flat.map((item) => [item.id, { ...item, replies: [] }]));
    const roots = [];

    for (const item of byId.values()) {
        if (item.parentId && byId.has(item.parentId)) {
            byId.get(item.parentId).replies.push(item);
        } else {
            roots.push(item);
        }
    }

    return roots;
}

export async function addReply(postId, parentId, user, text) {
    return addComment(user?.uid, postId, text, parentId);
}

export async function toggleThreadBookmark(userId, threadId, remove = false) {
    const endpoint = remove ? "/threads/unsave" : "/threads/save";
    const response = await api.post(endpoint, { threadId });
    return response.data;
}
