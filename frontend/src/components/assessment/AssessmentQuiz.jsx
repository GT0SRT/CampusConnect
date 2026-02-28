import { useState, useEffect } from "react";
import { Clock, ChevronLeft, ChevronRight, Send, CheckCircle2 } from "lucide-react";
import { useUserStore } from "../../store/useUserStore";

const AssessmentQuiz = ({ questions, totalTime, onSubmit, loading }) => {
  const theme = useUserStore((state) => state.theme);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(totalTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onSubmit(answers);
    }
  }, [timeLeft, answers, onSubmit]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const q = questions[current];
  const answered = Object.keys(answers).length;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft < 60;

  const selectAnswer = (option) => {
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>

      {/* Top bar */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-3 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Question{" "}
              <span className="text-foreground font-semibold">{current + 1}</span> / {questions.length}
            </span>

            <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary capitalize">
              {q.topic}
            </span>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold ${isUrgent ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground"
              }`}
          >
            <Clock className="w-4 h-4" />
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-secondary">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((current + 1) / questions.length) * 100}%`,
              background: "linear-gradient(90deg, #00eaff, #00c3ff)",
            }}
          />
        </div>
      </div>

      {/* Question Body */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full animate-fade-in-up" key={current}>
          <h2 className={`text-xl font-semibold mb-6 leading-relaxed ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((option, idx) => {
              const selected = answers[q.id] === option;

              return (
                <button
                  key={idx}
                  onClick={() => selectAnswer(option)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${selected
                    ? "border-success/60 bg-success/15 glow-border"
                    : "border-border bg-card hover:border-muted-foreground/30 hover:bg-secondary"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${selected ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"
                        }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>

                    <span
                      className={`text-sm leading-relaxed ${selected
                        ? (theme === "dark" ? "text-white" : "text-slate-900")
                        : (theme === "dark" ? "text-slate-200" : "text-slate-700")
                        }`}
                    >
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm sticky bottom-0">
        <div className="w-full px-4 py-4 flex items-center justify-between">

          {/* Previous */}
          <button
            onClick={() => setCurrent((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-30 transition-all text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Navigation Dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center ${i === current
                  ? "bg-primary text-primary-foreground"
                  : answers[questions[i].id]
                    ? "bg-success/20 text-success"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
              >
                {answers[questions[i].id] ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </button>
            ))}
          </div>

          {/* Next or Submit */}
          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent((p) => Math.min(questions.length - 1, p + 1))}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all text-sm font-medium"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onSubmit(answers)}
              disabled={loading || answered < questions.length}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold disabled:opacity-40 transition-all text-sm ${theme === "dark" ? "text-white" : "text-black"}`}
              style={{ background: "linear-gradient(90deg, #00eaff, #00c3ff)" }}
            >
              {loading ? (
                <>
                  <span className={`w-4 h-4 border-2 rounded-full animate-spin ${theme === "dark" ? "border-white/40 border-t-white" : "border-black/40 border-t-black"}`} />
                  Analyzing...
                </>
              ) : (
                <>
                  Submit <Send className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuiz;