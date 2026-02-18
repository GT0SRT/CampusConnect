import { X } from "lucide-react";
import PostCard from "../feed/PostCard";

import { useUserStore } from "../../store/useUserStore";

export default function PostDetailModal({ post, onClose }) {
  const theme = useUserStore((state) => state.theme);
  if (!post) return null;

  return (
    <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-black/60' : 'bg-black/40'
      }`}>
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/70 hover:text-white transition"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Content Container */}
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden rounded-xl">
        <PostCard post={post} />
      </div>
    </div>
  );
}