import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || "";
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
const ELEVENLABS_MODEL_ID = import.meta.env.VITE_ELEVENLABS_MODEL_ID || "eleven_flash_v2_5";
const ENV_TTS_PROVIDER = (import.meta.env.VITE_TTS_PROVIDER || "auto").toLowerCase();
const TTS_PROVIDER_STORAGE_KEY = "campusconnect_tts_provider";

let elevenClient = null;
let currentAudio = null;
let currentObjectUrl = null;

const normalizeProvider = (value) => {
    const normalized = String(value || "").toLowerCase();
    if (["browser", "elevenlabs", "auto"].includes(normalized)) return normalized;
    return "auto";
};

export const setTtsProvider = (provider) => {
    const normalized = normalizeProvider(provider);
    window.localStorage.setItem(TTS_PROVIDER_STORAGE_KEY, normalized);
    return normalized;
};

export const getTtsProvider = () => {
    const override = window.localStorage.getItem(TTS_PROVIDER_STORAGE_KEY);
    return normalizeProvider(override || ENV_TTS_PROVIDER);
};

const getClient = () => {
    if (!ELEVENLABS_API_KEY) return null;
    if (!elevenClient) {
        elevenClient = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });
    }
    return elevenClient;
};

const cleanupAudio = () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = "";
        currentAudio = null;
    }
    if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = null;
    }
};

const toAudioBlob = async (data) => {
    if (data instanceof Blob) return data;
    if (data instanceof ArrayBuffer) return new Blob([data], { type: "audio/mpeg" });
    if (data && typeof data.getReader === "function") {
        return new Response(data).blob();
    }
    return new Blob([data], { type: "audio/mpeg" });
};

const speakWithBrowser = (text, { onStart, onEnd, onError }) => {
    if (!window.speechSynthesis) {
        onError?.(new Error("Browser speech synthesis not supported"));
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 0.95;
    utterance.lang = "en-US";

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = (event) => onError?.(new Error(event.error || "Browser TTS failed"));

    window.speechSynthesis.speak(utterance);
};

export const speakWithElevenLabs = async (
    text,
    {
        voiceId = ELEVENLABS_VOICE_ID,
        modelId = ELEVENLABS_MODEL_ID,
        onStart,
        onEnd,
        onError,
    } = {}
) => {
    const trimmed = (text || "").trim();
    if (!trimmed) return;

    stopSpeech();

    const selectedProvider = getTtsProvider();
    if (selectedProvider === "browser") {
        speakWithBrowser(trimmed, { onStart, onEnd, onError });
        return;
    }

    const client = getClient();
    if (!client || selectedProvider === "auto" && !ELEVENLABS_API_KEY) {
        speakWithBrowser(trimmed, { onStart, onEnd, onError });
        return;
    }

    try {
        onStart?.();

        const { data, rawResponse } = await client.textToSpeech
            .convert(voiceId, {
                text: trimmed,
                modelId,
            })
            .withRawResponse();

        const charCost = rawResponse.headers.get("x-character-count");
        const requestId = rawResponse.headers.get("request-id");
        if (charCost) {
            console.debug(`[ElevenLabs] chars=${charCost} requestId=${requestId || "n/a"}`);
        }

        const blob = await toAudioBlob(data);
        const audioUrl = URL.createObjectURL(blob);
        currentObjectUrl = audioUrl;

        const audio = new Audio(audioUrl);
        currentAudio = audio;

        audio.onended = () => {
            cleanupAudio();
            onEnd?.();
        };

        audio.onerror = () => {
            cleanupAudio();
            const error = new Error("Audio playback failed");
            onError?.(error);
        };

        await audio.play();
    } catch (error) {
        cleanupAudio();
        console.warn("[ElevenLabs] SDK TTS failed, falling back to browser voice", error);
        speakWithBrowser(trimmed, { onStart, onEnd, onError });
    }
};

export const stopSpeech = () => {
    window.speechSynthesis?.cancel();
    cleanupAudio();
};

export const initializeElevenLabs = () => {
    const provider = getTtsProvider();
    console.info(`[TTS] provider=${provider} (env=${normalizeProvider(ENV_TTS_PROVIDER)})`);

    if (ELEVENLABS_API_KEY) {
        const keyPreview = `${ELEVENLABS_API_KEY.slice(0, 6)}...`;
        console.info(`[ElevenLabs] enabled (${keyPreview}) model=${ELEVENLABS_MODEL_ID}`);
    } else {
        console.info("[ElevenLabs] API key not set. Using browser voice fallback.");
    }

    window.__tts = {
        setProvider: setTtsProvider,
        getProvider: getTtsProvider,
    };
};

export const isElevenLabsEnabled = () => Boolean(ELEVENLABS_API_KEY);
