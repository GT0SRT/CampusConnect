import { useState, useEffect, useRef, useCallback } from "react";
import { initializeElevenLabs, speakWithElevenLabs, stopSpeech } from "../utils/ttsService";

export function useVoiceInterviewer({ isMicOn, onUserSilence, silenceMs = 3000, maxUserResponseSec = 120, initialCaptions = [] }) {
    const [captions, setCaptions] = useState(() => (Array.isArray(initialCaptions) ? initialCaptions : []));
    const [liveCaption, setLiveCaption] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);

    const recognitionRef = useRef(null);
    const isMicOnRef = useRef(isMicOn);
    const isRecognizingRef = useRef(false);
    const restartTimeoutRef = useRef(null);
    const suppressRestartRef = useRef(false);
    const isSpeakingRef = useRef(false);
    const silenceTimeoutRef = useRef(null);
    const pendingUserTextRef = useRef("");
    const pendingUserCaptionIdRef = useRef(null);
    const liveCaptionRef = useRef("");
    const onUserSilenceRef = useRef(onUserSilence);
    const userSpeechStartTimeRef = useRef(null);
    const userResponseTimeoutRef = useRef(null);
    const aiTypingIntervalRef = useRef(null);
    const aiTypingCaptionIdRef = useRef(null);
    const micResumeBlockedUntilRef = useRef(0);
    const resumeListeningTimeoutRef = useRef(null);
    const lastAISpokenTextRef = useRef("");
    const lastAISpeechEndedAtRef = useRef(0);
    const lastUserActivityAtRef = useRef(Date.now());
    const lastNoSpeechPingAtRef = useRef(0);
    const AI_VOICE_GUARD_MS = 3200;
    const AI_ECHO_FILTER_WINDOW_MS = 5000;

    const normalizeSpeechText = useCallback((text) => {
        return (text || "")
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }, []);

    const isLikelyAIEcho = useCallback((normalizedTranscript, { isFinal = false } = {}) => {
        if (!isFinal) return false;
        if (!normalizedTranscript || normalizedTranscript.length < 16) return false;

        const elapsedSinceAISpeechMs = Date.now() - lastAISpeechEndedAtRef.current;
        if (elapsedSinceAISpeechMs > AI_ECHO_FILTER_WINDOW_MS) return false;

        const aiText = lastAISpokenTextRef.current;
        if (!aiText) return false;

        if (normalizedTranscript.length >= 20 && aiText.includes(normalizedTranscript)) return true;

        const transcriptTokens = normalizedTranscript.split(" ").filter((token) => token.length > 2);
        if (transcriptTokens.length < 5) return false;

        const aiTokenSet = new Set(aiText.split(" ").filter((token) => token.length > 2));
        let overlapCount = 0;
        transcriptTokens.forEach((token) => {
            if (aiTokenSet.has(token)) overlapCount += 1;
        });

        return overlapCount / transcriptTokens.length >= 0.85;
    }, [AI_ECHO_FILTER_WINDOW_MS]);

    const extractRecognitionTranscripts = useCallback((event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const result = event.results[index];
            const chunk = result?.[0]?.transcript || "";
            if (!chunk) continue;

            if (result.isFinal) {
                finalTranscript += `${chunk} `;
            } else {
                interimTranscript += `${chunk} `;
            }
        }

        return {
            finalTranscript: finalTranscript.trim(),
            interimTranscript: interimTranscript.trim(),
        };
    }, []);

    const clearSilenceTimeout = useCallback(() => {
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
        }
    }, []);

    const clearResponseTimeout = useCallback(() => {
        if (userResponseTimeoutRef.current) {
            clearTimeout(userResponseTimeoutRef.current);
            userResponseTimeoutRef.current = null;
        }
    }, []);

    const clearAITypingInterval = useCallback(() => {
        if (aiTypingIntervalRef.current) {
            clearInterval(aiTypingIntervalRef.current);
            aiTypingIntervalRef.current = null;
        }
        aiTypingCaptionIdRef.current = null;
    }, []);

    const startListening = useCallback(() => {
        const recognition = recognitionRef.current;
        if (!recognition || isRecognizingRef.current) return;
        if (Date.now() < micResumeBlockedUntilRef.current) return;
        try {
            recognition.start();
        } catch {
            // Ignore start errors
        }
    }, []);

    const clearResumeListeningTimeout = useCallback(() => {
        if (resumeListeningTimeoutRef.current) {
            clearTimeout(resumeListeningTimeoutRef.current);
            resumeListeningTimeoutRef.current = null;
        }
    }, []);

    const scheduleResumeListening = useCallback(() => {
        clearResumeListeningTimeout();

        if (!isMicOnRef.current) return;
        const waitMs = Math.max(0, micResumeBlockedUntilRef.current - Date.now());

        if (waitMs === 0) {
            startListening();
            return;
        }

        resumeListeningTimeoutRef.current = setTimeout(() => {
            resumeListeningTimeoutRef.current = null;
            if (isMicOnRef.current) {
                startListening();
            }
        }, waitMs);
    }, [clearResumeListeningTimeout, startListening]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
    }, []);

    const stopInterviewAudio = useCallback(() => {
        suppressRestartRef.current = true;
        clearSilenceTimeout();
        clearResponseTimeout();
        clearAITypingInterval();
        clearResumeListeningTimeout();
        stopListening();
        pendingUserTextRef.current = "";
        pendingUserCaptionIdRef.current = null;
        userSpeechStartTimeRef.current = null;
        micResumeBlockedUntilRef.current = 0;
        setLiveCaption("");
        stopSpeech();
        isSpeakingRef.current = false;
        setIsSpeaking(false);
    }, [clearAITypingInterval, clearResponseTimeout, clearResumeListeningTimeout, clearSilenceTimeout, stopListening]);

    const addCaption = useCallback((speaker, text) => {
        setCaptions((prev) => [...prev, { id: Date.now() + Math.random(), speaker, text }]);
    }, []);

    const addOrAppendUserCaption = useCallback((chunk) => {
        const normalizedChunk = chunk.trim();
        if (!normalizedChunk) return;

        setCaptions((prev) => {
            const previousId = pendingUserCaptionIdRef.current;
            if (previousId) {
                let updated = false;
                const next = prev.map((caption) => {
                    if (caption.id === previousId && caption.speaker === "You") {
                        updated = true;
                        const joined = caption.text ? `${caption.text} ${normalizedChunk}` : normalizedChunk;
                        return { ...caption, text: joined.trim() };
                    }
                    return caption;
                });
                if (updated) return next;
            }

            const id = Date.now() + Math.random();
            pendingUserCaptionIdRef.current = id;
            return [...prev, { id, speaker: "You", text: normalizedChunk }];
        });
    }, []);

    const speak = useCallback((text, options = {}) => {
        if (!isMicOnRef.current && !options.forceSpeak) return;
        if (!text?.trim()) return;

        const normalizedAiText = normalizeSpeechText(text);
        if (normalizedAiText) {
            lastAISpokenTextRef.current = normalizedAiText;
        }

        const wordCount = normalizedAiText ? normalizedAiText.split(" ").filter(Boolean).length : 0;
        const postSpeechGuardMs = Math.min(5200, Math.max(AI_VOICE_GUARD_MS, 1800 + (wordCount * 70)));

        suppressRestartRef.current = true;
        micResumeBlockedUntilRef.current = Date.now() + postSpeechGuardMs;
        clearResumeListeningTimeout();
        stopListening();
        stopSpeech();

        speakWithElevenLabs(text, {
            onStart: () => {
                isSpeakingRef.current = true;
                setIsSpeaking(true);
                micResumeBlockedUntilRef.current = Date.now() + postSpeechGuardMs;
            },
            onEnd: () => {
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                suppressRestartRef.current = false;
                micResumeBlockedUntilRef.current = Date.now() + postSpeechGuardMs;
                lastAISpeechEndedAtRef.current = Date.now();
                options.onEnd?.();
                scheduleResumeListening();
            },
            onError: () => {
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                suppressRestartRef.current = false;
                micResumeBlockedUntilRef.current = Date.now() + postSpeechGuardMs;
                lastAISpeechEndedAtRef.current = Date.now();
                options.onError?.();
                scheduleResumeListening();
            },
        });
    }, [AI_VOICE_GUARD_MS, clearResumeListeningTimeout, normalizeSpeechText, scheduleResumeListening, stopListening]);

    const respondWithAI = useCallback((aiText, options = {}) => {
        const normalizedText = aiText?.trim();
        if (!normalizedText) return;

        clearAITypingInterval();

        const captionId = Date.now() + Math.random();
        aiTypingCaptionIdRef.current = captionId;
        setCaptions((prev) => [...prev, { id: captionId, speaker: "AI", text: "" }]);

        const words = normalizedText.split(/\s+/).filter(Boolean);
        const typingDurationMs = Math.min(18000, Math.max(4000, words.length * 320));
        const typingIntervalMs = 65;
        const totalSteps = Math.max(1, Math.ceil(typingDurationMs / typingIntervalMs));
        let currentStep = 0;

        const finishTyping = () => {
            setCaptions((prev) => prev.map((caption) => (
                caption.id === captionId && caption.speaker === "AI"
                    ? { ...caption, text: normalizedText }
                    : caption
            )));
            clearAITypingInterval();
        };

        aiTypingIntervalRef.current = setInterval(() => {
            currentStep += 1;
            const progress = Math.min(1, currentStep / totalSteps);
            const nextLength = Math.max(1, Math.floor(normalizedText.length * progress));
            const nextText = normalizedText.slice(0, nextLength);

            setCaptions((prev) => prev.map((caption) => (
                caption.id === captionId && caption.speaker === "AI"
                    ? { ...caption, text: nextText }
                    : caption
            )));

            if (progress >= 1) {
                finishTyping();
            }
        }, typingIntervalMs);

        speak(normalizedText, {
            ...options,
            onEnd: () => {
                finishTyping();
                options.onEnd?.();
            },
            onError: () => {
                finishTyping();
                options.onError?.();
            },
        });
    }, [clearAITypingInterval, speak]);

    useEffect(() => {
        initializeElevenLabs();
    }, []);

    const flushUserTurn = useCallback(async () => {
        if (isSpeakingRef.current || liveCaptionRef.current.trim()) return;

        const fullUserText = pendingUserTextRef.current.trim();
        if (!fullUserText) return;

        pendingUserTextRef.current = "";
        pendingUserCaptionIdRef.current = null;
        clearResponseTimeout();
        userSpeechStartTimeRef.current = null;

        const respondWithAILocal = (aiText, options = {}) => {
            if (!aiText?.trim()) return;
            respondWithAI(aiText.trim(), options); // 🔴 FIX: Now using the typing responder, not direct jump!
        };

        await onUserSilenceRef.current?.(fullUserText, {
            respondWithAI: respondWithAILocal,
            addCaption,
            speak,
        });
    }, [addCaption, speak, clearResponseTimeout, respondWithAI]);

    const emitNoSpeechPing = useCallback(async () => {
        const respondWithAILocal = (aiText, options = {}) => {
            if (!aiText?.trim()) return;
            respondWithAI(aiText.trim(), options);
        };

        await onUserSilenceRef.current?.("", {
            respondWithAI: respondWithAILocal,
            addCaption,
            speak,
        });
    }, [addCaption, speak, respondWithAI]);

    const scheduleSilenceProcessing = useCallback(() => {
        clearSilenceTimeout();
        if (!userSpeechStartTimeRef.current && pendingUserTextRef.current) {
            userSpeechStartTimeRef.current = Date.now();
        }

        silenceTimeoutRef.current = setTimeout(async () => {
            await flushUserTurn();
        }, silenceMs); // Passed 3000 or 2000 from component
    }, [clearSilenceTimeout, flushUserTurn, silenceMs]);

    useEffect(() => {
        isMicOnRef.current = isMicOn;
        if (isMicOn) {
            const now = Date.now();
            lastUserActivityAtRef.current = now;
            lastNoSpeechPingAtRef.current = now;
        }
    }, [isMicOn]);

    useEffect(() => {
        onUserSilenceRef.current = onUserSilence;
    }, [onUserSilence]);

    useEffect(() => {
        liveCaptionRef.current = liveCaption;
    }, [liveCaption]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isRecognizingRef.current = true;
        };

        recognition.onend = () => {
            isRecognizingRef.current = false;
            if (isMicOnRef.current && !suppressRestartRef.current && !isSpeakingRef.current) {
                if (restartTimeoutRef.current) {
                    clearTimeout(restartTimeoutRef.current);
                }
                restartTimeoutRef.current = setTimeout(() => {
                    if (Date.now() < micResumeBlockedUntilRef.current) {
                        scheduleResumeListening();
                        return;
                    }
                    recognition.start();
                }, 200);
            }
        };

        recognition.onerror = () => {
            if (!isMicOnRef.current || suppressRestartRef.current || isSpeakingRef.current) return;
            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }
            restartTimeoutRef.current = setTimeout(() => {
                startListening();
            }, 300);
        };

        recognition.onresult = (event) => {
            const { finalTranscript, interimTranscript } = extractRecognitionTranscripts(event);
            const primaryTranscript = finalTranscript || interimTranscript;
            const normalizedTranscript = normalizeSpeechText(primaryTranscript);

            clearSilenceTimeout();

            if (isSpeakingRef.current || Date.now() < micResumeBlockedUntilRef.current) {
                return;
            }

            if (isLikelyAIEcho(normalizedTranscript, { isFinal: Boolean(finalTranscript) })) {
                setLiveCaption("");
                return;
            }

            if (finalTranscript) {
                const trimmed = finalTranscript.trim();
                if (trimmed) {
                    lastUserActivityAtRef.current = Date.now();
                    pendingUserTextRef.current = pendingUserTextRef.current
                        ? `${pendingUserTextRef.current} ${trimmed}`
                        : trimmed;
                    addOrAppendUserCaption(trimmed);
                    setLiveCaption("");

                    if (Number.isFinite(maxUserResponseSec) && maxUserResponseSec > 0 && userSpeechStartTimeRef.current) {
                        const elapsedSec = (Date.now() - userSpeechStartTimeRef.current) / 1000;
                        if (elapsedSec > maxUserResponseSec) {
                            clearResponseTimeout();
                            stopListening();
                            speak("Thanks for the detailed answer. Please wrap up your current thought in one sentence.", {
                                onEnd: () => {
                                    scheduleSilenceProcessing();
                                },
                            });
                            return;
                        }
                    }

                    scheduleSilenceProcessing();
                }
                return;
            }

            if (interimTranscript) {
                lastUserActivityAtRef.current = Date.now();
            }
            setLiveCaption(interimTranscript);
            scheduleSilenceProcessing();
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
            clearSilenceTimeout();
            clearResponseTimeout();
            clearResumeListeningTimeout();
            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }
        };
    }, [addOrAppendUserCaption, clearResumeListeningTimeout, clearSilenceTimeout, clearResponseTimeout, extractRecognitionTranscripts, isLikelyAIEcho, maxUserResponseSec, normalizeSpeechText, scheduleResumeListening, scheduleSilenceProcessing, speak, startListening, stopListening]);

    useEffect(() => {
        if (!isMicOn) return;

        const idleWatchdog = setInterval(() => {
            if (!isMicOnRef.current) return;
            if (isSpeakingRef.current || suppressRestartRef.current) return;
            if (pendingUserTextRef.current.trim() || liveCaptionRef.current.trim()) return;

            const now = Date.now();
            const idleMs = now - lastUserActivityAtRef.current;
            const sinceLastPingMs = now - lastNoSpeechPingAtRef.current;

            if (idleMs < silenceMs || sinceLastPingMs < silenceMs) {
                return;
            }

            lastNoSpeechPingAtRef.current = now;
            emitNoSpeechPing().catch(() => {
                // Ignore no-speech ping errors
            });
        }, 1000);

        return () => clearInterval(idleWatchdog);
    }, [emitNoSpeechPing, isMicOn, silenceMs]);

    useEffect(() => {
        if (isMicOn) {
            startListening();
        } else {
            stopListening();
            clearSilenceTimeout();
            clearResponseTimeout();
        }
    }, [clearSilenceTimeout, clearResponseTimeout, isMicOn, startListening, stopListening]);

    return {
        captions,
        liveCaption,
        isSpeaking,
        speak,
        respondWithAI,
        stopInterviewAudio,
    };
}