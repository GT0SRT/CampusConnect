import { useNavigate, useParams } from "react-router-dom";
import ProfileDashboard from "../components/profile/ProfileDashboard";
import { ProfilePostCard } from "../components/profile/components/ProfilePostCard";
import { ProfileThreadCard } from "../components/profile/components/ProfileThreadCard";
import PostDetailModal from "../components/modals/PostDetailsModal";
import EditProfileModal from "../components/modals/EditProfileModal";
import { useProfileController } from "../hooks/useProfileController";

export default function Profile() {
    const navigate = useNavigate();
    const { uid: routeUid } = useParams();

    const {
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
        reloadProfile,
        handleRemoveSavedPost,
        handleRemoveSavedThread,
        updateUser,
    } = useProfileController(routeUid);

    if (!viewedUser || !profileData) {
        return null;
    }

    return (
        <div className="min-h-screen pb-20">
            <ProfileDashboard
                isMe={isMe}
                profile={profileData}
                theme={theme}
                posts={collections.posts}
                threads={collections.threads}
                savedPosts={collections.savedPosts}
                savedThreads={collections.savedThreads}
                isLoading={isLoading}
                isRefreshing={isRefreshing}
                error={error}
                onRetry={reloadProfile}
                onEditProfile={() => setIsEditing(true)}
                onConnect={() => console.log("Connect clicked")}
                onMessage={() => console.log("Message clicked")}
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
                    onUpdate={(updatedData) => updateUser(updatedData)}
                />
            ) : null}
        </div>
    );
}
