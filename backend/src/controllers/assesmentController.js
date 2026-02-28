const prisma = require("../lib/prisma");

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toStringArray = (value) => (Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : []);

const toObject = (value, fallback = {}) => (value && typeof value === "object" ? value : fallback);

exports.addAssessmentRecord = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            companyName,
            roleName,
            jobRole,
            difficulty,
            overallScore,
            overall_score,
            correctAnswers,
            correct_answers,
            totalQuestions,
            total_questions,
            metrics,
            metricTechnical,
            metricAccuracy,
            topicsCovered,
            topics_covered,
            strengths,
            improvements,
            weaknesses,
            feedback,
            detailedAnalysis,
            questionsAnalysis,
        } = req.body;

        const metricsObject = toObject(metrics, {});
        const resolvedDetailedAnalysis = Array.isArray(detailedAnalysis)
            ? detailedAnalysis
            : (Array.isArray(questionsAnalysis) ? questionsAnalysis : []);

        const assessment = await prisma.assessment.create({
            data: {
                userId,
                companyName: String(companyName || "Practice").trim(),
                roleName: String(roleName || jobRole || "SDE").trim(),
                difficulty: String(difficulty || "moderate").trim(),
                overallScore: toNumber(overallScore ?? overall_score, 0),
                correctAnswers: Math.max(0, Math.floor(toNumber(correctAnswers ?? correct_answers, 0))),
                totalQuestions: Math.max(0, Math.floor(toNumber(totalQuestions ?? total_questions, 0))),
                metricTechnical: toNumber(metricTechnical ?? metricsObject.technicalKnowledge ?? metricsObject.technical_knowledge, 0),
                metricAccuracy: toNumber(metricAccuracy ?? metricsObject.accuracy, 0),
                topicsCovered: toStringArray(topicsCovered ?? topics_covered),
                strengths: toStringArray(strengths),
                improvements: String(improvements || weaknesses || "").trim(),
                feedback: String(feedback || "").trim(),
                detailedAnalysis: resolvedDetailedAnalysis,
            }
        });

        res.status(201).json(assessment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAssessments = async (req, res) => {
    try {
        const userId = req.user.id;
        const assessments = await prisma.assessment.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        res.json(assessments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};