import api from "./api";

function normalizeAuthor(author = {}, fallbackAuthorId = "") {
    return {
        uid: author.id || fallbackAuthorId,
        id: author.id || fallbackAuthorId,
        username: author.username || "",
        name: author.fullName || author.username || "Anonymous",
        profile_pic: author.profileImageUrl || "",
    };
}

function normalizeThreadComment(comment = {}) {
    return {
        id: comment.id,
        parentId: comment.parentId || null,
        uid: comment.authorId,
        content: comment.content || "",
        createdAt: comment.createdAt,
        author: normalizeAuthor(comment.author, comment.authorId),
        replies: [],
        upvotes: [],
        downvotes: [],
        votes: 0,
    };
}

function nestThreadComments(flatComments = []) {
    const byId = new Map(flatComments.map((item) => [item.id, { ...item, replies: [] }]));
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

function normalizeThread(thread = {}) {
    const votes = Array.isArray(thread.votes) ? thread.votes : [];
    const upvotes = votes.filter((vote) => vote?.type === "UP").map((vote) => vote.userId).filter(Boolean);
    const downvotes = votes.filter((vote) => vote?.type === "DOWN").map((vote) => vote.userId).filter(Boolean);

    const flatComments = Array.isArray(thread.comments)
        ? thread.comments.map(normalizeThreadComment)
        : [];

    const discussion = nestThreadComments(flatComments);
    const discussionCount = Number(thread?._count?.comments) || discussion.length;

    return {
        ...thread,
        id: thread.id || thread._id,
        uid: thread.uid || thread.authorId,
        category: Array.isArray(thread.tags) ? thread.tags[0] || "General" : "General",
        campus: thread.collegeName || "General",
        branch: thread.branch || "",
        batch: thread.batch || "",
        author: normalizeAuthor(thread.author, thread.authorId),
        upvotes,
        downvotes,
        votes: upvotes.length - downvotes.length,
        Discussion: discussion,
        answersCount: discussionCount,
    };
}

function extractCursorPayload(payload) {
    if (Array.isArray(payload)) {
        return { items: payload, nextCursor: null };
    }

    if (Array.isArray(payload?.data)) {
        return {
            items: payload.data,
            nextCursor: payload?.nextCursor || null,
        };
    }

    if (Array.isArray(payload?.data?.data)) {
        return {
            items: payload.data.data,
            nextCursor: payload?.data?.nextCursor || null,
        };
    }

    if (Array.isArray(payload?.threads)) {
        return {
            items: payload.threads,
            nextCursor: payload?.nextCursor || null,
        };
    }

    if (Array.isArray(payload?.data?.threads)) {
        return {
            items: payload.data.threads,
            nextCursor: payload?.data?.nextCursor || payload?.nextCursor || null,
        };
    }

    if (Array.isArray(payload?.items)) {
        return {
            items: payload.items,
            nextCursor: payload?.nextCursor || payload?.cursor || null,
        };
    }

    return { items: [], nextCursor: null };
}

async function fetchAllThreads() {
    const allThreads = [];
    let cursor = null;

    while (true) {
        const response = await api.get("/threads", {
            params: {
                limit: 50,
                ...(cursor ? { cursor } : {}),
            },
        });

        const payload = response.data;
        const { items: pageItems, nextCursor } = extractCursorPayload(payload);

        allThreads.push(...pageItems.map(normalizeThread).filter(Boolean));

        if (!nextCursor || nextCursor === cursor) break;
        cursor = nextCursor;
    }

    return allThreads;
}

export async function getThreadById(threadId) {
    const response = await api.get(`/threads/${threadId}`);
    return normalizeThread(response.data);
}

export async function addAnswerToThread(threadId, content) {
    const response = await api.post("/profile/comment", {
        threadId,
        content,
    });
    return response.data?.id;
}

export async function addReplyToAnswer(threadId, answerId, content, parentReplyId = null) {
    const parentId = parentReplyId || answerId;

    const response = await api.post("/profile/comment", {
        threadId,
        content,
        parentId,
    });
    return response.data?.id;
}

export async function voteOnThread(threadId, voteType) {
    const type = voteType === "down" ? "DOWN" : "UP";
    const response = await api.post("/threads/vote", {
        threadId,
        type,
    });
    return response.data;
}

export async function voteOnAnswer() {
    return { success: true };
}

export async function getPaginatedThreads_API(cursor = null, limit = 5) {
    const response = await api.get("/threads", {
        params: {
            limit,
            ...(cursor ? { cursor } : {}),
        },
    });

    const payload = response.data;

    if (Array.isArray(payload)) {
        const allThreads = payload.map(normalizeThread).filter(Boolean);
        const startIndex = cursor
            ? Math.max(0, allThreads.findIndex((item) => item.id === cursor) + 1)
            : 0;
        const endIndex = startIndex + limit;
        const items = allThreads.slice(startIndex, endIndex);

        return {
            data: items,
            nextCursor: endIndex < allThreads.length ? allThreads[endIndex - 1]?.id || null : null,
            limit,
            hasMore: endIndex < allThreads.length,
            total: allThreads.length,
        };
    }

    const { items: rawItems, nextCursor } = extractCursorPayload(payload);

    const items = rawItems
        .map(normalizeThread)
        .filter(Boolean);

    return {
        data: items,
        nextCursor,
        limit,
        hasMore: Boolean(nextCursor),
    };
}

export async function getUserThreads(uid) {
    if (!uid) return [];
    const response = await api.get("/threads/mythreads");
    const threads = Array.isArray(response.data) ? response.data : [];
    return threads.map(normalizeThread).filter(Boolean);
}

export async function getThreadsByIds(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const allThreads = await fetchAllThreads();
    return allThreads.filter((thread) => ids.includes(thread.id));
}

export async function deleteThread(threadId) {
    const response = await api.delete(`/threads/${threadId}`);
    return response.data;
}

export async function CreateThread(uid, title, description, category) {
    const payload = {
        title,
        description,
        tags: category ? [String(category)] : ["General"],
        collegeName: "General",
    };

    const response = await api.post("/threads/create", payload);
    const created = normalizeThread(response.data || {});
    return { id: created.id };
}

export async function getSavedThreads() {
    const response = await api.get("/threads/saved");
    const savedRows = Array.isArray(response.data) ? response.data : [];

    return savedRows
        .map((row) => normalizeThread(row?.thread || row))
        .filter(Boolean);
}

