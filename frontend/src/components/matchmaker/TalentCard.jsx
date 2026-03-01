import MatchRing from "./MatchRing";
import { useUserStore } from "../../store/useUserStore";
import { UserCircle2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TalentCard({ u, onSkip, onConnect, showActions = true }) {
  const theme = useUserStore((state) => state.theme);
  const isDark = theme === "dark";
  const [showImageFallback, setShowImageFallback] = useState(false);
  const navigate = useNavigate();

  const profileUsername = String(u?.username || u?.name || "campususer")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._]/g, "") || "campususer";

  return (
    <div
      className={`relative border-t-cyan-400 border-t-4 rounded-2xl border
    transition-all duration-300 
    p-6 pb-28 
    flex flex-col justify-between

    ${isDark
          ? "bg-slate-900/60 border-slate-700/60 shadow-[0_10px_30px_rgba(2,6,23,0.45)] hover:shadow-[0_10px_40px_rgba(6,182,212,0.35)] hover:-translate-y-1"
          : "bg-white/65 border-gray-200/60 shadow-[0_10px_40px_rgba(79,70,229,0.08)] hover:shadow-[0_10px_40px_rgba(6,182,212,0.30)] hover:-translate-y-1"
        }
  `}
    >

      {/* ----------------- TOP CONTENT ----------------- */}
      <div className="mb-4">
        {/* Header section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <MatchRing percentage={u.compatibilityPercent}>
              {u.profile_pic && !showImageFallback ? (
                <img
                  src={u.profile_pic}
                  alt={u.name}
                  className="w-14 h-14 rounded-full object-cover"
                  onError={() => setShowImageFallback(true)}
                />
              ) : (
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDark ? "bg-slate-700" : "bg-gray-200"}`}>
                  <UserCircle2 className={`h-8 w-8 ${isDark ? "text-slate-300" : "text-gray-500"}`} />
                </div>
              )}
            </MatchRing>

            <div className="leading-tight">
              <h2 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                {u.name}
              </h2>
              <button
                type="button"
                onClick={() => navigate(`/profile/${profileUsername}`)}
                className={`mt-1 text-sm underline-offset-2 transition hover:underline ${isDark ? "text-cyan-300" : "text-cyan-700"}`}
              >
                @{profileUsername}
              </button>
            </div>
          </div>

          {u.openToConnect && (
            <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              Open
            </span>
          )}
        </div>

        {u.bio ? (
          <p className={`mt-4 text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>
            {u.bio}
          </p>
        ) : null}

        {/* Shared Skills */}
        <Section title="Skills" isDark={isDark}>
          <TagList values={u.commonSkills?.length ? u.commonSkills : u.skills} emptyText="No skills listed" isDark={isDark} />
        </Section>

        {/* Shared Interests */}
        <Section title="Interests" isDark={isDark}>
          <TagList values={u.commonInterests?.length ? u.commonInterests : u.interests} emptyText="No interests listed" isDark={isDark} />
        </Section>
      </div>

      {/* ----------------- ACTION BAR ----------------- */}
      <div className="absolute bottom-6 left-6 right-6">
        {showActions ? (
          <div className={`space-y-2 rounded-xl border p-3 ${isDark ? "border-slate-700/60 bg-slate-900/35" : "border-white/60 bg-white/45"}`}>
            <p className={`text-xs text-center ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              Skip moves to next profile, Connect sends teammate intent.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onSkip}
                className={`py-2.5 rounded-xl font-medium transition ${isDark
                  ? "bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20"
                  : "bg-red-100/70 text-red-600 border border-red-200/70 hover:bg-red-200/70"
                  }`}
              >
                Skip
              </button>

              <button
                onClick={onConnect}
                className={`py-2.5 rounded-xl font-medium transition ${isDark
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30"
                  : "bg-cyan-500/90 text-white border border-cyan-400/60 hover:bg-cyan-600"
                  }`}
              >
                Connect
              </button>
            </div>
          </div>
        ) : (
          // SAME HEIGHT PLACEHOLDER (for background cards)
          <div className="h-22"></div>
        )}
      </div>
    </div>
  );
}

/* ----------------- Subcomponents ----------------- */

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
          className={`px-3 py-1 text-xs rounded-full font-medium ${isDark
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