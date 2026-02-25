import { useUserStore } from "../../store/useUserStore";
import { TrendingUp, Clock, Briefcase, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function InterviewHistory({ interviews = [], onSelectInterview }) {
  const theme = useUserStore((state) => state.theme);
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const sortedInterviews = [...interviews].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0m";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h2 className={cn("text-xl mt-1 p-2 font-semibold", isDark ? "text-white" : "text-gray-900")}>
          <TrendingUp className="h-5 w-5 font-bold inline mr-2" />Recent Interviews</h2>
      </div>

      {
        sortedInterviews.length === 0 && (
          <div className={cn("p-20 pt-[70%] pb-[70%] sm:pt-40 sm:pb-40 rounded-lg border-dashed border-2 text-center", isDark ? "border-slate-700 bg-slate-800 text-slate-400" : "border-gray-300 bg-gray-50 text-gray-500")}>
            No interviews conducted yet. Start a new interview to see your history here!
          </div>
        )
      }

      <div className="flex flex-col gap-4">
        {sortedInterviews.slice(0, 12).map((interview) => (
          <div
            key={interview.id}
            className={cn(
              "group relative rounded-2xl p-5 cursor-pointer transition-all duration-300",
              "backdrop-blur-md border shadow-lg hover:shadow-xl hover:scale-[1.02]",
              isDark
                ? "bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600/50"
                : "bg-white/60 border-gray-200/50 hover:bg-white/80 hover:border-gray-300/50"
            )}
            onClick={() => {
              if (onSelectInterview) {
                onSelectInterview(interview);
                return;
              }
              navigate(`/interview/history/${interview.id}`, { state: { interview } });
            }}
          >
            {/* Glassmorphic overlay gradient */}
            <div className={cn(
              "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              isDark
                ? "bg-linear-to-br from-cyan-500/5 to-purple-500/5"
                : "bg-linear-to-br from-cyan-500/10 to-purple-500/10"
            )} />

            <div className="relative flex items-center justify-between gap-6">
              {/* Company & Role */}
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <Briefcase className={cn("h-5 w-5 mt-0.5 shrink-0", isDark ? "text-cyan-400" : "text-cyan-600")} />
                <div className="flex-1 min-w-0">
                  <h3 className={cn("text-base font-bold truncate", isDark ? "text-slate-100" : "text-gray-900")}>
                    {interview.company || "N/A"}
                  </h3>
                  <p className={cn("text-sm truncate", isDark ? "text-slate-400" : "text-gray-600")}>
                    {interview.role || "N/A"}
                  </p>
                </div>
              </div>

              {/* Date & Duration */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Calendar className={cn("h-4 w-4", isDark ? "text-slate-500" : "text-gray-400")} />
                  <span className={cn("text-xs font-medium", isDark ? "text-slate-400" : "text-gray-500")}>
                    {formatDate(interview.timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className={cn("h-4 w-4", isDark ? "text-slate-500" : "text-gray-400")} />
                  <span className={cn("text-xs font-medium", isDark ? "text-slate-400" : "text-gray-500")}>
                    {formatDuration(interview.duration)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
