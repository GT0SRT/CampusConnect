import { useUserStore } from "../../store/useUserStore";

export default function FeedTabs({ activeTab, onTabChange }) {
  const tabs = ["Global", "Campus", "Branch", "Batch"];
  const theme = useUserStore((state) => state.theme);

  return (
    <div className={`flex gap-2 bg-transparent p-1 rounded-full backdrop-blur-xl w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab
            ? "bg-white dark:bg-cyan-500 shadow text-cyan-500 dark:text-white"
            : `${theme === "dark" ? "text-gray-300 hover:text-gray-100" : "text-gray-500 hover:text-cyan-500"}`
            } `}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
