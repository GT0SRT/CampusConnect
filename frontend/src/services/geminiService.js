import { fileToBase64 } from "./cloudinaryService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
const CAPTION_API_URL = (
    import.meta.env.VITE_CAPTION_API_URL ||
    (API_BASE_URL ? `${API_BASE_URL}/generate` : "")
)?.replace(/\/$/, "");

export async function generateCaptionFromImageFile(file, instruction = "") {
    const apiUrl = CAPTION_API_URL;

    if (!apiUrl) {
        throw new Error("Caption API URL not configured. Set VITE_CAPTION_API_URL or VITE_API_BASE_URL.");
    }

    const base64 = await fileToBase64(file);
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, instruction }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || "Failed to generate caption");
    }

    const data = await response.json();
    return data.caption || "";
}

export async function chatWithGemini(message) {
    if (!API_BASE_URL) {
        throw new Error("VITE_API_BASE_URL is not configured");
    }

    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || "Failed to get chat response");
    }

    const data = await response.json();
    return data?.reply || "";
}
