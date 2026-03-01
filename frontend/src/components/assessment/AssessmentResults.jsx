import { CheckCircle2, XCircle, Trophy, Target, BookOpen, Star, ArrowLeft, TrendingUp, Lightbulb, MinusCircle } from "lucide-react";
import { createElement } from "react";
import { useUserStore } from "../../store/useUserStore";

const ScoreRing = ({ score }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} stroke="hsl(var(--secondary))" strokeWidth="8" fill="none" />
        <circle
          cx="60" cy="60"
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ animation: "progress-fill 1.5s ease-out forwards" }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--success))" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold gradient-text">{score}</span>
        <span className="text-xs text-muted-foreground">out of 100</span>
      </div>
    </div>
  );
};

const MetricBar = ({ label, value, icon }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        {createElement(icon, { className: "w-4 h-4 text-primary" })} {label}
      </span>
      <span className="font-semibold">{value}%</span>
    </div>

    <div className="h-2 rounded-full bg-secondary overflow-hidden">
      <div
        className="h-full rounded-full animate-progress"
        style={{ width: `${value}%`, background: "var(--gradient-primary)" }}
      />
    </div>
  </div>
);

const AssessmentResults = ({ result, onRestart, loading = false }) => {
  const theme = useUserStore((state) => state.theme);
  const isDark = theme === "dark";
  const cardClass = isDark ? "rounded-lg p-4 border border-slate-700 bg-slate-800" : "rounded-lg p-4 border border-gray-200 bg-white";

  if (loading || !result) {
    return (
      <div className={`min-h-screen p-4 pb-20 flex items-center justify-center ${isDark ? "text-slate-100" : "text-slate-900"}`}>
        <div className="w-full max-w-xl mx-auto text-center">
          <div className={isDark ? "rounded-lg p-8 md:p-10 border border-slate-700 bg-slate-800" : "rounded-lg p-8 md:p-10 border border-gray-200 bg-white"}>
            <div className={`mx-auto mb-5 w-10 h-10 border-4 rounded-full animate-spin ${isDark ? "border-slate-600 border-t-cyan-400" : "border-gray-200 border-t-cyan-600"}`} />
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              Analyzing Your Answers...
            </h2>
            <p className="text-sm text-muted-foreground">
              Preparing your detailed report, strengths, and question-wise feedback.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 pb-20 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
      <div className="w-full max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center animate-fade-in-up pt-8">
          <div className="mx-auto w-fit mb-2 p-2 rounded-full bg-secondary">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <h1 className={`text-3xl font-bold mb-1 ${isDark ? "text-slate-100" : "text-slate-900"}`}>Assessment Summary</h1>
          <p className="text-muted-foreground text-sm">
            {result.role_name} • {result.company} • {result.difficulty}
          </p>
        </div>

        <div className={cardClass}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm mb-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>Company</p>
              <p className="text-lg font-semibold">{result.company || "N/A"}</p>
            </div>
            <div>
              <p className={`text-sm mb-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>Role</p>
              <p className="text-lg font-semibold">{result.role_name || "N/A"}</p>
            </div>
            <div>
              <p className={`text-sm mb-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>Difficulty</p>
              <p className="text-lg capitalize">{result.difficulty || "N/A"}</p>
            </div>
            <div>
              <p className={`text-sm mb-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>Overall Score</p>
              <p className="text-lg font-semibold">{result.overallScore}/100</p>
            </div>
          </div>
        </div>

        {/* Score + Metrics */}
        <div className={`${cardClass} animate-fade-in-up`} style={{ animationDelay: "0.1s" }}>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="">
              <ScoreRing score={result.overallScore} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-secondary">
                <span className="text-muted-foreground">Correct Answers</span>
                <span className="font-bold text-foreground">
                  {result.correctAnswers} / {result.totalQuestions}
                </span>
              </div>

              <MetricBar
                label="Technical Knowledge"
                value={result.metrics.technicalKnowledge}
                icon={Target}
              />
              <MetricBar label="Accuracy" value={result.metrics.accuracy} icon={TrendingUp} />
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className={`${cardClass} animate-fade-in-up`} style={{ animationDelay: "0.2s" }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Topics Covered
          </h3>

          <div className="flex flex-wrap gap-2">
            {result.topicsCovered.map((topic, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className={`${cardClass} animate-fade-in-up`} style={{ animationDelay: "0.3s" }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" /> Strengths
          </h3>

          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-secondary-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>

          {result.weaknesses && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">{result.weaknesses}</p>
            </div>
          )}
        </div>

        {/* Feedback */}
        <div className={`${cardClass} animate-fade-in-up`} style={{ animationDelay: "0.35s" }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" /> AI Feedback
          </h3>

          <p className="text-sm text-secondary-foreground leading-relaxed">
            {result.feedback}
          </p>
        </div>

        {/* Question Analysis */}
        <div className={`${cardClass} animate-fade-in-up`} style={{ animationDelay: "0.4s" }}>
          <h3 className="text-sm font-semibold mb-4">Detailed Question Analysis</h3>

          <div className="space-y-3">
            {(Array.isArray(result.questionsAnalysis) ? result.questionsAnalysis : []).length === 0 ? (
              <div className="border border-border rounded-xl p-4 bg-secondary/20 text-sm text-muted-foreground">
                Detailed per-question analysis is not available for this attempt.
              </div>
            ) : null}

            {(Array.isArray(result.questionsAnalysis) ? result.questionsAnalysis : []).map((qa, i) => {
              const isUnattempted = !String(qa?.candidateAnswer || "").trim();
              const status = isUnattempted ? "unattempted" : (qa?.isCorrect ? "correct" : "incorrect");
              const statusLabel = status === "correct" ? "Correct" : status === "incorrect" ? "Incorrect" : "Not Attempted";

              const statusClasses = status === "correct"
                ? "bg-green-500/15 text-green-600 dark:text-green-400"
                : status === "incorrect"
                  ? "bg-red-500/15 text-red-600 dark:text-red-400"
                  : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";

              const icon = status === "correct"
                ? <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                : status === "incorrect"
                  ? <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  : <MinusCircle className="w-5 h-5 text-yellow-700 dark:text-yellow-400 shrink-0" />;

              const answerColor = status === "correct"
                ? "text-green-600 dark:text-green-400"
                : status === "incorrect"
                  ? "text-red-600 dark:text-red-400"
                  : "text-yellow-700 dark:text-yellow-400";

              return (
                <details key={i} className="border border-border rounded-xl overflow-hidden group">
                  <summary className="list-none cursor-pointer w-full text-left px-4 py-3 flex flex-col items-start gap-2 md:flex-row md:items-start md:justify-between hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {icon}

                      <span className={`text-sm font-medium leading-relaxed wrap-break-word whitespace-normal ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                        Q{i + 1}. {qa.question}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 md:ml-2">
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded ${statusClasses}`}>
                        {statusLabel}
                      </span>
                      <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-secondary">
                        {qa.topic}
                      </span>
                    </div>
                  </summary>

                  <div className="px-4 pb-4 pt-1 space-y-3 text-sm border-t border-border bg-secondary/30">
                    <div>
                      <span className="text-xs text-muted-foreground">Your Answer</span>
                      <p className={`mt-1 ${answerColor}`}>{qa.candidateAnswer || "Not attempted"}</p>
                    </div>

                    {status !== "correct" && (
                      <div>
                        <span className="text-xs text-muted-foreground">Correct Answer</span>
                        <p className="mt-1 text-green-600 dark:text-green-400">{qa.correctAnswer || "-"}</p>
                      </div>
                    )}

                    <div>
                      <span className="text-xs text-muted-foreground">Explanation</span>
                      <p className="mt-1 text-secondary-foreground">{qa.solution || "No explanation available."}</p>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>

        {/* Restart */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Start New Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;