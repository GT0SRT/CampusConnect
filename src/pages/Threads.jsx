import { useEffect, useState } from "react";
import ThreadCard from "../components/threads/ThreadCard";
import { useUserStore } from "../store/useUserStore";
import { getAllThreads, voteOnThread } from "../services/threadService";
import FeedTabs from "../components/feed/FeedTabs";

export default function Threads() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Global");
  const [votingThreads, setVotingThreads] = useState({});

  const { user } = useUserStore();

  // Fetch posts on load
  const fetchFeed = async () => {
    try {
      setLoading(true);
      const data = await getAllThreads();
      setThreads(data);
    } catch (error) {
      console.error("Error loading feed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleVote = async (threadId, voteType) => {
    if (votingThreads[threadId] || !user?.uid) return;

    try {
      setVotingThreads(prev => ({ ...prev, [threadId]: true }));
      setThreads(prevThreads =>
        prevThreads.map(thread => {
          if (thread.id !== threadId) return thread;

          const upvotes = Array.isArray(thread.upvotes) ? [...thread.upvotes] : [];
          const downvotes = Array.isArray(thread.downvotes) ? [...thread.downvotes] : [];
          const inUp = upvotes.includes(user.uid);
          const inDown = downvotes.includes(user.uid);

          if (inUp || inDown) {
            if (inUp) upvotes.splice(upvotes.indexOf(user.uid), 1);
            if (inDown) downvotes.splice(downvotes.indexOf(user.uid), 1);
          } else {
            if (voteType === "up") upvotes.push(user.uid);
            if (voteType === "down") downvotes.push(user.uid);
          }

          const votes = upvotes.length - downvotes.length;

          return { ...thread, upvotes, downvotes, votes };
        })
      );

      await voteOnThread(threadId, user.uid, voteType);
    } catch (error) {
      console.error("Error voting:", error);
      await fetchFeed();
    } finally {
      setVotingThreads(prev => ({ ...prev, [threadId]: false }));
    }
  };

  const filteredThreads = threads.filter((thread) => {
    if (activeTab === "Global") return true;

    if (!user) return false;

    if (activeTab === "Campus") {
      return thread.campus?.toLowerCase() === user.campus?.toLowerCase();
    }

    if (activeTab === "Branch") {
      return thread.branch?.toLowerCase() === user.branch?.toLowerCase();
    }

    if (activeTab === "Batch") {
      return thread.batch === user.batch;
    }

    return true;
  });

  return (
    <div className="space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
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
        ) : filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} onVote={handleVote} />
          ))
        ) : (
          <div className="flex min-h-[68vh] flex-col items-center justify-center text-center rounded-xl border border-dashed border-gray-200">
            <img className="h-[68vh] md:w-full rounded-xl" src="https://cdn.svgator.com/images/2024/04/book-with-broken-pages-animation-404-error.webp" alt="No threads found illustration" width="800" height="600" loading="lazy" />
          </div>
        )}
      </div>

    </div>
  );
}