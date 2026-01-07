import { Flame, Calendar, Info } from "lucide-react";

export default function RightPanel() {
  return (
    <div className="space-y-4">

      {/* Trending */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-gray-900">
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
              className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <span className="text-blue-600 font-medium">
                #{item.tag}
              </span>
              <span className="text-xs text-gray-500">
                {item.count}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-pink-500" />
          <h3 className="font-semibold text-gray-900">
            Upcoming Events
          </h3>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-pink-50">
            <p className="text-sm font-medium">TechFest 2025</p>
            <p className="text-xs text-gray-600">
              📅 Jan 15 · Main Auditorium
            </p>
          </div>

          <div className="p-3 rounded-lg bg-indigo-50">
            <p className="text-sm font-medium">Hackathon Sprint</p>
            <p className="text-xs text-gray-600">
              📅 Feb 02 · CSE Block
            </p>
          </div>
        </div>
      </div>

      {/* Campus Tip */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-green-500" />
          <h3 className="font-semibold text-gray-900">
            Campus Tip
          </h3>
        </div>

        <p className="text-sm text-gray-600">
          📌 Follow hashtags like{" "}
          <span className="font-medium text-blue-600">
            #academics
          </span>{" "}
          to personalize your feed.
        </p>
      </div>

    </div>
  );
}
