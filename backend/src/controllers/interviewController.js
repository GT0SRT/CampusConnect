const prisma = require("../lib/prisma");

exports.addInterviewRecord = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            overall_score,
            metrics,
            topics_covered,
            overall_assessment,
            key_strengths,
            areas_for_improvement,
            recommendation,
            reasoning,
            companyName,
            jobRole,
            difficulty,
            interview_duration_sec,
            transcript,
            metadata,
        } = req.body;

        if (!metrics || typeof metrics !== "object") {
            return res.status(400).json({ error: "metrics is required" });
        }

        const rawRecommendation = String(recommendation || "MAYBE").trim().toUpperCase().replace(/-/g, "_");
        const allowedRecommendations = ["STRONG_YES", "YES", "MAYBE", "NO"];
        const formattedRecommendation = allowedRecommendations.includes(rawRecommendation)
            ? rawRecommendation
            : "MAYBE";

        const interview = await prisma.interview.create({
            data: {
                userId,
                companyName: companyName || "Practice",
                jobRole: jobRole || "SDE",
                difficulty: difficulty || "moderate",
                interviewDurationSec: Number(interview_duration_sec) || 0,
                transcript: Array.isArray(transcript) ? transcript : [],
                metadata: metadata && typeof metadata === "object" ? metadata : {},
                overallScore: Number(overall_score) || 0,
                metricTechnical: Number(metrics.technical) || 0,
                metricBehavioral: Number(metrics.behavioral) || 0,
                metricCommunication: Number(metrics.communication) || 0,
                metricProblemSolving: Number(metrics.problem_solving) || 0,
                metricCompanyKnowledge: Number(metrics.company_knowledge) || 0,
                topicsCovered: Array.isArray(topics_covered) ? topics_covered : [],
                overallAssessment: String(overall_assessment || "").trim(),
                keyStrengths: Array.isArray(key_strengths) ? key_strengths : [],
                areasForImprovement: Array.isArray(areas_for_improvement) ? areas_for_improvement : [],
                recommendation: formattedRecommendation,
                reasoning: String(reasoning || "").trim(),
            },
        });

        res.status(201).json(interview);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyInterviewRecords = async (req, res) => {
    try {
        const interviews = await prisma.interview.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
        });

        res.json(interviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};