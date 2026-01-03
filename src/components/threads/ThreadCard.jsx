export default function ThreadCard({ thread }) {
  return (
    <div className="bg-white rounded-xl border flex overflow-hidden">
      
      {/* Vote Column */}
      <div className="w-14 bg-gray-50 flex flex-col items-center justify-center text-gray-600">
        <button>▲</button>
        <span className="text-sm font-medium">{thread.votes}</span>
        <button>▼</button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 space-y-2">
        <h3 className="font-medium">{thread.title}</h3>

        <div className="text-sm text-gray-500 flex items-center gap-2">
          <span className="text-blue-600">{thread.category}</span>
          <span>•</span>
          <span>{thread.comments} comments</span>
          <span>•</span>
          <span>@{thread.author}</span>
        </div>
      </div>
    </div>
  );
}