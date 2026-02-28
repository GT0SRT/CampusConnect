import api from "./api";

function normalizePost(post) {
    if (!post) return null;

    const createdAt = post.createdAt ? new Date(post.createdAt).getTime() : Date.now();
    const likes = typeof post.likes === "number" ? post.likes : post?._count?.likes || 0;
    const likedBy = Array.isArray(post.likes) ? post.likes.map((entry) => entry.userId).filter(Boolean) : post.likedBy || [];
    const commentsCount = typeof post.commentsCount === "number" ? post.commentsCount : post?._count?.comments || 0;

    return {
        ...post,
        id: post.id || post._id,
        uid: post.uid || post.authorId || post.author?.id,
        caption: post.caption || post.content || "",
        likes,
        likedBy,
        commentsCount,
        createdAt,
        author: {
            uid: post?.author?.id || post.authorId,
            id: post?.author?.id || post.authorId,
            username: post?.author?.username || "",
            name: post?.author?.fullName || post?.author?.username || "Anonymous",
            profile_pic: post?.author?.profileImageUrl || "",
            campus: post?.author?.collegeName || "General",
        },
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

    if (Array.isArray(payload?.posts)) {
        return {
            items: payload.posts,
            nextCursor: payload?.nextCursor || null,
        };
    }

    if (Array.isArray(payload?.data?.posts)) {
        return {
            items: payload.data.posts,
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

export async function createPost(uid, imageUrl, caption) {
    const response = await api.post("/posts/add", {
        caption,
        imageUrl,
    });

    return normalizePost(response.data);
}

export async function deletePost(postId) {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
}

async function fetchAllPosts() {
    const allPosts = [];
    let cursor = null;

    while (true) {
        const response = await api.get("/posts/posts", {
            params: {
                limit: 50,
                ...(cursor ? { cursor } : {}),
            },
        });

        const payload = response.data;
        const { items: pageItems, nextCursor } = extractCursorPayload(payload);

        allPosts.push(...pageItems.map(normalizePost).filter(Boolean));

        if (!nextCursor || nextCursor === cursor) break;
        cursor = nextCursor;
    }

    return allPosts;
}

export async function getPostsByIds(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const allPosts = await fetchAllPosts();
    return allPosts.filter((post) => ids.includes(post.id));
}

export async function getPostsByUserId(uid) {
    if (!uid) return [];
    const allPosts = await fetchAllPosts();
    return allPosts.filter((post) => post.uid === uid);
}

export async function getPaginatedFeed(cursor = null, limit = 5) {
    const response = await api.get("/posts/posts", {
        params: {
            limit,
            ...(cursor ? { cursor } : {}),
        },
    });

    const payload = response.data;
    const { items: rawItems, nextCursor } = extractCursorPayload(payload);
    const items = rawItems
        .map(normalizePost)
        .filter(Boolean);

    return {
        data: items,
        nextCursor,
        limit,
        hasMore: Boolean(nextCursor),
    };
}

export async function getPostDetailsForDisplay(post) {
    if (post?.id) return post;

    const allPosts = await fetchAllPosts();
    return allPosts.find((item) => item.id === post?.id) || null;
}

export async function getSavedPosts() {
    const response = await api.get("/posts/saved");
    const savedRows = Array.isArray(response.data) ? response.data : [];

    return savedRows
        .map((row) => normalizePost(row?.post || row))
        .filter(Boolean);
}

