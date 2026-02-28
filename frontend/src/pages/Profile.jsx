import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfileDashboard from "../components/profile/ProfileDashboard";
import { ProfilePostCard } from "../components/profile/components/ProfilePostCard";
import { ProfileThreadCard } from "../components/profile/components/ProfileThreadCard";
import PostDetailModal from "../components/modals/PostDetailsModal";
import EditProfileModal from "../components/modals/EditProfileModal";
import { useUserStore } from "../store/useUserStore";
import { getPublicProfile, getUserProfile, syncEducationEntries, updateUserProfile } from "../services/userService";
import { fetchProfileCollections, removeSavedPost, removeSavedThread } from "../services/profileService";

function toDisplayStringList(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (item && typeof item === "object") {
                    return String(item.name || item.title || item.value || item.label || "").trim();
                }

                return String(item || "").trim();
            })
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function toDashboardProfile(targetUser, collections) {
    const fullName = targetUser?.name || targetUser?.displayName || targetUser?.username || "Campus User";
    const username = targetUser?.username || targetUser?.email?.split("@")[0] || "campususer";
    const socialLinks = targetUser?.socialLinks || {
        github: targetUser?.github || "",
        linkedin: targetUser?.linkedin || "",
        portfolio: targetUser?.portfolio || "",
    };

    return {
        fullName,
        username,
        profile_pic: targetUser?.profile_pic || targetUser?.profileImageUrl || "",
        profileImageUrl: targetUser?.profileImageUrl || targetUser?.profile_pic || "",
        verified: Boolean(targetUser?.email),
        statusTag: "Student",
        availability: "Available",
        bio: targetUser?.bio || "",
        education: targetUser?.education || [],
        experience: targetUser?.experience || [],
        skills: toDisplayStringList(targetUser?.skills),
        interests: toDisplayStringList(targetUser?.interests),
        projects: targetUser?.projects || [],
        socialLinks,
        stats: {
            posts: collections.posts.length,
            threads: collections.threads.length,
            karma: collections.karma || targetUser?.karma || 0,
        },
    };
}

function mapSectionToStore(section, data) {
    if (section === "experience") return { experience: data };
    if (section === "skills") return { skills: data };
    if (section === "interests") return { interests: data };
    if (section === "projects") return { projects: data };
    return {};
}

