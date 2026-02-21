import { fileToBase64 } from "./cloudinaryService";

export async function generateCaptionFromImageFile(file, instruction = "") {
    const apiUrl = import.meta.env.VITE_CAPTION_API_URL;

    if (!apiUrl) {
        throw new Error("Caption API URL not configured");
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
    await new Promise((resolve) => setTimeout(resolve, 400));
    return `UI-only assistant response: ${message}`;
}
