import MatchRing from "./MatchRing";

export default function TalentCard({ u, onSwipe }) {
  return (
    <div className="relative bg-white rounded-2xl border border-indigo-100 shadow-[0_10px_40px_rgba(79,70,229,0.08)] hover:shadow-[0_15px_50px_rgba(79,70,229,0.12)] transition-all duration-300 p-8 h-[480px] flex flex-col justify-between">

      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 rounded-t-2xl"></div>

      {/* TOP CONTENT */}
      <div>
        {/* Top Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <MatchRing percentage={u.compatibilityPercent}>
              <img
                src={u.profile_pic}
                alt={u.name}
                className="w-14 h-14 rounded-full object-cover"
              />
            </MatchRing>

            <div className="leading-tight">
              <h2 className="text-lg font-semibold text-gray-900">
                {u.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {u.branch} · {u.batch}
              </p>
            </div>
          </div>

          {u.openToConnect && (
            <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              Open
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 mt-8 text-center">
          <Stat label="Karma" value={u.karmaCount || 0} />
          <Stat label="Posts" value={u.postsCount || 0} />
          <Stat label="Threads" value={u.threadsCount || 0} />
        </div>

        {/* Shared Interests (Reserved Space Always) */}
        <div className="mt-6 min-h-[80px]">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-3">
            Shared Interests
          </p>

          {u.commonInterests?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {u.commonInterests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-300 italic">
              No shared interests
            </p>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS (Pinned Bottom) */}
      <div className="flex gap-4">
        <button
          onClick={() => onSwipe && onSwipe("left")}
          className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 active:scale-95 transition"
        >
          Reject
        </button>

        <button
          onClick={() => onSwipe && onSwipe("right")}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 active:scale-95 transition"
        >
          Connect
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-lg font-semibold text-gray-900">
        {value}
      </p>
      <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}
