import api from "./api";

const toArray = (value) => (Array.isArray(value) ? value : []);

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const mapAssessmentRecordToUi = (record) => ({
    id: record.id,
    company: record.companyName || "Practice",
    role_name: record.roleName || "SDE",
    difficulty: record.difficulty || "moderate",
    overallScore: toNumber(record.overallScore, 0),
    correctAnswers: toNumber(record.correctAnswers, 0),
    totalQuestions: toNumber(record.totalQuestions, 0),
    metrics: {
        technicalKnowledge: toNumber(record.metricTechnical, 0),
        accuracy: toNumber(record.metricAccuracy, 0),
    },
    topicsCovered: toArray(record.topicsCovered),
    strengths: toArray(record.strengths),
    weaknesses: record.improvements || "",
    feedback: record.feedback || "",
    questionsAnalysis: toArray(record.detailedAnalysis),
    createdAt: record.createdAt,
});

export const createAssessmentRecord = async (payload) => {
    const response = await api.post("/assessments", payload);
    return response.data;
};

export const getAssessmentHistory = async () => {
    const response = await api.get("/assessments");
    return toArray(response.data).map(mapAssessmentRecordToUi);
};
