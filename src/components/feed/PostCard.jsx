import { Heart } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { Share2 } from 'lucide-react';
import { Bookmark } from 'lucide-react';

export default function PostCard({ post }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        <div className="flex-1">
          <p className="font-medium text-sm">{post.author}</p>
          <p className="text-xs text-gray-500">
            {post.college} · {post.time}
          </p>
        </div>
        <span className="text-gray-400">•••</span>
      </div>

      {/* Image */}
      <img
        src={post.image}
        alt=""
        className="w-full max-h-[420px] object-cover"
      />

      {/* Actions */}
      <div className="p-4 space-y-2">
        <div className="grid grid-cols-4 gap-4 text-gray-600 text-lg">
            <div className='col-span-2 flex gap-6'>
                <Heart />
                <MessageCircle />
                <Share2 />
            </div>
            <div className='col-span-2 ml-auto'><Bookmark /></div>
        </div>

        <p className="text-sm font-medium">{post.likes} likes</p>

        <p className="text-sm">
          <span className="font-medium">{post.author}</span>{" "}
          {post.caption}
        </p>

        <div className="flex gap-2">
          {post.tags.map(tag => (
            <span
              key={tag}
              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        <p className="text-xs text-gray-500">
          View all 156 comments
        </p>
      </div>
    </div>
  );
}
