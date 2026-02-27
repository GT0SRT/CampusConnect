import { useState } from "react";
import { CheckCircle2, XCircle, ArrowLeft, Brain } from "lucide-react";
import AssessmentSetup from "@/components/assessment/AssessmentSetup";

const AIAssessment = () => {
  const [phase, setPhase] = useState("setup");
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";

const AI_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export default function AIAssessment() {
  const [_file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);

  const handleGenerate = async (text, count) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/assessment/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, count, type: "MCQ" }),
      });

      const data = await response.json();
      setQuestions(data.questions);
      setSelectedAnswers({});
      setShowAnswers(false);
      setPhase("quiz");
    } catch (err) {
      console.error("Failed to generate:", err);
      alert("Failed to connect to backend. Make sure your server is running on localhost:5000");
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (qIdx, option) => {
    if (showAnswers) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmit = () => {
    setShowAnswers(true);
  };

  const handleRestart = () => {
    setPhase("setup");
    setQuestions([]);
    setSelectedAnswers({});
    setShowAnswers(false);
  };

  const correctCount = questions.filter((q, i) => selectedAnswers[i] === q.answer).length;
  const allAnswered = Object.keys(selectedAnswers).length === questions.length;

  if (phase === "setup") {
    return <AssessmentSetup onGenerate={handleGenerate} loading={loading} />;
  }
  // Generate MCQs using backend
  const generateQuestions = async () => {
    if (!extractedText) return;

    if (!AI_API_BASE_URL) {
      alert("VITE_API_BASE_URL is not configured.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${AI_API_BASE_URL}/generate_assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: "Tech Company",
          role_name: "Software Engineer",
          topics: extractedText.slice(0, 500),
          difficulty: "moderate",
          noOfQuestions: Number(questionCount),
          totalTime: Number(questionCount) * 60,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.detail || "Failed to generate assessment questions.");
      }

      const data = await response.json();

      setQuestions(Array.isArray(data?.questions) ? data.questions : []);
    } catch (error) {
      alert(error?.message || "Failed to generate assessment questions.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center pt-8 mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {showAnswers ? "Results" : "Assessment"}
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-1">
            <span className="gradient-text">
              {showAnswers ? `Score: ${correctCount} / ${questions.length}` : "Answer the Questions"}
            </span>
          </h1>

          {showAnswers && (
            <p className="text-muted-foreground text-sm mt-1">
              {Math.round((correctCount / questions.length) * 100)}% accuracy
            </p>
          )}
        </div>

        {/* Score bar */}
        {showAnswers && (
          <div className="glass-card p-5 mb-6 animate-fade-in-up">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Score</span>
              <span className="font-bold text-primary">
                {Math.round((correctCount / questions.length) * 100)}%
              </span>
            </div>

            <div className="h-3 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full animate-progress"
                style={{
                  width: `${(correctCount / questions.length) * 100}%`,
                  background: "var(--gradient-primary)",
                }}
              />
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-5">
          {questions.map((q, idx) => {
            const selected = selectedAnswers[idx];
            const isCorrect = selected === q.answer;

            return (
              <div
                key={idx}
                className="glass-card p-5 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <p className="font-semibold text-sm mb-4">
                  <span className="text-primary mr-2">Q{idx + 1}.</span>
                  {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    const isSelected = selected === opt;
                    const isAnswer = q.answer === opt;

                    let borderClass =
                      "border-border bg-card hover:border-muted-foreground/30 hover:bg-secondary";

                    if (showAnswers && isAnswer) {
                      borderClass = "border-success/50 bg-success/10";
                    } else if (showAnswers && isSelected && !isCorrect) {
                      borderClass = "border-destructive/50 bg-destructive/10";
                    } else if (!showAnswers && isSelected) {
                      borderClass = "border-primary bg-primary/10 glow-border";
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => selectAnswer(idx, opt)}
                        disabled={showAnswers}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 disabled:cursor-default ${borderClass}`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              showAnswers && isAnswer
                                ? "bg-success text-success-foreground"
                                : showAnswers && isSelected && !isCorrect
                                ? "bg-destructive text-destructive-foreground"
                                : !showAnswers && isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {showAnswers && isAnswer ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : showAnswers && isSelected && !isCorrect ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              String.fromCharCode(65 + i)
                            )}
                          </span>

                          <span className="text-sm leading-relaxed">{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showAnswers && (
                  <p className="mt-3 text-xs text-success flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Answer: {q.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-8 flex items-center justify-center gap-4 animate-fade-in-up">
          {!showAnswers ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="px-8 py-3 rounded-lg font-semibold text-primary-foreground disabled:opacity-40 transition-all"
              style={{ background: "var(--gradient-primary)" }}
            >
              Submit Assessment
            </button>
          ) : (
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> New Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssessment;