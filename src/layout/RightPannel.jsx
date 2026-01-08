import { Flame, Calendar, Info } from "lucide-react";
import { useUserStore } from "../store/useUserStore";

export default function RightPanel() {
  const theme = useUserStore((state) => state.theme);
  return (
    <div className="space-y-4">

      {/* Trending */}
      <div className={`${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"} rounded-2xl p-4 shadow-sm`}>
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-orange-500" />
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Trending on Campus
          </h3>
        </div>

        <ul className="space-y-2 text-sm">
          {[
            { tag: "Placements2025", count: "1.2k posts" },
            { tag: "GATEPrep", count: "850 posts" },
            { tag: "TechFest", count: "640 posts" },
          ].map((item) => (
            <li
              key={item.tag}
              className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                #{item.tag}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item.count}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upcoming Events */}
      <div className={`${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"} rounded-2xl p-4 shadow-sm`}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-pink-500" />
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Upcoming Events
          </h3>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-pink-50 dark:bg-pink-900/30">
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>TechFest 2025</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              📅 Jan 15 · Main Auditorium
            </p>
          </div>

          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Hackathon Sprint</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              📅 Feb 02 · CSE Block
            </p>
          </div>
        </div>
      </div>

      {/* Campus Tip */}
      <div className={`${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"} rounded-2xl p-4 shadow-sm`}>
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-green-500" />
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Campus Tip
          </h3>
        </div>

        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-black'}`}>
          📌 Follow hashtags like{" "}
          <span className="font-medium text-blue-600 dark:text-blue-400">
            #academics
          </span>{" "}
          to personalize your feed.
        </p>
      </div>

    </div>
  );
}
