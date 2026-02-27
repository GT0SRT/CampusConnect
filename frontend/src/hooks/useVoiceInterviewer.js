import { useState, useEffect, useRef, useCallback } from "react";
import { initializeElevenLabs, speakWithElevenLabs, stopSpeech } from "../utils/ttsService";

export function useVoiceInterviewer({ isMicOn, onUserSilence, silenceMs = 2000, maxUserResponseSec = 120 }) {
    const [captions, setCaptions] = useState([]);
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
        try {
            recognition.start();
        } catch {
            // Ignore start errors when already started.
        }
    }, []);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
    }, []);

    const stopInterviewAudio = useCallback(() => {
        suppressRestartRef.current = true;
        clearSilenceTimeout();
        clearResponseTimeout();
        clearAITypingInterval();
        stopListening();
        pendingUserTextRef.current = "";
        pendingUserCaptionIdRef.current = null;
        userSpeechStartTimeRef.current = null;
        setLiveCaption("");
        stopSpeech();
        isSpeakingRef.current = false;
        setIsSpeaking(false);
    }, [clearAITypingInterval, clearResponseTimeout, clearSilenceTimeout, stopListening]);

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
        // Safety check: Don't speak if mic is off (call disconnected/ended)
        if (!isMicOnRef.current && !options.forceSpeak) return;
        if (!text?.trim()) return;
        suppressRestartRef.current = true;
        stopListening();
        stopSpeech();

        speakWithElevenLabs(text, {
            onStart: () => {
                isSpeakingRef.current = true;
                setIsSpeaking(true);
            },
            onEnd: () => {
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                suppressRestartRef.current = false;
                options.onEnd?.();
                if (isMicOnRef.current) {
                    startListening();
                }
            },
            onError: () => {
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                suppressRestartRef.current = false;
                options.onError?.();
                if (isMicOnRef.current) {
                    startListening();
                }
            },
        });
    }, [startListening, stopListening]);

    const respondWithAI = useCallback((aiText, options = {}) => {
        const normalizedText = aiText?.trim();
        if (!normalizedText) return;

        clearAITypingInterval();

        const captionId = Date.now() + Math.random();
        aiTypingCaptionIdRef.current = captionId;
        setCaptions((prev) => [...prev, { id: captionId, speaker: "AI", text: "" }]);

        const words = normalizedText.split(/\s+/).filter(Boolean);
        const typingDurationMs = Math.min(10000, Math.max(2500, words.length * 220));
        const typingIntervalMs = 45;
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

        const respondWithAI = (aiText, options = {}) => {
            if (!aiText?.trim()) return;
            addCaption("AI", aiText.trim());
            speak(aiText.trim(), options);
        };

        await onUserSilenceRef.current?.(fullUserText, {
            respondWithAI,
            addCaption,
            speak,
        });
    }, [addCaption, speak, clearResponseTimeout]);

    const scheduleSilenceProcessing = useCallback(() => {
        clearSilenceTimeout();
        // Track when user started speaking (for response length limit)
        if (!userSpeechStartTimeRef.current && pendingUserTextRef.current) {
            userSpeechStartTimeRef.current = Date.now();
        }

        silenceTimeoutRef.current = setTimeout(async () => {
            await flushUserTurn();
        }, silenceMs);
    }, [clearSilenceTimeout, flushUserTurn, silenceMs]);

    useEffect(() => {
        isMicOnRef.current = isMicOn;
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
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            isRecognizingRef.current = true;
            stopSpeech();
            isSpeakingRef.current = false;
            setIsSpeaking(false);
        };

        recognition.onend = () => {
            isRecognizingRef.current = false;
            if (isMicOnRef.current && !suppressRestartRef.current && !isSpeakingRef.current) {
                if (restartTimeoutRef.current) {
                    clearTimeout(restartTimeoutRef.current);
                }
                restartTimeoutRef.current = setTimeout(() => {
                    recognition.start();
                }, 150);
            }
        };

        recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            const transcript = result[0]?.transcript || "";

            clearSilenceTimeout();

            if (result.isFinal) {
                const trimmed = transcript.trim();
                if (trimmed) {
                    pendingUserTextRef.current = pendingUserTextRef.current
                        ? `${pendingUserTextRef.current} ${trimmed}`
                        : trimmed;
                    addOrAppendUserCaption(trimmed);
                    setLiveCaption("");

                    // Check if user has been speaking too long (> maxUserResponseSec)
                    if (userSpeechStartTimeRef.current) {
                        const elapsedSec = (Date.now() - userSpeechStartTimeRef.current) / 1000;
                        if (elapsedSec > maxUserResponseSec) {
                            // Politely interrupt and ask them to wrap up
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

            setLiveCaption(transcript);
            scheduleSilenceProcessing();
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
            clearSilenceTimeout();
            clearResponseTimeout();
            clearAITypingInterval();
            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }
            stopSpeech();
        };
    }, [addOrAppendUserCaption, clearAITypingInterval, clearSilenceTimeout, clearResponseTimeout, maxUserResponseSec, scheduleSilenceProcessing, speak, stopListening]);

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
