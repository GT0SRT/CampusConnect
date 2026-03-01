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
  const unanswered = questions.length - answered;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft < 60;

  const selectAnswer = (option) => {
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
  };

  const goToQuestion = (index) => {
    setCurrent(index);
  };

  const goPrevious = () => {
    setCurrent((p) => Math.max(0, p - 1));
  };

  const goNext = () => {
    setCurrent((p) => Math.min(questions.length - 1, p + 1));
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Question <span className="text-foreground font-semibold">{current + 1}</span> / {questions.length}
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

      <div className="flex-1 p-4 lg:p-6">
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          <section className="lg:col-span-8 bg-card border border-border rounded-2xl p-4 md:p-6 animate-fade-in-up" key={current}>
            <h2 className={`text-xl font-semibold mb-6 leading-relaxed ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
              {q.question}
            </h2>

            <div className="space-y-3">
              {q.options.map((option, idx) => {
                const selected = answers[q.id] === option;

                return (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(option)}
                    className={`w-full cursor-pointer text-left px-5 py-4 rounded-xl border transition-all duration-200 ${selected
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : "border-border bg-card hover:border-muted-foreground/30 hover:bg-secondary"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${selected ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40" : "bg-secondary text-muted-foreground"
                          }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>

                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-sm leading-relaxed ${selected
                            ? "text-emerald-700 dark:text-emerald-300 font-semibold"
                            : theme === "dark"
                              ? "text-slate-200"
                              : "text-slate-700"
                            }`}
                        >
                          {option}
                        </span>

                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className={`text-xs ${answers[q.id] ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                {answers[q.id] ? "Option selected" : "Select an option"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={goPrevious}
                  disabled={current === 0}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {current < questions.length - 1 ? (
                  <button
                    onClick={goNext}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all text-sm font-medium"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => onSubmit(answers)}
                    disabled={loading || answered < questions.length}
                    className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm ${theme === "dark" ? "text-white" : "text-black"
                      }`}
                    style={{ background: "linear-gradient(90deg, #00eaff, #00c3ff)" }}
                  >
                    {loading ? (
                      <>
                        <span
                          className={`w-4 h-4 border-2 rounded-full animate-spin ${theme === "dark" ? "border-white/40 border-t-white" : "border-black/40 border-t-black"
                            }`}
                        />
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
          </section>

          <aside className="lg:col-span-4 bg-card border border-border rounded-2xl p-4 md:p-5 h-fit lg:sticky lg:top-24">
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Attempted</p>
                <p className="text-lg font-semibold text-success">{answered}</p>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Unattempted</p>
                <p className="text-lg font-semibold">{unanswered}</p>
              </div>
              <div className="rounded-xl bg-secondary p-3 col-span-2">
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="text-sm font-medium">
                  Question {current + 1} of {questions.length}
                </p>
              </div>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Question No.</h3>
              <span className="text-xs text-muted-foreground">Click to jump / return</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((item, index) => {
                const isCurrent = index === current;
                const isMarked = Boolean(answers[item.id]);

                return (
                  <button
                    key={item.id ?? index}
                    onClick={() => goToQuestion(index)}
                    className={`h-9 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center border ${isCurrent
                      ? "bg-primary text-primary-foreground border-primary"
                      : isMarked
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                        : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                      }`}
                  >
                    {isMarked ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : index + 1}
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuiz;