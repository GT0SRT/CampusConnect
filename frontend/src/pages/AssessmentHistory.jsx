import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Calendar, Clock, TrendingUp, ArrowLeft } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { getAssessmentHistory } from "../services/assessmentService";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const formatDate = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatDurationFromQuestions = (totalQuestions = 0) => {
    const estimatedMins = Math.max(1, Math.round((Number(totalQuestions) || 0) * 1.5));
    return `${estimatedMins}m (est)`;
};

export default function AssessmentHistory() {
    const theme = useUserStore((state) => state.theme);
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const loadHistory = async () => {
            setLoading(true);
            try {
                const records = await getAssessmentHistory();
                if (active) {
                    setHistory(Array.isArray(records) ? records : []);
                }
            } catch {
                if (active) {
                    setHistory([]);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadHistory();

        return () => {
            active = false;
        };
    }, []);

    const sortedHistory = useMemo(
        () => [...history].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        [history]
    );

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate("/AI-assessment")}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
                        isDark ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-gray-100 text-slate-700 hover:bg-gray-200"
                    )}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
            </div>

            <div className="flex items-center gap-2">
                <h2 className={cn("text-xl mt-1 p-2 font-semibold", isDark ? "text-white" : "text-gray-900")}>
                    <TrendingUp className="h-5 w-5 font-bold inline mr-2" />Recent Assessments
                </h2>
            </div>

            {loading && (
                <div className={cn("p-12 rounded-lg border-dashed border-2 text-center", isDark ? "border-slate-700 bg-slate-800 text-slate-400" : "border-gray-300 bg-gray-50 text-gray-500")}>
                    Loading assessment history...
                </div>
            )}

            {!loading && sortedHistory.length === 0 && (
                <div className={cn("p-20 pt-[40%] pb-[40%] sm:pt-40 sm:pb-40 rounded-lg border-dashed border-2 text-center", isDark ? "border-slate-700 bg-slate-800 text-slate-400" : "border-gray-300 bg-gray-50 text-gray-500")}>
                    No assessments yet. Start one to see your history here.
                </div>
            )}

            <div className="flex flex-col gap-4">
                {sortedHistory.map((item) => (
                    <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate("/AI-assessment", { state: { selectedAssessment: item } })}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                navigate("/AI-assessment", { state: { selectedAssessment: item } });
                            }
                        }}
                        aria-label={`Open details for ${item.company || "Practice"} ${item.role_name || "SDE"} assessment`}
                        className={cn(
                            "group relative rounded-2xl p-5 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40",
                            "backdrop-blur-md border shadow-lg hover:shadow-xl hover:scale-[1.01]",
                            isDark
                                ? "bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600/50"
                                : "bg-white/60 border-gray-200/50 hover:bg-white/80 hover:border-gray-300/50"
                        )}
                    >
                        <div className={cn(
                            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                            isDark ? "bg-linear-to-br from-cyan-500/5 to-purple-500/5" : "bg-linear-to-br from-cyan-500/10 to-purple-500/10"
                        )} />

                        <div className="relative flex items-center justify-between gap-6">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                <Briefcase className={cn("h-5 w-5 mt-0.5 shrink-0", isDark ? "text-cyan-400" : "text-cyan-600")} />
                                <div className="flex-1 min-w-0">
                                    <h3 className={cn("text-base font-bold truncate", isDark ? "text-slate-100" : "text-gray-900")}>
                                        {item.company || "Practice"}
                                    </h3>
                                    <p className={cn("text-sm truncate", isDark ? "text-slate-400" : "text-gray-600")}>
                                        {item.role_name || "SDE"}
                                    </p>
                                </div>
                            </div>

                            <div className="shrink-0 text-right">
                                <div className={cn("text-sm font-bold", isDark ? "text-cyan-300" : "text-cyan-700")}>
                                    Score: {item.overallScore}
                                </div>
                                <div className={cn("text-xs mt-0.5", isDark ? "text-slate-400" : "text-gray-500")}>
                                    {item.correctAnswers}/{item.totalQuestions} correct
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className={cn("h-4 w-4", isDark ? "text-slate-500" : "text-gray-400")} />
                                    <span className={cn("text-xs font-medium", isDark ? "text-slate-400" : "text-gray-500")}>
                                        {formatDate(item.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className={cn("h-4 w-4", isDark ? "text-slate-500" : "text-gray-400")} />
                                    <span className={cn("text-xs font-medium", isDark ? "text-slate-400" : "text-gray-500")}>
                                        {formatDurationFromQuestions(item.totalQuestions)}
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
