import { CheckCircle2, XCircle, Trophy, Target, BookOpen, Star, ArrowLeft, TrendingUp, Lightbulb } from "lucide-react";
import { useState } from "react";

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
            <stop offset="0%" stopColor="hsl(175, 80%, 50%)" />
            <stop offset="100%" stopColor="hsl(145, 65%, 45%)" />
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

const MetricBar = ({ label, value, icon: Icon }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4 text-primary" /> {label}
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

const AssessmentResults = ({ result, onRestart }) => {
  const [expandedQ, setExpandedQ] = useState(null);

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center animate-fade-in-up pt-8">
          <div
            style={{ background: "linear-gradient(90deg, #00eaff, #00c3ff)" }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-black"
          >
            <Trophy className="w-4 h-4" style={{ color: "#00eaff" }} />
            <span className="text-sm font-medium text-success">Assessment Complete</span>
          </div>

          <h1 className="text-3xl font-bold mb-1">Your Results</h1>
          <p className="text-muted-foreground text-sm">
            {result.role_name} • {result.company} • {result.difficulty}
          </p>
        </div>

        {/* Score + Metrics */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <ScoreRing score={result.overallScore} />

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-secondary">
                <span className="text-muted-foreground">Correct Answers</span>
                <span className="font-bold text-success">
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
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: "#00eaff" }} /> Topics Covered
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
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-warning" style={{ color: "#00eaff" }} /> Strengths
          </h3>

          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-secondary-foreground">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" style={{ color: "#00eaff" }} />
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
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" style={{ color: "#00eaff" }} /> AI Feedback
          </h3>

          <p className="text-sm text-secondary-foreground leading-relaxed">
            {result.feedback}
          </p>
        </div>

        {/* Question Analysis */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <h3 className="text-sm font-semibold mb-4">Detailed Question Analysis</h3>

          <div className="space-y-3">
            {result.questionsAnalysis.map((qa, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {qa.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" style={{ color: "#00eaff" }} />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0" style={{ color: "#00eaff" }} />
                    )}

                    <span className="text-sm font-medium line-clamp-1">
                      Q{i + 1}. {qa.question}
                    </span>
                  </div>

                  <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-secondary flex-shrink-0 ml-2">
                    {qa.topic}
                  </span>
                </button>

                {expandedQ === i && (
                  <div className="px-4 pb-4 pt-1 space-y-3 text-sm border-t border-border bg-secondary/30">
                    <div>
                      <span className="text-xs text-muted-foreground">Your Answer</span>
                      <p className={`mt-1 ${qa.isCorrect ? "text-success" : "text-destructive"}`}>
                        {qa.candidateAnswer}
                      </p>
                    </div>

                    {!qa.isCorrect && (
                      <div>
                        <span className="text-xs text-muted-foreground">Correct Answer</span>
                        <p className="mt-1 text-success">{qa.correctAnswer}</p>
                      </div>
                    )}

                    <div>
                      <span className="text-xs text-muted-foreground">Explanation</span>
                      <p className="mt-1 text-secondary-foreground">{qa.solution}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Restart */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" style={{ color: "#00eaff" }} /> Start New Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;