export default function Profile() {
    const navigate = useNavigate();
    const { username: routeUsername } = useParams();
    const user = useUserStore((state) => state.user);
    const theme = useUserStore((state) => state.theme);
    const updateUser = useUserStore((state) => state.updateUser);

    const [isEditing, setIsEditing] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [publicUser, setPublicUser] = useState(null);
    const [collections, setCollections] = useState({
        posts: [],
        threads: [],
        savedPosts: [],
        savedThreads: [],
        karma: 0,
    });

    const currentUsername = user?.username || user?.email?.split("@")[0] || "";
    const normalizedRouteUsername = String(routeUsername || "").trim().toLowerCase();
    const normalizedCurrentUsername = String(currentUsername || "").trim().toLowerCase();
    const isMe = normalizedRouteUsername === normalizedCurrentUsername;

    const viewedUser = useMemo(() => {
        if (isMe) {
            return user;
        }

        return publicUser;
    }, [isMe, publicUser, user]);

    const viewedUserId = viewedUser?.uid || viewedUser?.id || null;
    const fallbackKarma = viewedUser?.karma || 0;
    const savedPostIds = useMemo(() => (isMe ? user?.savedPosts || [] : []), [isMe, user?.savedPosts]);
    const savedThreadIds = useMemo(() => (isMe ? user?.savedThreads || [] : []), [isMe, user?.savedThreads]);

    const loadProfileData = useCallback(async (silent = false) => {
        if (!viewedUserId) {
            setIsLoading(false);
            return;
        }

        setError(null);
        if (silent) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }

        try {
            const result = await fetchProfileCollections({
                userId: viewedUserId,
                savedPostIds,
                savedThreadIds,
                isMe,
                fallbackKarma,
            });

            setCollections({
                posts: result.ownPosts,
                threads: result.ownThreads,
                savedPosts: result.savedPosts,
                savedThreads: result.savedThreads,
                karma: result.karma,
            });

            if (isMe && user?.karmaCount !== result.karma) {
                updateUser({ karmaCount: result.karma });
            }
        } catch (loadError) {
            setError(loadError);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [fallbackKarma, isMe, savedPostIds, savedThreadIds, updateUser, viewedUserId]);

    useEffect(() => {
        if (!routeUsername && currentUsername) {
            navigate(`/profile/${currentUsername}`, { replace: true });
        }
    }, [currentUsername, navigate, routeUsername]);

    useEffect(() => {
        if (!normalizedRouteUsername || isMe) {
            setPublicUser(null);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const profile = await getPublicProfile(normalizedRouteUsername);
                if (!cancelled) {
                    setPublicUser(profile);
                }
            } catch {
                if (!cancelled) {
                    setPublicUser(null);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isMe, normalizedRouteUsername]);

    useEffect(() => {
        if (!viewedUserId) return;
        loadProfileData();
    }, [loadProfileData, viewedUserId]);

    useEffect(() => {
        if (!isMe) return;

        let cancelled = false;

        (async () => {
            try {
                const latestProfile = await getUserProfile();
                if (!cancelled) {
                    updateUser(latestProfile);
                }
            } catch {
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isMe, updateUser]);

    const dashboardProfile = useMemo(() => {
        if (!viewedUser) {
            return null;
        }

        return toDashboardProfile(viewedUser, collections);
    }, [collections, viewedUser]);

    const handleRemoveSavedPost = async (postId) => {
        const currentUserId = user?.uid || user?.id;

        if (!isMe || !currentUserId) {
            return;
        }

        try {
            await removeSavedPost(currentUserId, postId);
            setCollections((prev) => ({
                ...prev,
                savedPosts: prev.savedPosts.filter((item) => item.id !== postId),
            }));
            updateUser({ savedPosts: (user.savedPosts || []).filter((id) => id !== postId) });
        } catch (removeError) {
            setError(removeError);
        }
    };

    const handleRemoveSavedThread = async (threadId) => {
        const currentUserId = user?.uid || user?.id;

        if (!isMe || !currentUserId) {
            return;
        }

        try {
            await removeSavedThread(currentUserId, threadId);
            setCollections((prev) => ({
                ...prev,
                savedThreads: prev.savedThreads.filter((item) => item.id !== threadId),
            }));
            updateUser({ savedThreads: (user.savedThreads || []).filter((id) => id !== threadId) });
        } catch (removeError) {
            setError(removeError);
        }
    };

    const handleEducationSave = async (nextEducation) => {
        if (!isMe) {
            return;
        }

        try {
            const syncedEducation = await syncEducationEntries(nextEducation, user?.education || []);
            updateUser({ education: syncedEducation });
            await loadProfileData(true);
        } catch (educationError) {
            setError(educationError);
        }
    };

    const onSectionSave = (section) => async (data) => {
        if (!isMe) {
            return;
        }

        try {
            const payload = mapSectionToStore(section, data);
            const currentUserId = user?.uid || user?.id;
            const updatedUser = await updateUserProfile(currentUserId, payload);
            updateUser(updatedUser);
            await loadProfileData(true);
        } catch (sectionError) {
            setError(sectionError);
        }
    };

    if (!dashboardProfile) {
        return (
            <div className="min-h-screen pb-20 flex items-center justify-center">
                <div className="text-center">
                    <p className={theme === "dark" ? "text-slate-300" : "text-slate-700"}>User not found.</p>
                    <button
                        type="button"
                        onClick={() => navigate(`/profile/${currentUsername || "me"}`, { replace: true })}
                        className="mt-3 text-sm font-semibold text-cyan-500 hover:text-cyan-400"
                    >
                        Go to my profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            <ProfileDashboard
                isMe={isMe}
                profile={dashboardProfile}
                theme={theme}
                posts={collections.posts}
                threads={collections.threads}
                savedPosts={collections.savedPosts}
                savedThreads={collections.savedThreads}
                isLoading={isLoading}
                isRefreshing={isRefreshing}
                error={error}
                onRetry={() => loadProfileData(true)}
                onEditProfile={() => setIsEditing(true)}
                onConnect={() => console.log("Connect clicked")}
                onMessage={() => console.log("Message clicked")}
                onEducationSave={handleEducationSave}
                onExperienceSave={onSectionSave("experience")}
                onSkillsSave={onSectionSave("skills")}
                onInterestsSave={onSectionSave("interests")}
                onProjectsSave={onSectionSave("projects")}
                renderPost={(post) => (
                    <ProfilePostCard
                        post={post}
                        theme={theme}
                        onOpen={setSelectedPost}
                    />
                )}
                renderThread={(thread) => (
                    <ProfileThreadCard
                        thread={thread}
                        theme={theme}
                        onOpen={(threadId) => navigate(`/threads/${threadId}`)}
                    />
                )}
                renderSavedPost={(post) => (
                    <ProfilePostCard
                        post={post}
                        theme={theme}
                        isSaved
                        showRemove={isMe}
                        onOpen={setSelectedPost}
                        onRemove={handleRemoveSavedPost}
                    />
                )}
                renderSavedThread={(thread) => (
                    <ProfileThreadCard
                        thread={thread}
                        theme={theme}
                        isSaved
                        showRemove={isMe}
                        onOpen={(threadId) => navigate(`/threads/${threadId}`)}
                        onRemove={handleRemoveSavedThread}
                    />
                )}
            />

            {selectedPost ? <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} /> : null}

            {isMe && isEditing ? (
                <EditProfileModal
                    user={user}
                    onClose={() => setIsEditing(false)}
                    onUpdate={(updatedData) => {
                        updateUser(updatedData);
                        loadProfileData(true);
                    }}
                />
            ) : null}
        </div>
    );
}
