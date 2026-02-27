import { useState } from "react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useUserStore } from "../../store/useUserStore";
import { useNavigate } from "react-router-dom";
import { useInterviewStore } from "../../store/useInterviewStore";
import { generateInterviewPrompt } from "../../services/interviewerService";

const cn = (...classes) => classes.filter(Boolean).join(" ");
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export default function InterviewSetup({ onStart }) {
    const theme = useUserStore((state) => state.theme);
    const setActiveSession = useInterviewStore((state) => state.setActiveSession);
    const isDark = theme === "dark";
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [topics, setTopics] = useState("");
    const [resumeName, setResumeName] = useState("");
    const [difficulty, setDifficulty] = useState("moderate");
    const [errors, setErrors] = useState({});
    const [resumeOverview, setResumeOverview] = useState("");
    const [isStarting, setIsStarting] = useState(false);
    const [startError, setStartError] = useState("");
    const navigate = useNavigate();

    const difficultyLevels = [
        { id: "basic", label: "Basic" },
        { id: "moderate", label: "Moderate" },
        { id: "tough", label: "Tough" },
    ];

    const handleResumeUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedExtensions = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowedExtensions.includes(file.type)) {
            alert("Invalid format. Please upload a PDF or DOCX.");
            return;
        }

        setResumeName(file.name);
        setResumeOverview("");

        if (!API_BASE_URL) {
            setResumeName("Error analyzing resume");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${API_BASE_URL}/resumeanalyzer`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("AI Analysis failed");

            const data = await response.json();
            setResumeOverview(data.overview);
        } catch (error) {
            console.error("Upload error:", error);
            setResumeName("Error analyzing resume");
        }
    };

    const validateForm = () => {
        const nextErrors = {};
        if (!company.trim()) nextErrors.company = "Company is required";
        if (!role.trim()) nextErrors.role = "Job role is required";
        if (!topics.trim()) nextErrors.topics = "Topics are required";
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleStart = async () => {
        if (!validateForm()) return;
        if (isStarting) return;

        setStartError("");
        setIsStarting(true);

        const topicsList = topics.split(/[,\s]+/).filter((topic) => topic.trim());

        try {
            const interviewPrompt = await generateInterviewPrompt({
                company,
                roleName: role,
                topics: topicsList,
                resumeSummary: resumeOverview || "No resume provided",
                difficulty,
            });

            const interviewId = `iv-${Date.now()}`;

            const sessionData = {
                id: interviewId,
                config: {
                    company,
                    role,
                    topics: topicsList,
                    difficulty,
                    resumeOverview: resumeOverview,
                    interviewPrompt,
                },
                status: "in-progress"
            };

            setActiveSession(sessionData);
            localStorage.setItem("active_session", JSON.stringify(sessionData));
            onStart?.(sessionData);
            navigate(`/interview/join/${interviewId}`);
        } catch (error) {
            setStartError(error?.message || "Failed to start interview setup. Please try again.");
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <div className={cn("min-h-screen py-2 px-2 bg-transparent")}>
            <div className="mx-auto max-w-4xl">
                <div className="mb-4">
                    <h1 className={cn("text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>Interview Practice</h1>
                    <p className={cn("mt-1 text-md", isDark ? "text-slate-400" : "text-slate-600")}>
                        Configure your setup and practice with AI-powered interviews.
                    </p>
                </div>

                <div className={cn("rounded-2xl border p-7", isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white")}>
                    <div className="space-y-5">
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", isDark ? "text-slate-300" : "text-slate-700")}>
                                Company <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={company}
                                onChange={(event) => setCompany(event.target.value)}
                                placeholder="e.g. Google, Amazon, Microsoft"
                                className={cn(
                                    "w-full rounded-lg border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-500",
                                    isDark
                                        ? errors.company ? "border-red-500 bg-red-950 text-white" : "border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                                        : errors.company ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
                                )}
                            />
                            {errors.company && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                    <AlertCircle className="h-3 w-3" /> {errors.company}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={cn("block text-sm font-medium mb-2", isDark ? "text-slate-300" : "text-slate-700")}>
                                Job Role <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={role}
                                onChange={(event) => setRole(event.target.value)}
                                placeholder="e.g. Software Engineer, Product Manager"
                                className={cn(
                                    "w-full rounded-lg border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-500",
                                    isDark
                                        ? errors.role ? "border-red-500 bg-red-950 text-white" : "border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                                        : errors.role ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
                                )}
                            />
                            {errors.role && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                    <AlertCircle className="h-3 w-3" /> {errors.role}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={cn("block text-sm font-medium mb-2", isDark ? "text-slate-300" : "text-slate-700")}>
                                Topics to Practice <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={topics}
                                onChange={(event) => setTopics(event.target.value)}
                                placeholder="e.g. DSA, System Design, HR"
                                className={cn(
                                    "w-full rounded-lg border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-500",
                                    isDark
                                        ? errors.topics ? "border-red-500 bg-red-950 text-white" : "border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                                        : errors.topics ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
                                )}
                            />
                            {errors.topics && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                    <AlertCircle className="h-3 w-3" /> {errors.topics}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={cn("block text-sm font-medium mb-3", isDark ? "text-slate-300" : "text-slate-700")}>
                                Interview Difficulty Level
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {difficultyLevels.map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={() => setDifficulty(level.id)}
                                        className={cn(
                                            "rounded-md px-2 py-1 font-semibold text-white transition",
                                            difficulty === level.id ? `bg-cyan-500/40 ring-1 ring-cyan-500 ring-offset-2` : `bg-cyan-500/40 hover:bg-cyan-500/50 ring-1 ring-cyan-500`,
                                            isDark ? "" : "ring-offset-gray-50"
                                        )}
                                    >
                                        <p className="text-sm">{level.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className={cn("block text-sm font-medium mb-2", isDark ? "text-slate-300" : "text-slate-700")}>
                                Resume (Optional)
                            </label>
                            <label className={cn("flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed px-4 py-6 transition", isDark ? "border-slate-600 hover:border-cyan-500 hover:bg-cyan-500/10" : "border-gray-300 hover:border-cyan-400 hover:bg-cyan-50")}>
                                <Upload className={cn("h-5 w-5", isDark ? "text-slate-400" : "text-gray-400")} />
                                <div className="flex-1">
                                    <p className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-slate-700")}>
                                        {resumeName || "Click to upload resume"}
                                    </p>
                                    <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>PDF or Word or docx document</p>
                                </div>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleResumeUpload}
                                    className="hidden"
                                    id="resume-upload"
                                />
                            </label>
                            {resumeName && (
                                <div className={cn("mt-2 flex items-center gap-2 text-xs",
                                    isDark ? "text-green-400" : "text-green-600",
                                    resumeName === "Error analyzing resume" && (isDark ? "text-red-400" : "text-red-600")
                                )}>
                                    {
                                        resumeName === "Error analyzing resume" ? (
                                            <AlertCircle className="h-4 w-4" />
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4" />
                                        )
                                    }
                                    {resumeName}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={handleStart}
                            disabled={isStarting}
                            className={cn(
                                "w-full rounded-lg px-4 py-3 font-semibold text-white transition",
                                isStarting ? "bg-cyan-500/70 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"
                            )}
                        >
                            {isStarting ? "Starting Interview..." : "Start Now"}
                        </button>

                        {isStarting && (
                            <div className={cn("mt-4 rounded-lg border p-4", isDark ? "border-cyan-500/40 bg-cyan-500/10" : "border-cyan-200 bg-cyan-50")}>
                                <div className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-full border-2 border-cyan-300 border-t-cyan-600 animate-spin" />
                                    <p className={cn("text-sm font-medium", isDark ? "text-cyan-300" : "text-cyan-700")}>Setting up AI interviewer and preparing your session...</p>
                                </div>
                                <div className="mt-2 flex gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.3s]" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.15s]" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-bounce" />
                                </div>
                            </div>
                        )}

                        {startError && (
                            <p className="mt-3 text-sm text-red-500">{startError}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
