import { Mic, MicOff, Video, VideoOff, Phone, Maximize2, MessageSquare, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Bot } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useUserStore } from "../../store/useUserStore";
import CameraFeed from "./CameraFeed";
import DeviceSettings from "./DeviceSettings";
import { VoiceBlob } from "./VoiceBlob";
import { useNavigate, useParams } from "react-router-dom";
import { useInterviewStore } from "../../store/useInterviewStore";
import { useVoiceInterviewer } from "../../hooks/useVoiceInterviewer";
import { getInterviewerReply } from "../../services/interviewerService";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function InterviewCallRoom({ onRouteStateChange }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const activeSession = useInterviewStore((state) => state.activeSession);
    const addToHistory = useInterviewStore((state) => state.addToHistory);
    const clearActiveSession = useInterviewStore((state) => state.clearActiveSession);
    const isExitingRef = useRef(false);

    useEffect(() => {
        if (!isExitingRef.current && (!activeSession || activeSession.id !== id)) {
            navigate("/interview/join");
        }
    }, [activeSession, id, navigate]);

    const theme = useUserStore((state) => state.theme);
    const isDark = theme === "dark";
    const [isMicOn, setIsMicOn] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [showCaptions, setShowCaptions] = useState(true);
    const [showAI, setShowAI] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedVideoId, setSelectedVideoId] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [autoScrollCaptions, setAutoScrollCaptions] = useState(true);
    const [endCallPromptCount, setEndCallPromptCount] = useState(0);
    const [silenceAfterEndPromptCount, setSilenceAfterEndPromptCount] = useState(0);
    const [endCallPrompted, setEndCallPrompted] = useState(false);
    const captionsScrollRef = useRef(null);
    const captionsRef = useRef([]);
    const initialGreetingSentRef = useRef(false);
    const handleExitCallRef = useRef(null);
    const wakeLockRef = useRef(null);

    const requestWakeLock = useCallback(async () => {
        if (!("wakeLock" in navigator)) return;
        try {
            wakeLockRef.current = await navigator.wakeLock.request("screen");
            wakeLockRef.current.addEventListener("release", () => {
                wakeLockRef.current = null;
            });
        } catch {
            wakeLockRef.current = null;
        }
    }, []);

    const releaseWakeLock = useCallback(async () => {
        try {
            await wakeLockRef.current?.release();
        } catch {
            // Ignore release errors.
        } finally {
            wakeLockRef.current = null;
        }
    }, []);

    const { captions, liveCaption, isSpeaking, respondWithAI, stopInterviewAudio } = useVoiceInterviewer({
        isMicOn,
        silenceMs: 6000,
        onUserSilence: useCallback(async (userText, { respondWithAI, addCaption }) => {
            try {
                // Check if user gave empty/very short response after end call prompt
                const isEmptyResponse = !userText || userText.trim().length < 3;
                if (endCallPrompted && isEmptyResponse) {
                    const newSilenceCount = silenceAfterEndPromptCount + 1;
                    setSilenceAfterEndPromptCount(newSilenceCount);

                    // Auto-disconnect after 3 consecutive silences
                    if (newSilenceCount >= 3) {
                        setTimeout(() => {
                            handleExitCallRef.current?.();
                        }, 2000);
                        return;
                    }
                }

                // Reset silence count if user actually responded
                if (!isEmptyResponse && endCallPrompted) {
                    setSilenceAfterEndPromptCount(0);
                }

                const sessionConfig = activeSession?.config || {};
                const replyData = await getInterviewerReply({
                    message: userText,
                    history: captionsRef.current,
                    company: sessionConfig.company,
                    roleName: sessionConfig.role,
                    topics: sessionConfig.topics,
                    resumeSummary: sessionConfig.resumeOverview,
                    interviewDurationSec: elapsedTime,
                    difficulty: sessionConfig.difficulty,
                    endCallPromptCount: endCallPromptCount,
                    interviewPrompt: sessionConfig.interviewPrompt || "",
                });

                if (replyData?.reply) {
                    respondWithAI(replyData.reply);
                }

                // Update end call prompt count and track if end was prompted
                if (replyData?.endCallPromptCount !== undefined) {
                    setEndCallPromptCount(replyData.endCallPromptCount);
                }

                if (replyData?.end_call_prompted) {
                    setEndCallPrompted(true);
                }
            } catch {
                addCaption("AI", "I couldn't process that response, can you please rephrase?");
            }
        }, [activeSession, elapsedTime, endCallPromptCount, endCallPrompted, silenceAfterEndPromptCount]),
    });

    const handleDeviceChange = useCallback(({ videoDeviceId }) => {
        setSelectedVideoId(videoDeviceId || "");
    }, []);

    const handleCaptionsScroll = useCallback(() => {
        const container = captionsScrollRef.current;
        if (!container) return;
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        setAutoScrollCaptions(distanceFromBottom < 24);
    }, []);

    const handleToggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                return;
            }
            await document.exitFullscreen();
        } catch {
            setIsFullscreen((prev) => !prev);
        }
    }, []);

    const handleExitCall = useCallback(() => {
        if (isExitingRef.current) return;
        isExitingRef.current = true;

        releaseWakeLock();

        stopInterviewAudio();
        setIsMicOn(false);
        setIsCameraOn(false);

        const interviewId = activeSession?.id || id;
        const sessionConfig = activeSession?.config || {};
        const completedInterview = {
            id: interviewId,
            company: sessionConfig.company,
            role: sessionConfig.role,
            topics: sessionConfig.topics,
            difficulty: sessionConfig.difficulty,
            timestamp: new Date().toISOString(),
            duration: elapsedTime,
            transcript: captions,
            metadata: {
                company: sessionConfig.company,
                role: sessionConfig.role,
                topics: sessionConfig.topics,
                difficulty: sessionConfig.difficulty,
                resumeOverview: sessionConfig.resumeOverview || "",
                transcriptCount: captions.length,
            },
            analysis: null,
            status: "analyzing",
        };

        addToHistory(completedInterview);
        clearActiveSession();

        navigate(`/interview/history/${interviewId}`, {
            replace: true,
        });
    }, [activeSession, captions, elapsedTime, navigate, addToHistory, clearActiveSession, id, stopInterviewAudio, releaseWakeLock]);

    useEffect(() => {
        handleExitCallRef.current = handleExitCall;
    }, [handleExitCall]);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime((previousTime) => previousTime + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        onRouteStateChange?.(true);
        return () => onRouteStateChange?.(false);
    }, [onRouteStateChange]);

    useEffect(() => {
        requestWakeLock();

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                requestWakeLock();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            releaseWakeLock();
        };
    }, [requestWakeLock, releaseWakeLock]);

    useEffect(() => {
        const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener("fullscreenchange", onFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
    }, []);

    useEffect(() => {
        if (!autoScrollCaptions) return;
        const container = captionsScrollRef.current;
        if (!container) return;
        container.scrollTop = container.scrollHeight;
    }, [captions, liveCaption, autoScrollCaptions]);

    useEffect(() => {
        captionsRef.current = captions;
    }, [captions]);

    useEffect(() => {
        if (!activeSession?.config) return;
        if (initialGreetingSentRef.current) return;
        if (captions.length > 0) return;

        initialGreetingSentRef.current = true;

        const requestInitialGreeting = async () => {
            try {
                const sessionConfig = activeSession.config || {};
                const replyData = await getInterviewerReply({
                    message: "START_SESSION",
                    history: [],
                    company: sessionConfig.company,
                    roleName: sessionConfig.role,
                    topics: sessionConfig.topics,
                    resumeSummary: sessionConfig.resumeOverview,
                    interviewDurationSec: elapsedTime,
                    difficulty: sessionConfig.difficulty,
                    endCallPromptCount: 0,
                    interviewPrompt: sessionConfig.interviewPrompt || "",
                });

                if (replyData?.reply) {
                    respondWithAI(replyData.reply, { forceSpeak: true });
                }

                if (replyData?.endCallPromptCount !== undefined) {
                    setEndCallPromptCount(replyData.endCallPromptCount);
                }
            } catch {
                initialGreetingSentRef.current = false;
            }
        };

        requestInitialGreeting();
    }, [activeSession, captions.length, elapsedTime, respondWithAI]);


    if (!activeSession || activeSession.id !== id || !activeSession.config) {
        return null;
    }

    return (
        <div className={cn("fixed grid grid-rows-8 inset-0 z-50", isDark ? "bg-slate-900" : "bg-white")}>
            {/* Header with Fullscreen Button */}
            <div className={cn("flex row-span-1 items-center justify-between border-b px-4 sm:px-6 py-4", isDark ? "border-slate-700 bg-slate-800/50" : "border-gray-200 bg-gray-50")}>
                <div className="flex-1">
                    <h2 className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>{activeSession.config.company} - {activeSession.config.role}</h2>
                    <p className={cn("mt-0.5 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>Interview topics • {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, "0")}</p>
                </div>
                <button
                    onClick={handleToggleFullscreen}
                    className={cn("p-2 rounded-lg transition", isDark ? "hover:bg-slate-700" : "hover:bg-gray-200")}
                    title={isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
                >
                    <Maximize2 className={cn("h-5 w-5", isDark ? "text-white" : "text-gray-700")} />
                </button>
            </div>

            <div className={cn("flex flex-col lg:flex-row row-span-6 flex-1 gap-4 p-3 sm:p-6 overflow-hidden", isDark ? "bg-slate-900" : "bg-white")}>

                {/* Camera Feed */}
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-2">
                    <div className={cn("flex-1 rounded-lg overflow-hidden flex", isDark ? "bg-slate-800" : "bg-gray-100")} style={{ minHeight: 0, minWidth: 0 }}>
                        <CameraFeed isEnabled={isCameraOn} videoDeviceId={selectedVideoId} />
                    </div>
                </div>

                {/* AI Response Area with Toggle */}
                <div className="flex flex-col lg:flex-row gap-2 items-stretch">
                    {/* Toggle Strip for AI */}
                    {!showAI && (
                        <button
                            onClick={() => setShowAI(true)}
                            className={cn(
                                "flex lg:flex-col items-center justify-center gap-2 px-3 py-2 lg:px-2 lg:py-4 rounded-lg transition-all w-full lg:w-auto",
                                isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            )}
                            title="Show AI Interviewer"
                        >
                            <Bot className="h-4 w-4" />
                            <span className="text-xs font-medium lg:[writing-mode:vertical-lr] lg:rotate-180">Show AI</span>
                            <ChevronDown className="h-4 w-4 lg:hidden" />
                            <ChevronLeft className="h-4 w-4 hidden lg:block" />
                        </button>
                    )}

                    {/* AI Response Panel */}
                    <div className={cn(
                        "rounded-lg flex items-center justify-center transition-all duration-300 overflow-hidden",
                        isDark ? "bg-slate-800" : "bg-gray-100",
                        showAI ? "flex-1 lg:w-80" : "h-0 lg:h-auto lg:w-0 hidden"
                    )}>
                        {showAI && (
                            <div className="text-center w-full h-full p-4">
                                <div className="flex flex-col h-full">

                                    {/* Top section */}
                                    <div className="w-full">
                                        <button
                                            onClick={() => setShowAI(false)}
                                            className={cn(
                                                "text-xs px-2 w-full py-1 flex rounded transition",
                                                isDark ? "text-slate-300" : "text-gray-700"
                                            )}
                                            title="Hide AI"
                                        >
                                            <p
                                                className={cn(
                                                    "text-xs sm:text-sm font-semibold",
                                                    isDark ? "text-slate-300" : "text-gray-700"
                                                )}
                                            >
                                                AI Interviewer
                                            </p>
                                            <ChevronUp className="h-4 w-4 lg:hidden ml-auto" />
                                            <ChevronRight className="h-4 w-4 hidden lg:block ml-auto" />
                                        </button>
                                    </div>

                                    {/* Blob */}
                                    <div className="flex-1 flex items-center justify-center">
                                        <VoiceBlob isSpeaking={isSpeaking} />
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Captions Panel with Toggle */}
                <div className="flex flex-col lg:flex-row gap-2 items-stretch">
                    {/* Toggle Strip for Captions */}
                    {!showCaptions && (
                        <button
                            onClick={() => setShowCaptions(true)}
                            className={cn(
                                "flex lg:flex-col items-center justify-center gap-2 px-3 py-2 lg:px-2 lg:py-4 rounded-lg transition-all w-full lg:w-auto",
                                isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            )}
                            title="Show Captions"
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-xs font-medium lg:[writing-mode:vertical-lr] lg:rotate-180">Show Captions</span>
                            <ChevronDown className="h-4 w-4 lg:hidden" />
                            <ChevronLeft className="h-4 w-4 hidden lg:block" />
                        </button>
                    )}

                    {/* Captions Panel */}
                    {showCaptions && (
                        <div
                            className={cn(
                                "w-full lg:w-80 rounded-lg border flex flex-col transition-all duration-300",
                                isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"
                            )}
                        >
                            <div className={cn("border-b px-4 py-3 flex items-center justify-between", isDark ? "border-slate-700" : "border-gray-200")}>
                                <button
                                    onClick={() => setShowCaptions(false)}
                                    className={cn("text-xs w-full px-2 py-1 rounded transition flex items-center gap-1",
                                        isDark ? "text-slate-300" : "text-gray-700")}
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        <h3 className="text-sm font-semibold">Captions</h3>
                                    </div>
                                    <ChevronUp className="h-4 w-4 lg:hidden ml-auto" />
                                    <ChevronRight className="h-4 w-4 hidden lg:block ml-auto" />
                                </button>
                            </div>
                            <div
                                ref={captionsScrollRef}
                                onScroll={handleCaptionsScroll}
                                className={cn(
                                    "flex-1 overflow-y-auto p-4 space-y-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                                    isDark ? "bg-slate-800" : "bg-white"
                                )}
                            >
                                {liveCaption && (
                                    <div
                                        className={cn(
                                            "rounded-lg p-3 text-xs",
                                            isDark ? "bg-slate-700/60" : "bg-gray-100"
                                        )}
                                    >
                                        <p className={cn("font-semibold mb-1", isDark ? "text-slate-300" : "text-gray-700")}>
                                            You (listening...)
                                        </p>
                                        <p className={isDark ? "text-slate-300" : "text-gray-700"}>{liveCaption}</p>
                                    </div>
                                )}
                                {captions.map((caption) => (
                                    <div
                                        key={caption.id}
                                        className={cn(
                                            "rounded-lg p-3 text-xs",
                                            caption.speaker === "AI"
                                                ? isDark ? "bg-cyan-500/20 border border-cyan-500/30" : "bg-cyan-50 border border-cyan-200"
                                                : isDark ? "bg-slate-700" : "bg-gray-100"
                                        )}
                                    >
                                        <p className={cn("font-semibold mb-1", caption.speaker === "AI" ? "text-cyan-400" : isDark ? "text-slate-300" : "text-gray-700")}>
                                            {caption.speaker}
                                        </p>
                                        <p className={isDark ? "text-slate-300" : "text-gray-700"}>{caption.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={cn("border-t pt-7 pb-7 row-span-1 px-6 py-3 flex items-center justify-center gap-2", isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-gray-50")}>
                <ControlButton
                    icon={isMicOn ? Mic : MicOff}
                    isDark={isDark}
                    isActive={isMicOn}
                    onClick={() => {
                        setIsMicOn(!isMicOn);
                    }}
                />
                <ControlButton
                    icon={isCameraOn ? Video : VideoOff}
                    isDark={isDark}
                    isActive={isCameraOn}
                    onClick={() => setIsCameraOn(!isCameraOn)}
                />
                <DeviceSettings isDark={isDark} onDeviceChange={handleDeviceChange} />
                <button
                    onClick={handleExitCall}
                    className={cn(
                        "flex h-12 w-20 items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold transition text-sm",
                        "bg-red-500 hover:bg-red-600 text-white",
                    )}
                    title="End interview"
                >
                    <Phone className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}

function ControlButton({ icon, isDark, isActive, onClick }) {
    const IconComponent = icon;

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex h-12 w-16 flex-col items-center justify-center gap-1 rounded-lg p-3 transition",
                isActive === false
                    ? isDark ? "bg-red-500/30 hover:bg-red-500/40" : "bg-red-100 hover:bg-red-200"
                    : isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-gray-200 hover:bg-gray-300"
            )}
        >
            <IconComponent className={cn(
                "h-5 w-5",
                isActive === false
                    ? "text-red-400"
                    : isDark ? "text-white" : "text-gray-700"
            )} />
        </button>
    );
}
