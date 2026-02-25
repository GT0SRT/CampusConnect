const API_BASE_URL = (import.meta.env.VITE_AI_ENGINE_BASE_URL || import.meta.env.VITE_API_BASE_URL)?.replace(/\/$/, "");

export async function generateInterviewPrompt({ company = "Tech Company", roleName = "Software Engineer", topics = "General", resumeSummary = "No resume provided", difficulty = "moderate" }) {
    if (!API_BASE_URL) {
        throw new Error("VITE_AI_ENGINE_BASE_URL (or VITE_API_BASE_URL) is not configured");
    }

    const topicsText = Array.isArray(topics) ? topics.join(", ") : (topics || "General");

    const response = await fetch(`${API_BASE_URL}/generateIP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            company,
            role_name: roleName,
            topics: topicsText,
            resume_summary: resumeSummary,
            difficulty,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || "Failed to generate interview prompt");
    }

    const data = await response.json();
    return data?.interview_prompt || "";
}

export async function getInterviewerReply({ message, history = [], company = "Tech Company", roleName = "Software Engineer", topics = "General", resumeSummary = "No resume provided", interviewDurationSec = 0, difficulty = "moderate", endCallPromptCount = 0, interviewPrompt = "" }) {
    if (!API_BASE_URL) {
        throw new Error("VITE_AI_ENGINE_BASE_URL (or VITE_API_BASE_URL) is not configured");
    }

    const topicsText = Array.isArray(topics) ? topics.join(", ") : (topics || "General");

    // Transform history from {speaker, text, id} to {role, content}
    const formattedHistory = history.map(caption => ({
        role: caption.speaker === "AI" ? "assistant" : "user",
        content: caption.text || ""
    }));

    const response = await fetch(`${API_BASE_URL}/interviewer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message,
            history: formattedHistory,
            company,
            role_name: roleName,
            topics: topicsText,
            resume_summary: resumeSummary,
            interview_duration_sec: interviewDurationSec,
            difficulty,
            end_call_prompt_count: endCallPromptCount,
            interview_prompt: interviewPrompt,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || "Failed to get interviewer response");
    }

    const data = await response.json();
    return {
        reply: data?.reply || "",
        allottedTimeSec: Number(data?.allotted_time_sec) || 45,
        assessment: data?.assessment || {
            strengths: [],
            improvements: [],
            confidence: "medium",
        },
        interview_ended: data?.interview_ended || false,
        end_call_prompted: data?.end_call_prompted || false,
        endCallPromptCount: Number(data?.endCallPromptCount) || 0,
    };
}