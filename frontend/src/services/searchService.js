import api from "./api";

export async function searchGlobal(query, limit = 8) {
    const normalizedQuery = String(query || "").trim();

    if (!normalizedQuery) {
        return {
            query: "",
            mode: "none",
            users: [],
            posts: [],
            threads: [],
        };
    }

    const response = await api.get("/search", {
        params: {
            q: normalizedQuery,
            limit,
        },
    });

    const payload = response.data || {};

    return {
        query: payload.query || normalizedQuery,
        mode: payload.mode || "none",
        users: Array.isArray(payload.users) ? payload.users : [],
        posts: Array.isArray(payload.posts) ? payload.posts : [],
        threads: Array.isArray(payload.threads) ? payload.threads : [],
    };
}
