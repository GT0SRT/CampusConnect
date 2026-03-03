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
import { generateConnectionMessage, sendConnectionRequest, startDirectMessage } from "../services/squadService";

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
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [connectMessage, setConnectMessage] = useState("");
    const [isGeneratingConnectMessage, setIsGeneratingConnectMessage] = useState(false);
    const [isSendingConnectRequest, setIsSendingConnectRequest] = useState(false);
    const [connectUiNotice, setConnectUiNotice] = useState(null);
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

    const handleMessageClick = async () => {
        const targetId = viewedUser?.uid || viewedUser?.id;
        if (!targetId || isMe) {
            return;
        }

        try {
            const result = await startDirectMessage(targetId);
            const chatTarget = result?.chatTarget || {
                id: targetId,
                uid: targetId,
                username: viewedUser?.username || "",
                name: viewedUser?.name || viewedUser?.username || "Campus User",
                avatar: viewedUser?.profileImageUrl || viewedUser?.profile_pic || "",
            };

            navigate("/squad", {
                state: {
                    openChatTarget: chatTarget,
                },
            });
        } catch (messageError) {
            setError(messageError);
        }
    };

    const handleConnectClick = async () => {
        const targetId = viewedUser?.uid || viewedUser?.id;
        if (!targetId || isMe) {
            return;
        }

        setConnectUiNotice(null);
        setIsConnectModalOpen(true);
        setIsGeneratingConnectMessage(true);

        try {
            const aiText = await generateConnectionMessage({
                myName: user?.name || user?.username,
                theirName: viewedUser?.name || viewedUser?.username,
                context: `${viewedUser?.branch || ""} ${viewedUser?.campus || ""}`.trim(),
            });
            setConnectMessage(String(aiText || "").trim());
        } catch (connectError) {
            setConnectMessage(
                `Hey ${viewedUser?.name || viewedUser?.username || "there"}, your profile stood out. Want to connect and explore a collaboration opportunity together?`
            );
            setConnectUiNotice({
                type: "error",
                text: "Could not generate AI message, using a default draft.",
            });
            setError(connectError);
        } finally {
            setIsGeneratingConnectMessage(false);
        }
    };

    const handleConnectSubmit = async () => {
        const targetId = viewedUser?.uid || viewedUser?.id;
        if (!targetId || isMe || isSendingConnectRequest) {
            return;
        }

        const finalText = String(connectMessage || "").trim();
        if (!finalText) {
            setConnectUiNotice({
                type: "error",
                text: "Please enter a message before sending.",
            });
            return;
        }

        setIsSendingConnectRequest(true);

        try {
            await sendConnectionRequest({
                targetUserId: targetId,
                text: finalText,
            });

            setIsConnectModalOpen(false);
            setConnectMessage("");
            setConnectUiNotice({
                type: "success",
                text: "Connection request sent.",
            });
            await loadProfileData(true);
        } catch (connectError) {
            const message =
                connectError?.response?.data?.error ||
                connectError?.message ||
                "Failed to send request.";
            setConnectUiNotice({
                type: "error",
                text: message,
            });
            setError(connectError);
        } finally {
            setIsSendingConnectRequest(false);
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
            {connectUiNotice ? (
                <div
                    className={[
                        "mx-auto mb-4 max-w-5xl rounded-xl border px-4 py-3 text-sm",
                        connectUiNotice.type === "success"
                            ? theme === "dark"
                                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                                : "border-cyan-300 bg-cyan-50 text-cyan-800"
                            : theme === "dark"
                                ? "border-red-500/30 bg-red-500/10 text-red-200"
                                : "border-red-300 bg-red-50 text-red-700",
                    ].join(" ")}
                >
                    {connectUiNotice.text}
                </div>
            ) : null}

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
                onConnect={handleConnectClick}
                onMessage={handleMessageClick}
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

            {isConnectModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div
                        className={[
                            "w-full max-w-lg rounded-2xl border p-5 backdrop-blur-xl",
                            theme === "dark" ? "border-slate-700 bg-slate-900/95" : "border-gray-200 bg-white/95",
                        ].join(" ")}
                    >
                        <h2 className={theme === "dark" ? "text-lg font-bold text-slate-100" : "text-lg font-bold text-neutral-900"}>
                            Send Connection Request
                        </h2>
                        <p className={theme === "dark" ? "mt-1 text-sm text-slate-300" : "mt-1 text-sm text-neutral-600"}>
                            Add a short message to connect with {viewedUser?.name || viewedUser?.username || "this user"}.
                        </p>

                        <div className="mt-4">
                            <label className={theme === "dark" ? "mb-1 block text-xs font-medium text-slate-300" : "mb-1 block text-xs font-medium text-neutral-700"}>
                                Message
                            </label>
                            <textarea
                                value={connectMessage}
                                onChange={(event) => setConnectMessage(event.target.value)}
                                rows={4}
                                placeholder={isGeneratingConnectMessage ? "Generating AI suggestion..." : "Write your connection message"}
                                className={[
                                    "w-full rounded-xl border px-3 py-2 text-sm outline-none",
                                    theme === "dark"
                                        ? "border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400"
                                        : "border-gray-300 bg-white text-neutral-900 placeholder:text-gray-400",
                                ].join(" ")}
                            />
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsConnectModalOpen(false);
                                    setConnectMessage("");
                                }}
                                className={[
                                    "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                                    theme === "dark"
                                        ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                                        : "border-gray-300 text-neutral-700 hover:bg-gray-100",
                                ].join(" ")}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConnectSubmit}
                                disabled={isGeneratingConnectMessage || isSendingConnectRequest}
                                className={[
                                    "rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                                    theme === "dark"
                                        ? "border border-cyan-500/30 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                                        : "bg-cyan-600 text-white hover:bg-cyan-700",
                                ].join(" ")}
                            >
                                {isSendingConnectRequest ? "Sending..." : "Send Request"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
