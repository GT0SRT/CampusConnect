import { useUserStore } from "../../store/useUserStore";
import { ArrowLeft, TrendingUp, Clock, CheckCircle, AlertCircle, Award, Target } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useInterviewStore } from "../../store/useInterviewStore";
import { useCallback, useEffect, useState } from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");
const API_BASE_URL = (import.meta.env.VITE_AI_ENGINE_BASE_URL || import.meta.env.VITE_API_BASE_URL)?.replace(/\/$/, "");

export default function InterviewSummary({ interview, onBackToSetup }) {
  const theme = useUserStore((state) => state.theme);
  const interviewHistory = useInterviewStore((state) => state.interviewHistory);
  const updateHistoryInterview = useInterviewStore((state) => state.updateHistoryInterview);
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [isFetchingAnalysis, setIsFetchingAnalysis] = useState(false);
  const [analysisFetchError, setAnalysisFetchError] = useState(false);

  const resolvedInterview =
    interview ||
    interviewHistory.find((item) => String(item.id) === String(id)) ||
    location.state?.interview ||
    null;

  const runAnalysis = useCallback(async () => {
    if (!resolvedInterview?.id) return;

    setIsFetchingAnalysis(true);
    setAnalysisFetchError(false);

    try {
      if (!API_BASE_URL) throw new Error("VITE_AI_ENGINE_BASE_URL (or VITE_API_BASE_URL) is not configured");

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: resolvedInterview.transcript || [],
          role_name: resolvedInterview.role,
          company: resolvedInterview.company,
          topics: resolvedInterview.topics,
          resume_summary: resolvedInterview?.metadata?.resumeOverview || "No resume provided",
          interview_duration_sec: resolvedInterview.duration || 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis request failed with ${response.status}`);
      }

      const data = await response.json();
      updateHistoryInterview(resolvedInterview.id, {
        analysis: data,
        status: "completed",
      });
    } catch {
      updateHistoryInterview(resolvedInterview.id, {
        analysis: null,
        status: "error",
      });
      setAnalysisFetchError(true);
    } finally {
      setIsFetchingAnalysis(false);
    }
  }, [
    resolvedInterview?.id,
    resolvedInterview?.transcript,
    resolvedInterview?.role,
    resolvedInterview?.company,
    resolvedInterview?.topics,
    resolvedInterview?.metadata?.resumeOverview,
    resolvedInterview?.duration,
    updateHistoryInterview,
  ]);

  useEffect(() => {
    if (!resolvedInterview?.id) return;
    if (resolvedInterview.analysis !== null) return;
    if (isFetchingAnalysis) return;
    runAnalysis();
  }, [resolvedInterview?.id, resolvedInterview?.analysis, isFetchingAnalysis, runAnalysis]);

  const handleBack = () => {
    if (onBackToSetup) {
      onBackToSetup();
      return;
    }
    navigate("/interview/history");
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0m 0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case "strong_yes":
        return isDark ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-green-700 border-green-200 bg-green-50";
      case "yes":
        return isDark ? "text-blue-400 border-blue-500/30 bg-blue-500/10" : "text-blue-700 border-blue-200 bg-blue-50";
      case "maybe":
        return isDark ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" : "text-yellow-700 border-yellow-200 bg-yellow-50";
      default:
        return isDark ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-red-700 border-red-200 bg-red-50";
    }
  };

  const getRecommendationLabel = (rec) => {
    switch (rec) {
      case "strong_yes": return "Strong Yes - Ready to Move Forward";
      case "yes": return "Yes - Good Fit";
      case "maybe": return "Maybe - Needs Development";
      default: return "Further Evaluation Needed";
    }
  };

  if (!resolvedInterview) {
    return (
      <div className={cn("min-h-screen", isDark ? "bg-transparent text-white" : "bg-transparent text-slate-900")}>
        <div className="max-w-screen md:max-w-4xl mx-auto">
          <div className={cn("rounded-lg p-6 border text-center", isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white")}>
            <AlertCircle className={cn("h-8 w-8 mx-auto mb-2", isDark ? "text-amber-400" : "text-amber-600")} />
            <p className="font-semibold">Interview not found.</p>
            <button
              onClick={handleBack}
              className={cn("mt-4 px-4 py-2 rounded-md font-semibold transition", isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-slate-900")}
            >
              Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }

  const analysis = resolvedInterview?.analysis;
  const metrics = analysis?.metrics || {};
  const overallScore = Number.isFinite(analysis?.overall_score) ? analysis.overall_score : null;
  const recommendation = analysis?.recommendation || null;
  const strengths = analysis?.key_strengths || [];
  const overallAssessment = analysis?.overall_assessment || null;
  const reasoning = analysis?.reasoning || null;
  const topicsCovered = analysis?.topics_covered || [];

  const toMetric = (value) => {
    if (!Number.isFinite(value)) return null;
    const numeric = value > 10 && value <= 100 ? value / 10 : value;
    return Math.max(0, Math.min(10, numeric));
  };
  const technical = toMetric(metrics.technical);
  const behavioral = toMetric(metrics.behavioral);
  const communication = toMetric(metrics.communication);
  const problemSolving = toMetric(metrics.problem_solving);
  const companyKnowledge = toMetric(metrics.company_knowledge);

  const metricBarWidth = (value) => `${Math.max(0, Math.min(10, value || 0)) * 10}%`;

  const handleRetryAnalyze = () => {
    updateHistoryInterview(resolvedInterview.id, { analysis: null, status: "analyzing" });
    setAnalysisFetchError(false);
    runAnalysis();
  };

  const isAnalysisPending =
    (resolvedInterview?.status === "analyzing" || isFetchingAnalysis) &&
    resolvedInterview?.analysis === null;

  return (
    <div className={cn("min-h-screen", isDark ? "bg-transparent text-white" : "bg-transparent text-slate-900")}>
      <div className="max-w-screen md:max-w-4xl mx-auto">
        {/* Header */}
        <div className="grid grid-cols-5 justify-center mb-4">
          <button
            onClick={handleBack}
            className={cn("flex col-span-1 w-fit gap-2 px-4 py-2 rounded-lg transition", isDark ? "bg-transparent hover:bg-slate-700" : "bg-transparent hover:bg-gray-100")}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold whitespace-nowrap">Interview Summary</h1>
        </div>

        {isAnalysisPending && (
          <div className={cn("rounded-lg p-8 mb-4 border text-center", isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white")}>
            <div className="flex items-center justify-center mb-3">
              <div className={cn("w-8 h-8 border-4 rounded-full animate-spin", isDark ? "border-slate-600 border-t-cyan-400" : "border-gray-200 border-t-cyan-600")} />
            </div>
            <p className={cn("font-semibold", isDark ? "text-slate-200" : "text-slate-800")}>Analyzing your interview...</p>
            <p className={cn("text-sm mt-1", isDark ? "text-slate-400" : "text-gray-600")}>Generating detailed AI feedback. This may take a few moments.</p>
          </div>
        )}

        {(analysisFetchError || resolvedInterview?.status === "error") && (
          <div className={cn("rounded-lg p-4 mb-4 border-2", isDark ? "border-red-500/40 bg-red-500/10" : "border-red-200 bg-red-50")}>
            <p className={cn("font-semibold", isDark ? "text-red-300" : "text-red-700")}>Analysis unavailable</p>
            <p className={cn("text-sm mt-1", isDark ? "text-red-200" : "text-red-600")}>We couldn’t load analysis right now.</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={handleRetryAnalyze}
                className={cn("px-3 py-1.5 rounded-md text-sm font-semibold transition", isDark ? "bg-red-600 hover:bg-red-500 text-white" : "bg-red-600 hover:bg-red-700 text-white")}
              >
                Retry Analyze Later
              </button>
              <a
                href="mailto:support@campusconnect.ai"
                className={cn("px-3 py-1.5 rounded-md text-sm font-semibold transition", isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-slate-900")}
              >
                Contact Support
              </a>
            </div>
          </div>
        )}

        {/* Interview Info */}
        <div className={cn("rounded-lg p-4 mb-4 border", isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white")}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={cn("text-sm mb-1", isDark ? "text-slate-400" : "text-gray-600")}>Company</p>
              <p className="text-lg font-semibold">{resolvedInterview.company || "N/A"}</p>
            </div>
            <div>
              <p className={cn("text-sm mb-1", isDark ? "text-slate-400" : "text-gray-600")}>Position</p>
              <p className="text-lg font-semibold">{resolvedInterview.role || "N/A"}</p>
            </div>
            <div>
              <p className={cn("text-sm mb-1", isDark ? "text-slate-400" : "text-gray-600")}>Date & Time</p>
              <p className="text-lg">{resolvedInterview.timestamp ? formatDate(resolvedInterview.timestamp) : "N/A"}</p>
            </div>
            <div>
              <p className={cn("text-sm mb-1", isDark ? "text-slate-400" : "text-gray-600")}>Duration</p>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <p className="text-lg">{formatDuration(resolvedInterview?.duration)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Topics Covered */}
        {topicsCovered.length > 0 && (
          <div className={cn("rounded-lg p-4 mb-4 border", isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white")}>
            <h2 className="text-lg font-semibold mb-2">Topics Covered</h2>
            <div className="grid grid-cols-2 gap-3">
              {topicsCovered.map((topic) => (
                <div key={topic} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Assessment */}
        {analysis && overallAssessment && (
          <div className={cn("rounded-lg p-4 mb-4 border", isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white")}>
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Overall Assessment
            </h2>
            <p className={cn("text-base leading-relaxed", isDark ? "text-slate-300" : "text-gray-700")}>
              {overallAssessment}
            </p>
          </div>
        )}

        {/* Performance Metrics */}
        {analysis && (
          <div className={cn("rounded-lg p-4 mb-4 border", isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white")}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Breakdown
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Technical</span>
                  <span className="font-semibold text-sm">{technical ?? "-"} / 10</span>
                </div>
                <div className={cn("h-2 rounded-full overflow-hidden", isDark ? "bg-slate-700" : "bg-gray-200")}>
                  <div
                    className="h-full transition-all duration-1000 bg-cyan-500"
                    style={{ width: metricBarWidth(technical) }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Behavioral</span>
                  <span className="font-semibold text-sm">{behavioral ?? "-"} / 10</span>
                </div>
                <div className={cn("h-2 rounded-full overflow-hidden", isDark ? "bg-slate-700" : "bg-gray-200")}>
                  <div
                    className="h-full transition-all duration-1000 bg-indigo-500"
                    style={{ width: metricBarWidth(behavioral) }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Communication</span>
                  <span className="font-semibold text-sm">{communication ?? "-"} / 10</span>
                </div>
                <div className={cn("h-2 rounded-full overflow-hidden", isDark ? "bg-slate-700" : "bg-gray-200")}>
                  <div
                    className="h-full transition-all duration-1000 bg-emerald-500"
                    style={{ width: metricBarWidth(communication) }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Problem Solving</span>
                  <span className="font-semibold text-sm">{problemSolving ?? "-"} / 10</span>
                </div>
                <div className={cn("h-2 rounded-full overflow-hidden", isDark ? "bg-slate-700" : "bg-gray-200")}>
                  <div
                    className="h-full transition-all duration-1000 bg-amber-500"
                    style={{ width: metricBarWidth(problemSolving) }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Company Knowledge</span>
                  <span className="font-semibold text-sm">{companyKnowledge ?? "-"} / 10</span>
                </div>
                <div className={cn("h-2 rounded-full overflow-hidden", isDark ? "bg-slate-700" : "bg-gray-200")}>
                  <div
                    className="h-full transition-all duration-1000 bg-purple-500"
                    style={{ width: metricBarWidth(companyKnowledge) }}
                  />
                </div>
              </div>
            </div>

            <div className={cn("mt-6 p-4 rounded-lg border-2", overallScore >= 8 ? (isDark ? "border-green-500/30 bg-green-500/10" : "border-green-200 bg-green-50") : overallScore >= 6 ? (isDark ? "border-yellow-500/30 bg-yellow-500/10" : "border-yellow-200 bg-yellow-50") : (isDark ? "border-orange-500/30 bg-orange-500/10" : "border-orange-200 bg-orange-50"))}>
              <p className={cn("text-sm mb-1", overallScore >= 8 ? (isDark ? "text-green-400" : "text-green-700") : overallScore >= 6 ? (isDark ? "text-yellow-400" : "text-yellow-700") : (isDark ? "text-orange-400" : "text-orange-700"))}>Overall Performance</p>
              <p className={cn("text-4xl font-bold", overallScore >= 8 ? (isDark ? "text-green-400" : "text-green-600") : overallScore >= 6 ? (isDark ? "text-yellow-400" : "text-yellow-600") : (isDark ? "text-orange-400" : "text-orange-600"))}>{overallScore ?? "-"}</p>
              <p className={cn("text-xs mt-2", overallScore >= 8 ? (isDark ? "text-green-400" : "text-green-700") : overallScore >= 6 ? (isDark ? "text-yellow-400" : "text-yellow-700") : (isDark ? "text-orange-400" : "text-orange-700"))}>out of 10</p>
            </div>
          </div>
        )}

        {analysis && strengths.length > 0 && (
          <div className={cn("rounded-lg p-4 mb-4 border", isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white")}>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              Key Strengths
            </h2>
            <div className="flex flex-wrap gap-2">
              {strengths.map((strength, idx) => (
                <span key={idx} className={cn("px-3 py-1 rounded-xl text-sm font-medium", isDark ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700")}>
                  ✓ {strength}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysis && recommendation && (
          <div className={cn("rounded-lg p-4 mb-4 border-2", getRecommendationColor(recommendation))}>
            <div className="flex items-start gap-3">
              <Target className="h-6 w-6 mt-1" />
              <div>
                <p className="font-semibold text-base">{getRecommendationLabel(recommendation)}</p>
                <p className={cn("text-sm mt-1", isDark ? "text-slate-300" : "text-slate-700")}>{reasoning}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex mt-4 mb-4 justify-center">
          <button
            onClick={handleBack}
            className={cn("px-4 py-2 rounded-md font-semibold transition", isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-slate-900")}
          >
            Try Another Interview
          </button>
        </div>
      </div>
    </div>
  );
}
