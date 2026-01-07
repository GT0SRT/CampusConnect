import { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { auth, db } from "../firebase";
import { getPostsByIds } from "../services/postService";
import { getUserThreads } from "../services/threadService";
import PostDetailModal from "../components/modals/PostDetailsModal";
import EditProfileModal from "../components/modals/EditProfileModal";
import { calculateUserKarma } from "../services/karmaService";

const tabs = ["Posts", "Threads", "Saved", "Settings"];

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, updateUser, clearUser, theme, toggleTheme } =
    useUserStore();
  const [active, setActive] = useState("Posts");
  const [isEditing, setIsEditing] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [myThreads, setMyThreads] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedThreads, setSavedThreads] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [savedFilter, setSavedFilter] = useState("posts");
  const [karma, setKarma] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        let currentUserData = user;
        if (!currentUserData) {
          try {
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              currentUserData = { uid: currentUser.uid, ...docSnap.data() };
              setUser(currentUserData);
            }
          } catch (error) {
            console.error("Error fetching profile:", error);
          }
        }

        if (currentUserData) {
          try {
            const postsQuery = query(
              collection(db, "posts"),
              where("uid", "==", currentUser.uid),
              orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(postsQuery);
            const postsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setMyPosts(postsData);
          } catch (error) {
            console.error("Error fetching user posts:", error);
          }

          try {
            const threads = await getUserThreads(currentUser.uid);
            setMyThreads(threads);
          } catch (error) {
            console.error("Error fetching user threads:", error);
          }

          try {
            const totalKarma = await calculateUserKarma(currentUser.uid);
            setKarma(totalKarma);
            updateUser({ karmaCount: totalKarma });
          } catch (err) {
            console.error("Error calculating karma:", err);
          }

          if (
            currentUserData.savedPosts &&
            currentUserData.savedPosts.length > 0
          ) {
            try {
              const saved = await getPostsByIds(currentUserData.savedPosts);
              setSavedPosts(saved);
            } catch (error) {
              console.error("Error fetching saved posts:", error);
            }
          } else {
            setSavedPosts([]);
          }

          if (
            currentUserData.savedThreads &&
            currentUserData.savedThreads.length > 0
          ) {
            try {
              const { getThreadsByIds } = await import(
                "../services/threadService"
              );
              const saved = await getThreadsByIds(currentUserData.savedThreads);
              setSavedThreads(saved);
            } catch (error) {
              console.error("Error fetching saved threads:", error);
            }
          } else {
            setSavedThreads([]);
          }
        }
      } else {
        navigate("/auth");
      }
    });

    return () => unsubscribe();
  }, [navigate, setUser]);

  // useEffect(() => {
  //   if (theme === "dark") {
  //     document.documentElement.classList.add("dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //   }
  // }, [theme]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearUser();
      navigate("/auth");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (!user) return null;

  return (
    <div
      className={`min-h-screen space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-20 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div className="bg-white rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 relative shadow-sm border border-gray-100">
        {/* Edit Button */}
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className="absolute top-4 right-4 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full font-medium transition text-gray-600"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>

        {/* Profile Pic */}
        <img
          src={
            user.profile_pic ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.name || "User"
            )}&background=random&size=150`
          }
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover bg-gray-200 border-4 border-white shadow-sm"
        />

        {/* User Details */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {user.campus || "No Campus"} · {user.branch || "General"} ·{" "}
            {user.batch || "202X"}
          </p>
          <p className="text-sm text-gray-600 mt-3 italic max-w-md">
            {user.bio || "No bio yet."}
          </p>

          <div className="flex justify-center md:justify-start gap-6 mt-5">
            <Stat label="Posts" value={myPosts.length || 0} />
            <Stat label="Threads" value={myThreads.length || 0} />
            <Stat
              label="Saved"
              value={savedPosts.length + savedThreads.length || 0}
            />
            <Stat label="Karma" value={karma} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              active === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- CONTENT AREA --- */}

      {/* 1. MY POSTS TAB */}
      {active === "Posts" && (
        <div className="grid grid-cols-3 gap-1">
          {myPosts.length > 0 ? (
            myPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="aspect-square bg-gray-100 relative group overflow-hidden cursor-pointer"
              >
                <img
                  src={post.imageUrl}
                  alt="User post"
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-bold">
                  <span>❤️ {post.likes || 0}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-400">No posts yet</p>
            </div>
          )}
        </div>
      )}

      {/* 2. THREADS TAB */}
      {active === "Threads" && (
        <div className="space-y-3">
          {myThreads.length > 0 ? (
            myThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => navigate(`/threads/${thread.id}`)}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  {/* Category Badge */}
                  <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-full">
                    {thread.category || "General"}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition mb-2">
                      {thread.title}
                    </h3>

                    {/* Description */}
                    <div
                      className="text-sm text-gray-600 line-clamp-2 mb-3"
                      dangerouslySetInnerHTML={{ __html: thread.description }}
                    />

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                        {(thread.upvotes?.length || 0) -
                          (thread.downvotes?.length || 0)}{" "}
                        votes
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {thread.Discussion?.length || 0} answers
                      </span>
                      <span className="ml-auto">
                        {thread.createdAt?.toDate
                          ? new Date(
                              thread.createdAt.toDate()
                            ).toLocaleDateString()
                          : "Recently"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-gray-400 font-medium">No threads yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Start a discussion to see it here
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. SAVED TAB */}
      {active === "Saved" && (
        <div>
          {/* Filter Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setSavedFilter("posts")}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                savedFilter === "posts"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Posts ({savedPosts.length})
            </button>
            <button
              onClick={() => setSavedFilter("threads")}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                savedFilter === "threads"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Threads ({savedThreads.length})
            </button>
          </div>

          {/* Saved Posts */}
          {savedFilter === "posts" &&
            (savedPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {savedPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="aspect-square bg-gray-100 relative group overflow-hidden cursor-pointer"
                  >
                    <img
                      src={post.imageUrl}
                      alt="Saved post"
                      className="w-full h-full object-cover group-hover:opacity-75 transition"
                    />

                    {/* Remove bookmark button */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const { toggleBookmark } = await import(
                          "../services/interactionService"
                        );
                        try {
                          await toggleBookmark(user.uid, post.id, true);
                          const updated = savedPosts.filter(
                            (p) => p.id !== post.id
                          );
                          setSavedPosts(updated);
                          updateUser({
                            savedPosts: user.savedPosts.filter(
                              (id) => id !== post.id
                            ),
                          });
                        } catch (error) {
                          console.error("Error removing from saved:", error);
                        }
                      }}
                      className="absolute top-2 right-2 bg-white/90 rounded-full p-2 shadow-sm text-gray-700 hover:text-red-600"
                      title="Unsave"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400">No saved posts</p>
              </div>
            ))}

          {/* Saved Threads */}
          {savedFilter === "threads" &&
            (savedThreads.length > 0 ? (
              <div className="space-y-3">
                {savedThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-400 hover:shadow-md transition group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/threads/${thread.id}`)}
                      >
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition mb-2">
                          {thread.title}
                        </h3>
                        <div
                          className="text-sm text-gray-600 line-clamp-2 mb-3"
                          dangerouslySetInnerHTML={{
                            __html: thread.description,
                          }}
                        />
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                            {(thread.upvotes?.length || 0) -
                              (thread.downvotes?.length || 0)}{" "}
                            votes
                          </span>
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            {thread.Discussion?.length || 0} answers
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          const { toggleThreadBookmark } = await import(
                            "../services/interactionService"
                          );
                          try {
                            await toggleThreadBookmark(
                              user.uid,
                              thread.id,
                              true
                            );
                            const updated = savedThreads.filter(
                              (t) => t.id !== thread.id
                            );
                            setSavedThreads(updated);
                            updateUser({
                              savedThreads:
                                user.savedThreads?.filter(
                                  (id) => id !== thread.id
                                ) || [],
                            });
                          } catch (error) {
                            console.error("Error removing from saved:", error);
                          }
                        }}
                        className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400">No saved threads</p>
              </div>
            ))}
        </div>
      )}

      {/* 4. SETTINGS TAB (WITH EMAIL) */}
      {active === "Settings" && (
        <div className="bg-white rounded-xl p-6 space-y-6 border border-gray-100">
          <h3 className="font-bold text-gray-800">Account</h3>

          {/* Email Display */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Email
            </label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700 text-sm font-medium border border-gray-200">
              {user.email}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Email cannot be changed.
            </p>
          </div>

          <h3 className="font-bold text-gray-800 pt-4 border-t">Preferences</h3>
          <Toggle
            label="Dark Mode"
            isOn={theme === "dark"}
            onToggle={toggleTheme}
          />
          <Toggle label="Private Account" isOn={false} onToggle={() => {}} />
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="text-red-600 text-sm font-semibold flex items-center gap-2"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* POST DETAIL MODAL */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditing(false)}
          onUpdate={(updatedData) => updateUser(updatedData)}
        />
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <p className="font-bold text-lg text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
        {label}
      </p>
    </div>
  );
}

function Toggle({ label, isOn, onToggle }) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
          isOn ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
            isOn ? "left-[26px]" : "left-0.5"
          }`}
        ></div>
      </button>
    </div>
  );
}
