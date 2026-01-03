export default function FeedTabs() {
  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-full w-fit">
      {["Global", "Campus", "Branch"].map((tab, i) => (
        <button
          key={tab}
          className={`px-4 py-1.5 rounded-full text-sm ${
            i === 1
              ? "bg-white shadow text-gray-900"
              : "text-gray-500"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
