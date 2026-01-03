import { useState } from "react";
import CreateModal from "../components/modals/CreateModal";
import FeedTabs from "../components/feed/FeedTabs";
import PostCard from "../components/feed/PostCard";
import { posts } from "../Data/posts";

export default function Home() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Feed</h2>

        <button className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-sm">
          📍 IIT Bhopal
        </button>
      </div>

      {/* Tabs */}
      <FeedTabs />

      {/* Feed */}
      <div className="space-y-6">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}