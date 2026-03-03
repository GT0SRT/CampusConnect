import api from "./api";
import { chatWithGemini } from "./geminiService";

export async function getSquadState() {
    const response = await api.get("/squads/state");
    return response.data || { squads: [], chatsByMemberId: {} };
}

export async function saveSquadState(payload) {
    const response = await api.put("/squads/state", payload || { squads: [], chatsByMemberId: {} });
    return response.data || { squads: [], chatsByMemberId: {} };
}

export async function getConnectionRequests() {
    const response = await api.get("/squads/requests");
    return response.data || { received: [], sent: [] };
}

export async function startDirectMessage(targetUserId) {
    const response = await api.post("/squads/dm/start", { targetUserId });
    return response.data || { chatTarget: null };
}

export async function sendDirectMessage(targetUserId, text) {
    const response = await api.post("/squads/messages", { targetUserId, text });
    return response.data;
}

export async function sendConnectionRequest({ targetUserId, text, squadId }) {
    const response = await api.post("/squads/connect-request", { targetUserId, text, squadId });
    return response.data;
}

export async function respondConnectionRequest(requestId, action) {
    const response = await api.post(`/squads/requests/${requestId}/respond`, { action });
    return response.data;
}

export async function generateConnectionMessage({ myName, theirName, context = "" }) {
    try {
        const prompt = [
            "Write a short and friendly CampusConnect connection request message.",
            "Rules: 1) 22 words max 2) natural student tone 3) no emojis 4) one clear collaboration intent.",
            `From: ${myName || "Student"}`,
            `To: ${theirName || "Peer"}`,
            context ? `Context: ${context}` : "",
            "Return only the message text.",
        ]
            .filter(Boolean)
            .join("\n");

        const output = await chatWithGemini(prompt);
        const cleaned = String(output || "").replace(/^"|"$/g, "").trim();
        if (cleaned) {
            return cleaned;
        }
    } catch {
    }

    return `Hey ${theirName || "there"}, your profile stood out. Want to connect and explore a collaboration opportunity together?`;
}
