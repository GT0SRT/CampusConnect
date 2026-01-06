import { useState, useEffect } from "react";
import CreateModal from "../components/modals/CreateModal";
import FeedTabs from "../components/feed/FeedTabs";
import PostCard from "../components/feed/PostCard";
import { getAllPosts } from "../services/postService";
import { useUserStore } from "../store/useUserStore";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Global");
  
  const { user } = useUserStore();

  // Fetch posts on load
  const fetchFeed = async () => {
    try {
      setLoading(true);
      const data = await getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error loading feed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (activeTab === "Global") return true;

    if (!user) return false;

    if (activeTab === "Campus") {
      return post.campus?.toLowerCase() === user.campus?.toLowerCase();
    }

    if (activeTab === "Branch") {
      return post.branch?.toLowerCase() === user.branch?.toLowerCase();
    }

    if (activeTab === "Batch") {
      return post.batch === user.batch;
    }

    return true;
  });

  return (
    <div className="space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-20">
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Feed List */}
      <div className="space-y-6">
        {loading ? (
          // Skeleton Loader
          [1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 h-64 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">No posts found in {activeTab}</p>
            {activeTab !== "Global" && (
               <p className="text-xs text-gray-400 mt-1">
                 (Showing posts for {activeTab}: {user?.[activeTab.toLowerCase()] || "N/A"})
               </p>
            )}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-blue-600 text-sm font-semibold hover:underline"
            >
              Create the first one!
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <CreateModal 
          onClose={() => setIsModalOpen(false)} 
          onPostCreated={() => {
            fetchFeed(); 
          }}
        />
      )}
    </div>
  );
}