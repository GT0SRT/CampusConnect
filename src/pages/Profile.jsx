import { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useUserStore } from '../store/useUserStore';
import { auth, db } from '../firebase'; 
import { getPostsByIds } from "../services/postService";
import PostDetailModal from "../components/modals/PostDetailsModal";

const tabs = ["Posts", "Threads", "Saved", "Settings"];

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, updateUser, clearUser } = useUserStore();
  const [active, setActive] = useState("Posts");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);  
  const [formData, setFormData] = useState({
    name: '',
    campus: '',
    branch: '',
    batch: '',
    bio: ''
  });

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
            setFormData({
                name: currentUserData.name || '',
                campus: currentUserData.campus || '',
                branch: currentUserData.branch || '',
                batch: currentUserData.batch || '',
                bio: currentUserData.bio || ''
            });

            try {
                const postsQuery = query(
                    collection(db, "posts"),
                    where("uid", "==", currentUser.uid),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(postsQuery);
                const postsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMyPosts(postsData);
            } catch (error) {
                console.error("Error fetching user posts:", error);
            }

            if (currentUserData.savedPosts && currentUserData.savedPosts.length > 0) {
                try {
                    const saved = await getPostsByIds(currentUserData.savedPosts);
                    setSavedPosts(saved);
                } catch (error) {
                    console.error("Error fetching saved posts:", error);
                }
            } else {
                setSavedPosts([]); 
            }
        }
      } else {
        navigate('/auth');
      }
      setInitialLoad(false);
    });

    return () => unsubscribe();
  }, [navigate, setUser]);

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), formData);
      updateUser(formData); 
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearUser();
      navigate('/auth');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (initialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null; 

  return (
    <div className="min-h-screen bg-gray-50 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-20">

      {/* Header */}
      <div className="bg-white rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 relative shadow-sm border border-gray-100">

        {/* Edit Button */}
        <button
          onClick={() => setIsEditing(prev => !prev)}
          className="absolute top-4 right-4 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full font-medium transition text-gray-600"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>

        {/* Profile Pic */}
        <img
          src={user.profile_pic || "https://via.placeholder.com/150"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover bg-gray-200 border-4 border-white shadow-sm"
        />

        {/* User Details */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {user.campus || "No Campus"} · {user.branch || "General"} · {user.batch || "202X"}
          </p>
          <p className="text-sm text-gray-600 mt-3 italic max-w-md">
            {user.bio || "No bio yet."}
          </p>

          <div className="flex justify-center md:justify-start gap-8 mt-5">
            <Stat label="Posts" value={myPosts.length || 0} />
            <Stat label="Saved" value={savedPosts.length || 0} />
            <Stat label="Karma" value={user.karmaCount || 0} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${active === tab
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
        <div className="bg-white rounded-xl p-10 text-gray-400 text-center border border-dashed border-gray-300">
          User threads will appear here
        </div>
      )}

      {/* 3. SAVED TAB (NOW FUNCTIONAL) */}
      {active === "Saved" && (
        <div className="grid grid-cols-3 gap-1">
           {savedPosts.length > 0 ? (
            savedPosts.map((post) => (
              <div 
                key={post.id} 
                onClick={() => setSelectedPost(post)}
                className="aspect-square bg-gray-100 relative group overflow-hidden cursor-pointer"
              >
                <img src={post.imageUrl} alt="Saved post" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow-sm">
                   {/* Bookmark Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-black">
                    <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-400">No saved posts</p>
            </div>
          )}
        </div>
      )}

      {/* 4. SETTINGS TAB (WITH EMAIL) */}
      {active === "Settings" && (
        <div className="bg-white rounded-xl p-6 space-y-6 border border-gray-100">
          <h3 className="font-bold text-gray-800">Account</h3>
          
          {/* Email Display */}
          <div>
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
             <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700 text-sm font-medium border border-gray-200">
                {user.email}
             </div>
             <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          <h3 className="font-bold text-gray-800 pt-4 border-t">Preferences</h3>
          <Toggle label="Dark Mode" />
          <Toggle label="Private Account" />
          <div className="pt-4 border-t border-gray-100">
            <button onClick={handleLogout} className="text-red-600 text-sm font-semibold flex items-center gap-2">
               Logout
            </button>
          </div>
        </div>
      )}

      {/* EDIT FORM OVERLAY */}
      {isEditing && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Name</label>
              <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Campus</label>
              <input value={formData.campus} onChange={(e) => setFormData({ ...formData, campus: e.target.value })} className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Branch</label>
              <input value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Batch (Year)</label>
              <input value={formData.batch} onChange={(e) => setFormData({ ...formData, batch: e.target.value })} className="w-full p-2 border rounded-md" />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-500">Bio</label>
              <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full p-2 border rounded-md" rows="3" />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm bg-gray-100 rounded-md">Cancel</button>
            <button onClick={handleSave} disabled={isLoading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">
              {isLoading ? "Saving..." : "Save Changes"}
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

    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <p className="font-bold text-lg text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</p>
    </div>
  );
}

function Toggle({ label }) {
  return (
    <div className="flex justify-between items-center cursor-pointer group">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="w-10 h-5 bg-gray-200 rounded-full relative transition group-hover:bg-gray-300">
        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
      </div>
    </div>
  );
}