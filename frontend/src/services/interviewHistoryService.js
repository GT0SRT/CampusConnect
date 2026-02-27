import api from "./api";

const toRecommendationForApi = (value) => String(value || "MAYBE").trim().toUpperCase().replace(/\s+/g, "_");

const normalizeRecommendation = (value) => String(value || "").trim().toLowerCase();

const toArray = (value) => (Array.isArray(value) ? value : []);

const toObject = (value, fallback = {}) => (value && typeof value === "object" ? value : fallback);

export const saveInterviewSummary = async ({ interview, analysis }) => {
    if (!interview?.id || !analysis) {
        throw new Error("Interview and analysis are required to save summary");
    }

    const metrics = toObject(analysis.metrics, {});

    const payload = {
        overall_score: Number(analysis.overall_score) || 0,
        metrics: {
            technical: Number(metrics.technical) || 0,
            behavioral: Number(metrics.behavioral) || 0,
            communication: Number(metrics.communication) || 0,
            problem_solving: Number(metrics.problem_solving) || 0,
            company_knowledge: Number(metrics.company_knowledge) || 0,
        },
        topics_covered: toArray(analysis.topics_covered),
        overall_assessment: analysis.overall_assessment || "",
        key_strengths: toArray(analysis.key_strengths),
        areas_for_improvement: toArray(analysis.areas_for_improvement || analysis.improvements),
        recommendation: toRecommendationForApi(analysis.recommendation),
        reasoning: analysis.reasoning || "",
        companyName: interview.company || "Practice",
        jobRole: interview.role || "SDE",
        difficulty: interview.difficulty || "moderate",
        interview_duration_sec: Number(interview.duration) || 0,
        transcript: toArray(interview.transcript),
        metadata: {
            ...toObject(interview.metadata, {}),
            localInterviewId: interview.id,
        },
    };

    const response = await api.post("/interviews", payload);
    return response.data;
};

export const mapInterviewRecordToUi = (record) => ({
    id: record.id,
    persistedRecordId: record.id,
    company: record.companyName || "Practice",
    role: record.jobRole || "SDE",
    topics: toArray(record.topicsCovered),
    difficulty: record.difficulty || "moderate",
    timestamp: record.createdAt,
    duration: Number(record.interviewDurationSec) || 0,
    transcript: toArray(record.transcript),
    metadata: toObject(record.metadata, {}),
    status: "completed",
    analysis: {
        overall_score: Number(record.overallScore) || 0,
        metrics: {
            technical: Number(record.metricTechnical) || 0,
            behavioral: Number(record.metricBehavioral) || 0,
            communication: Number(record.metricCommunication) || 0,
            problem_solving: Number(record.metricProblemSolving) || 0,
            company_knowledge: Number(record.metricCompanyKnowledge) || 0,
        },
        topics_covered: toArray(record.topicsCovered),
        overall_assessment: record.overallAssessment || "",
        key_strengths: toArray(record.keyStrengths),
        areas_for_improvement: toArray(record.areasForImprovement),
        recommendation: normalizeRecommendation(record.recommendation),
        reasoning: record.reasoning || "",
    },
});

export const getInterviewHistory = async () => {
    const response = await api.get("/interviews");
    const records = toArray(response.data);
    return records.map(mapInterviewRecordToUi);
};
