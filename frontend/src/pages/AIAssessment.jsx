import { useEffect, useState } from "react";

import AssessmentSetup from "@/components/assessment/AssessmentSetup";
import AssessmentQuiz from "@/components/assessment/AssessmentQuiz";
import AssessmentResults from "@/components/assessment/AssessmentResults";
import { createAssessmentRecord, getAssessmentHistory } from "@/services/assessmentService";

export default function AIAssessment() {
  const [phase, setPhase] = useState("setup");
  const AI_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [totalTime, setTotalTime] = useState(300);
  const [analysis, setAnalysis] = useState(null);
  const [assessmentInput, setAssessmentInput] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("assessment-phase-change", {
        detail: { phase },
      })
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("assessment-phase-change", {
          detail: { phase: "setup" },
        })
      );
    };
  }, [phase]);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const history = await getAssessmentHistory();
        if (!cancelled) {
          setAssessmentHistory(history);
        }
      } catch (err) {
        console.error("Failed to fetch assessment history:", err);
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizeQuestions = (items = []) =>
    items.map((item, index) => ({
      id: item.id ?? index + 1,
      question: item.question || "",
      options: Array.isArray(item.options) ? item.options : [],
      topic: item.topic || "General",
      difficulty: item.difficulty || "moderate",
    }));

  const normalizeAnalysis = (result, fallback) => {
    const detailed = result?.detailed_analysis || result?.questionsAnalysis || [];
    const improvements = result?.improvements || [];

    return {
      company: result?.company || fallback?.company || "Tech Company",
      role_name: result?.role_name || fallback?.role_name || "Software Engineer",
      difficulty: result?.difficulty || fallback?.difficulty || "moderate",
      overallScore: result?.overall_score ?? result?.overallScore ?? 0,
      correctAnswers: result?.correct_answers ?? result?.correctAnswers ?? 0,
      totalQuestions: result?.total_questions ?? result?.totalQuestions ?? detailed.length,
      metrics: {
        technicalKnowledge:
          result?.metrics?.technical_knowledge ?? result?.metrics?.technicalKnowledge ?? 0,
        accuracy: result?.metrics?.accuracy ?? 0,
      },
      topicsCovered: result?.topics_covered || result?.topicsCovered || [],
      strengths: result?.strengths || [],
      weaknesses: Array.isArray(improvements)
        ? improvements.join(" ")
        : (result?.weaknesses || ""),
      feedback: result?.feedback || "",
      questionsAnalysis: detailed.map((item) => {
        const candidateAnswer = item.candidate_answer ?? item.candidateAnswer ?? "";
        const correctAnswer = item.correct_answer ?? item.correctAnswer ?? "";
        const explicitIsCorrect = item.is_correct ?? item.isCorrect;
        const inferredIsCorrect =
          String(candidateAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();

        return {
          question: item.question,
          candidateAnswer,
          correctAnswer,
          isCorrect: typeof explicitIsCorrect === "boolean" ? explicitIsCorrect : inferredIsCorrect,
          solution: item.solution,
          topic: item.topic || "General",
        };
      }),
    };
  };

  const handleStart = async (input) => {
    setLoading(true);
    try {
      if (!AI_API_BASE_URL) {
        throw new Error("VITE_API_BASE_URL is not configured");
      }

      const response = await fetch(`${AI_API_BASE_URL}/generate_assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Generate assessment failed: ${response.status}`);
      }

      const data = await response.json();
      const normalizedQuestions = normalizeQuestions(data.questions || []);

      if (!normalizedQuestions.length) {
        throw new Error("No questions returned from ai-engine");
      }

      setQuestions(normalizedQuestions);
      setTotalTime(data.total_time_sec || input.totalTime || 300);
      setAssessmentInput(input);
      setPhase("quiz");
    } catch (err) {
      console.error("Failed to generate assessment from ai-engine:", err);
      alert("Unable to generate questions from ai-engine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (answers) => {
    setLoading(true);
    try {
      if (!AI_API_BASE_URL) {
        throw new Error("VITE_API_BASE_URL is not configured");
      }

      const userResponses = questions.map((q) => answers[q.id] || "");

      const response = await fetch(`${AI_API_BASE_URL}/assess_response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(assessmentInput || {}),
          user_responses: userResponses,
          questions_asked: questions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Assess response failed: ${response.status}`);
      }

      const result = await response.json();
      const normalizedResult = normalizeAnalysis(result, assessmentInput);
      setAnalysis(normalizedResult);

      try {
        await createAssessmentRecord({
          companyName: normalizedResult.company,
          roleName: normalizedResult.role_name,
          difficulty: normalizedResult.difficulty,
          overallScore: normalizedResult.overallScore,
          correctAnswers: normalizedResult.correctAnswers,
          totalQuestions: normalizedResult.totalQuestions,
          metrics: normalizedResult.metrics,
          topicsCovered: normalizedResult.topicsCovered,
          strengths: normalizedResult.strengths,
          improvements: normalizedResult.weaknesses,
          feedback: normalizedResult.feedback,
          detailedAnalysis: normalizedResult.questionsAnalysis,
        });

        const history = await getAssessmentHistory();
        setAssessmentHistory(history);
      } catch (persistErr) {
        console.error("Failed to persist assessment result:", persistErr);
      }

      setPhase("results");
    } catch (err) {
      console.error("Failed to analyze assessment from ai-engine:", err);
      alert("Unable to analyze answers from ai-engine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setPhase("setup");
    setQuestions([]);
    setTotalTime(300);
    setAnalysis(null);
    setAssessmentInput(null);
  };

  if (phase === "setup") {
    return (
      <AssessmentSetup
        onStart={handleStart}
        loading={loading}
        historyLoading={historyLoading}
        latestAssessment={assessmentHistory[0] || null}
      />
    );
  }

  if (phase === "quiz") {
    return (
      <AssessmentQuiz
        questions={questions}
        totalTime={totalTime}
        onSubmit={handleSubmit}
        loading={loading}
      />
    );
  }

  return <AssessmentResults result={analysis} onRestart={handleRestart} />;
}
