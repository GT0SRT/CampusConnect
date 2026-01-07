export default function FeedTabs({ activeTab, onTabChange }) {
  const tabs = ["Global", "Campus", "Branch", "Batch"];

  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-full w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === tab
              ? "bg-white  shadow text-gray-900 "
              : "text-gray-500  hover:text-gray-700 d"
          }`}
        >
                {tab}
        </button>
      ))}
    </div>
  );
}
