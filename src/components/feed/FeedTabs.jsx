import { useUserStore } from "../../store/useUserStore";

export default function FeedTabs({ activeTab, onTabChange }) {
  const tabs = ["Global", "Campus", "Branch", "Batch"];
  const theme = useUserStore((state) => state.theme);

  return (
    <div className={`flex gap-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} p-1 rounded-full w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab
            ? "bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white"
            : `${theme === "dark" ? "text-gray-300 hover:text-gray-100" : "text-gray-700 hover:text-gray-900"}`
            } `}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
