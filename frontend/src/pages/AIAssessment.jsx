import { useState } from "react";

import { mockAssessmentResponse, mockAnalysisResult } from "@/data/mockAssessment";

import AssessmentSetup from "@/components/assessment/AssessmentSetup";
import AssessmentQuiz from "@/components/assessment/AssessmentQuiz";
import AssessmentResults from "@/components/assessment/AssessmentResults";

const Assessment = () => {
  const [phase, setPhase] = useState("setup");
  const [questions, setQuestions] = useState([]);
  const [totalTime, setTotalTime] = useState(300);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assessmentInput, setAssessmentInput] = useState(null);

  const handleStart = async (input) => {
    setLoading(true);
    setAssessmentInput(input);

    // Simulate loading / Replace with actual API
    await new Promise((r) => setTimeout(r, 1500));

    const data = mockAssessmentResponse;

    setQuestions(data.questions);
    setTotalTime(input.totalTime);
    setLoading(false);
    setPhase("quiz");
  };

  const handleSubmit = async (answers) => {
    setLoading(true);

    // Simulate loading / Replace with actual API
    await new Promise((r) => setTimeout(r, 2000));

    const data = mockAnalysisResult;

    setAnalysis(data);
    setLoading(false);
    setPhase("results");
  };

  const handleRestart = () => {
    setPhase("setup");
    setQuestions([]);
    setAnalysis(null);
    setAssessmentInput(null);
  };

  return (
    <>
      {phase === "setup" && (
        <AssessmentSetup onStart={handleStart} loading={loading} />
      )}

      {phase === "quiz" && (
        <AssessmentQuiz
          questions={questions}
          totalTime={totalTime}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}

      {phase === "results" && analysis && (
        <AssessmentResults result={analysis} onRestart={handleRestart} />
      )}
    </>
  );
};

export default Assessment;