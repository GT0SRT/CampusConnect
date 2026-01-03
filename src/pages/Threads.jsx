import ThreadCard from "../components/threads/ThreadCard";
import { threads } from "../Data/Thread";

const categories = [
  "All",
  "Academics",
  "Placements",
  "Confessions",
  "Exam Help",
  "Funny"
];

export default function Threads() {
  return (
    <div className="space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {/* Search */}
      <input
        className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
        placeholder="Search topics, doubts, or teachers..."
      />

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto">
        {categories.map((cat, i) => (
          <button
            key={cat}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
              i === 0
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Threads */}
      <div className="space-y-4">
        {threads.map(thread => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
    </div>
  );
}