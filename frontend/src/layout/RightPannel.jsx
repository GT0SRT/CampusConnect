import { Flame, Calendar, Info } from "lucide-react";
import { useUserStore } from "../store/useUserStore";

export default function RightPanel() {
  const theme = useUserStore((state) => state.theme);
  return (
    <div className="space-y-4">

      {/* Trending */}
      <div className={`rounded-2xl p-4 transition-all duration-300 ${theme === 'dark'
          ? 'bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl'
          : 'bg-white/60 border border-gray-200/50 backdrop-blur-xl'
        }`}>
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-orange-500" />
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
            }`}>
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
              className={`flex justify-between items-center px-3 py-2 rounded-lg transition-all cursor-pointer ${theme === 'dark'
                  ? 'hover:bg-slate-700/50 hover:border-cyan-500/30'
                  : 'hover:bg-gray-100/50'
                }`}
            >
              <span className="text-cyan-500 dark:text-cyan-400 font-medium">
                #{item.tag}
              </span>
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                {item.count}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upcoming Events */}
      <div className={`rounded-2xl p-4 transition-all duration-300 ${theme === 'dark'
          ? 'bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl'
          : 'bg-white/60 border border-gray-200/50 backdrop-blur-xl'
        }`}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-pink-500" />
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
            }`}>
            Upcoming Events
          </h3>
        </div>

        <div className="space-y-3">
          <div className={`p-3 rounded-lg border transition-all ${theme === 'dark'
              ? 'bg-pink-500/10 border-pink-500/30'
              : 'bg-pink-50/50 border-pink-200/50'
            }`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
              }`}>TechFest 2025</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
              📅 Jan 15 · Main Auditorium
            </p>
          </div>

          <div className={`p-3 rounded-lg border transition-all ${theme === 'dark'
              ? 'bg-indigo-500/10 border-indigo-500/30'
              : 'bg-indigo-50/50 border-indigo-200/50'
            }`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
              }`}>Hackathon Sprint</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
              📅 Feb 02 · CSE Block
            </p>
          </div>
        </div>
      </div>

      {/* Campus Tip */}
      <div className={`rounded-2xl p-4 transition-all duration-300 ${theme === 'dark'
          ? 'bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl'
          : 'bg-white/60 border border-gray-200/50 backdrop-blur-xl'
        }`}>
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-green-500" />
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
            }`}>
            Campus Tip
          </h3>
        </div>

        <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
          }`}>
          📌 Follow hashtags like{" "}
          <span className="font-medium text-cyan-500 dark:text-cyan-400">
            #academics
          </span>{" "}
          to personalize your feed.
        </p>
      </div>

    </div>
  );
}
