import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockUsers } from "../data/mockData";
import { fetchProfileCollections, removeSavedPost, removeSavedThread } from "../services/profileService";
import { useUserStore } from "../store/useUserStore";

function deriveUsername(targetUser) {
    if (targetUser?.username) return targetUser.username;
    if (targetUser?.email) return targetUser.email.split("@")[0];
    if (targetUser?.name) return targetUser.name.toLowerCase().replace(/\s+/g, "");
    return "campususer";
}

function deriveStatusTag(targetUser) {
    if (targetUser?.statusTag) return targetUser.statusTag;
    const currentYear = new Date().getFullYear();
    const batchYear = Number(targetUser?.batch);

    if (!Number.isNaN(batchYear) && batchYear > 0) {
        return batchYear < currentYear ? "Alumni" : "Student";
    }

    return "Student";
}

function deriveAvailability(targetUser) {
    if (targetUser?.availability) return targetUser.availability;
    if (targetUser?.openToConnect === true) return "Open to Connect";
    if (targetUser?.openToConnect === false) return "In Class";
    return "Available";
}

function buildFallbackProjects() {
    return [
        { title: "Nyaya-Setu", techStack: ["React", "Node.js", "MongoDB"] },
        { title: "ResolveIt", techStack: ["Next.js", "Prisma", "PostgreSQL"] },
    ];
}

export function useProfileController(routeUid) {
    const navigate = useNavigate();
    const { user, updateUser, theme } = useUserStore();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [collections, setCollections] = useState({
        posts: [],
        threads: [],
        savedPosts: [],
        savedThreads: [],
        karma: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const hasLoadedRef = useRef(false);

    const isMe = !routeUid || routeUid === user?.uid;

    const publicUser = useMemo(() => {
        if (!routeUid || routeUid === user?.uid) return null;
        return mockUsers.find((mockUser) => mockUser.uid === routeUid) || null;
    }, [routeUid, user?.uid]);

    const viewedUser = isMe ? user : publicUser;

    const savedPostIds = useMemo(() => (isMe ? user?.savedPosts ?? [] : []), [isMe, user?.savedPosts]);
    const savedThreadIds = useMemo(() => (isMe ? user?.savedThreads ?? [] : []), [isMe, user?.savedThreads]);

    useEffect(() => {
        if (!user?.uid) {
            navigate("/auth");
        }
    }, [navigate, user?.uid]);

    const loadProfileData = useCallback(async () => {
        if (!viewedUser?.uid) {
            setIsLoading(false);
            return;
        }

        setError(null);
        if (hasLoadedRef.current) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }

        try {
            const profileCollections = await fetchProfileCollections({
                userId: viewedUser.uid,
                savedPostIds,
                savedThreadIds,
                isMe,
                fallbackKarma: viewedUser?.karmaCount ?? viewedUser?.karma ?? 0,
            });

            setCollections({
                posts: profileCollections.ownPosts,
                threads: profileCollections.ownThreads,
                savedPosts: profileCollections.savedPosts,
                savedThreads: profileCollections.savedThreads,
                karma: profileCollections.karma,
            });

            if (isMe && user?.karmaCount !== profileCollections.karma) {
                updateUser({ karmaCount: profileCollections.karma });
            }

            hasLoadedRef.current = true;
        } catch (fetchError) {
            setError(fetchError);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [isMe, savedPostIds, savedThreadIds, updateUser, user?.karmaCount, viewedUser]);

    useEffect(() => {
        loadProfileData();
    }, [loadProfileData]);

    const handleRemoveSavedPost = useCallback(async (postId) => {
        if (!viewedUser?.uid) return;
        try {
            await removeSavedPost(viewedUser.uid, postId);
            setCollections((prev) => ({
                ...prev,
                savedPosts: prev.savedPosts.filter((savedPost) => savedPost.id !== postId),
            }));

            if (isMe) {
                updateUser({
                    savedPosts: (user?.savedPosts || []).filter((savedPostId) => savedPostId !== postId),
                });
            }
        } catch (removeError) {
            setError(removeError);
        }
    }, [isMe, updateUser, user?.savedPosts, viewedUser?.uid]);

    const handleRemoveSavedThread = useCallback(async (threadId) => {
        if (!viewedUser?.uid) return;
        try {
            await removeSavedThread(viewedUser.uid, threadId);
            setCollections((prev) => ({
                ...prev,
                savedThreads: prev.savedThreads.filter((savedThread) => savedThread.id !== threadId),
            }));

            if (isMe) {
                updateUser({
                    savedThreads: (user?.savedThreads || []).filter((savedThreadId) => savedThreadId !== threadId),
                });
            }
        } catch (removeError) {
            setError(removeError);
        }
    }, [isMe, updateUser, user?.savedThreads, viewedUser?.uid]);

    const profileData = useMemo(() => {
        if (!viewedUser) return null;

        const fullName = viewedUser.name || viewedUser.displayName || "Campus User";
        const institution = viewedUser.campus || "Campus Connect";
        const department = viewedUser.branch || "General";
        const graduationYear = viewedUser.batch ? `${viewedUser.batch}` : "N/A";

        return {
            fullName,
            username: deriveUsername(viewedUser),
            verified: Boolean(viewedUser?.verified ?? viewedUser?.email),
            statusTag: deriveStatusTag(viewedUser),
            availability: deriveAvailability(viewedUser),
            socialLinks: {
                github: viewedUser.github || "",
                linkedin: viewedUser.linkedin || "",
                portfolio: viewedUser.portfolio || "",
            },
            bio:
                viewedUser.bio ||
                "Open to collaborate on campus initiatives, hackathons, and impact-driven projects.",
            education:
                viewedUser.education?.length > 0
                    ? viewedUser.education
                    : [{ institution: `${institution} · ${department}`, years: `Batch ${graduationYear}` }],
            experience:
                viewedUser.experience?.length > 0
                    ? viewedUser.experience
                    : [{ company: "Campus Connect", role: isMe ? "Active Contributor" : "Community Member" }],
            skills: viewedUser.skills || [],
            interests: viewedUser.interests || [],
            projects: viewedUser.projects?.length > 0 ? viewedUser.projects : buildFallbackProjects(),
            stats: {
                posts: collections.posts.length,
                threads: collections.threads.length,
                karma: collections.karma,
            },
        };
    }, [collections.karma, collections.posts.length, collections.threads.length, isMe, viewedUser]);

    return {
        user,
        theme,
        isMe,
        viewedUser,
        profileData,
        collections,
        selectedPost,
        setSelectedPost,
        isEditing,
        setIsEditing,
        isLoading,
        isRefreshing,
        error,
        reloadProfile: loadProfileData,
        handleRemoveSavedPost,
        handleRemoveSavedThread,
        updateUser,
    };
}
