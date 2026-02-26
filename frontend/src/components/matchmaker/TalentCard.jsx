import MatchRing from "./MatchRing";
import { useUserStore } from "../../store/useUserStore";

export default function TalentCard({ u, onPass, onSave, onConnect, showActions = true }) {
  const theme = useUserStore((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <div
  className={`relative border-t-cyan-400 border-t-4 rounded-2xl border
    transition-all duration-300 
    p-6 pb-28 
    flex flex-col justify-between

    ${
      isDark
        ? "bg-slate-900/70 border-slate-700/70 shadow-[0_10px_30px_rgba(2,6,23,0.45)] hover:shadow-[0_10px_40px_rgba(6,182,212,0.35)] hover:-translate-y-1"
        : "bg-white border-cyan-100 shadow-[0_10px_40px_rgba(79,70,229,0.08)] hover:shadow-[0_10px_40px_rgba(6,182,212,0.35)] hover:-translate-y-1"
    }
  `}
>

      {/* ----------------- TOP CONTENT ----------------- */}
      <div>
        {/* Header section */}
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
              <h2 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                {u.name}
              </h2>
              <p className={`text-sm mt-1 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                {u.branch} · {u.batch} · {u.campus}
              </p>
            </div>
          </div>

          {u.openToConnect && (
            <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              Open
            </span>
          )}
        </div>

        {/* Bio */}
        {u.bio && (
          <p className={`mt-4 text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>
            {u.bio}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 mt-8 text-center">
          <Stat label="Karma" value={u.karmaCount || 0} isDark={isDark} />
          <Stat label="Posts" value={u.postsCount || 0} isDark={isDark} />
          <Stat label="Threads" value={u.threadsCount || 0} isDark={isDark} />
        </div>

        {/* Shared Skills */}
        <Section title="Shared Skills" isDark={isDark}>
          <TagList values={u.commonSkills} emptyText="No shared skills yet" isDark={isDark} />
        </Section>

        {/* Shared Interests */}
        <Section title="Shared Interests" isDark={isDark}>
          <TagList values={u.commonInterests} emptyText="No shared interests yet" isDark={isDark} />
        </Section>

        {/* Looking For */}
        <Section title="Looking For" isDark={isDark}>
          <TagList values={u.commonLookingFor} emptyText="No matching goals" isDark={isDark} />
        </Section>
      </div>

      {/* ----------------- ACTION BAR ----------------- */}
      <div className="absolute bottom-6 left-6 right-6">
        {showActions ? (
          <div className="space-y-2">
            <p className={`text-xs text-center ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              Pass hides for now, Save shortlists, Connect sends teammate intent.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={onPass}
                className={`py-2.5 rounded-xl font-medium transition ${
                  isDark
                    ? "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    : "bg-red-100 text-red-600 hover:bg-red-200"
                }`}
              >
                Pass
              </button>

              <button
                onClick={onSave}
                className={`py-2.5 rounded-xl font-medium transition ${
                  isDark
                    ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                }`}
              >
                Save
              </button>

              <button
                onClick={onConnect}
                className={`py-2.5 rounded-xl font-medium transition ${
                  isDark
                    ? "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                Connect
              </button>
            </div>
          </div>
        ) : (
          // SAME HEIGHT PLACEHOLDER (for background cards)
          <div className="h-[88px]"></div>
        )}
      </div>
    </div>
  );
}

/* ----------------- Subcomponents ----------------- */

function Stat({ label, value, isDark }) {
  return (
    <div className="flex flex-col items-center">
      <p className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
        {value}
      </p>
      <p className={`text-xs uppercase tracking-wider mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
        {label}
      </p>
    </div>
  );
}

function Section({ title, children, isDark }) {
  return (
    <div className="mt-6">
      <p className={`text-xs uppercase tracking-widest font-medium mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
        {title}
      </p>
      {children}
    </div>
  );
}

function TagList({ values = [], emptyText, isDark }) {
  if (!values?.length) {
    return <p className={`text-xs italic ${isDark ? "text-slate-500" : "text-gray-300"}`}>{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.slice(0, 4).map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`px-3 py-1 text-xs rounded-full font-medium ${
            isDark
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}