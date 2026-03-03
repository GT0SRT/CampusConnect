const prisma = require("../lib/prisma");

const MAX_LIMIT = 20;
const DEFAULT_LIMIT = 8;

const toTrimmedString = (value) => String(value || "").trim();

const toLimit = (value) => {
    const parsed = Number.parseInt(String(value || DEFAULT_LIMIT), 10);

    if (Number.isNaN(parsed) || parsed <= 0) {
        return DEFAULT_LIMIT;
    }

    return Math.min(parsed, MAX_LIMIT);
};

const sanitizeUser = (user = {}) => ({
    id: user.id,
    username: user.username,
    fullName: user.fullName || "",
    profileImageUrl: user.profileImageUrl || "",
});

const sanitizePost = (post = {}) => ({
    id: post.id,
    caption: post.caption || "",
    imageUrl: post.imageUrl || "",
    createdAt: post.createdAt,
    author: post.author
        ? {
            id: post.author.id,
            username: post.author.username,
            fullName: post.author.fullName || "",
            profileImageUrl: post.author.profileImageUrl || "",
        }
        : null,
});

const sanitizeThread = (thread = {}) => ({
    id: thread.id,
    title: thread.title || "",
    description: thread.description || "",
    tags: thread.tags || [],
    createdAt: thread.createdAt,
    author: thread.author
        ? {
            id: thread.author.id,
            username: thread.author.username,
            fullName: thread.author.fullName || "",
            profileImageUrl: thread.author.profileImageUrl || "",
        }
        : null,
});

exports.search = async (req, res) => {
    try {
        const rawQuery = toTrimmedString(req.query.q);
        const limit = toLimit(req.query.limit);

        if (!rawQuery) {
            return res.json({
                query: "",
                mode: "none",
                users: [],
                posts: [],
                threads: [],
            });
        }

        const isUserSearch = rawQuery.startsWith("@");

        if (isUserSearch) {
            const userTerm = toTrimmedString(rawQuery.slice(1));

            if (!userTerm) {
                const recentUsers = await prisma.user.findMany({
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: limit,
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        profileImageUrl: true,
                    },
                });

                return res.json({
                    query: rawQuery,
                    mode: "users",
                    users: recentUsers.map(sanitizeUser),
                    posts: [],
                    threads: [],
                });
            }

            const [prefixUsers, containsUsers] = await Promise.all([
                prisma.user.findMany({
                    where: {
                        OR: [
                            {
                                username: {
                                    startsWith: userTerm,
                                    mode: "insensitive",
                                },
                            },
                            {
                                fullName: {
                                    startsWith: userTerm,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                    orderBy: {
                        username: "asc",
                    },
                    take: limit,
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        profileImageUrl: true,
                    },
                }),
                prisma.user.findMany({
                    where: {
                        OR: [
                            {
                                username: {
                                    contains: userTerm,
                                    mode: "insensitive",
                                },
                            },
                            {
                                fullName: {
                                    contains: userTerm,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                    orderBy: {
                        username: "asc",
                    },
                    take: limit,
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        profileImageUrl: true,
                    },
                }),
            ]);

            const users = [...prefixUsers, ...containsUsers]
                .filter((user, index, arr) => arr.findIndex((item) => item.id === user.id) === index)
                .slice(0, limit);

            return res.json({
                query: rawQuery,
                mode: "users",
                users: users.map(sanitizeUser),
                posts: [],
                threads: [],
            });
        }

        const [posts, threads] = await Promise.all([
            prisma.post.findMany({
                where: {
                    caption: {
                        contains: rawQuery,
                        mode: "insensitive",
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: limit,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            profileImageUrl: true,
                        },
                    },
                },
            }),
            prisma.thread.findMany({
                where: {
                    OR: [
                        {
                            title: {
                                contains: rawQuery,
                                mode: "insensitive",
                            },
                        },
                        {
                            description: {
                                contains: rawQuery,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: limit,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            profileImageUrl: true,
                        },
                    },
                },
            }),
        ]);

        return res.json({
            query: rawQuery,
            mode: "content",
            users: [],
            posts: posts.map(sanitizePost),
            threads: threads.map(sanitizeThread),
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
