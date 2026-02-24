import { X, Clock, MapPin, Copy } from "lucide-react";
import { useState } from "react";
import { useUserStore } from "../../store/useUserStore";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function ScheduledInterviewCard({ config, onJoin, onCancel }) {
    const theme = useUserStore((state) => state.theme);
    const isDark = theme === "dark";
    const [copied, setCopied] = useState(false);

    const meetingLink = `https://meet.google.com/abc-defg-hij`;
    const scheduledDate = new Date(config.scheduledTime);
    const formattedTime = scheduledDate.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const isUpcoming = scheduledDate > new Date();

    const copyLink = () => {
        navigator.clipboard.writeText(meetingLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("min-h-screen py-8 px-4", isDark ? "bg-slate-900" : "bg-linear-to-br from-gray-50 to-gray-100")}>
            <div className="mx-auto max-w-2xl">
                <div className={cn("rounded-2xl border p-8 shadow-sm", isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white")}>
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>Interview Scheduled</h2>
                        <button
                            onClick={onCancel}
                            className={cn("rounded-lg p-2", isDark ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-gray-100")}
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Interview Details */}
                    <div className={cn("mb-6 space-y-4 rounded-lg p-6 border", isDark ? "bg-cyan-500/10 border-cyan-500/30" : "bg-cyan-50 border-cyan-200")}>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoItem label="Company" value={config.company} isDark={isDark} />
                            <InfoItem label="Role" value={config.role} isDark={isDark} />
                        </div>
                        <div>
                            <p className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-600")}>Topics</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {config.topics.map((topic) => (
                                    <span key={topic} className={cn("rounded-full px-3 py-1 text-xs font-medium", isDark ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-200 text-cyan-900")}>
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Status & Schedule */}
                    <div className={cn("mb-6 space-y-3 rounded-lg p-6 border", isDark ? "bg-slate-700/50 border-slate-600" : "bg-gray-50 border-gray-200")}>
                        <div className="flex items-center gap-3">
                            <Clock className={cn("h-5 w-5", isDark ? "text-cyan-400" : "text-slate-500")} />
                            <div>
                                <p className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-600")}>Scheduled for</p>
                                <p className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>{formattedTime}</p>
                            </div>
                        </div>

                        <div className={cn("rounded-lg p-3 border", isDark ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200")}>
                            <p className={cn("text-xs font-medium", isDark ? "text-blue-300" : "text-blue-700")}>
                                {isUpcoming
                                    ? "✅ You will receive a reminder 30 minutes before the interview starts."
                                    : "⏰ Interview time has passed. Contact support to reschedule."}
                            </p>
                        </div>
                    </div>

                    {/* Meeting Link */}
                    <div className={cn("mb-6 rounded-lg p-6 border", isDark ? "bg-purple-500/10 border-purple-500/30" : "bg-purple-50 border-purple-200")}>
                        <p className={cn("mb-3 text-xs font-medium uppercase tracking-wider flex items-center", isDark ? "text-slate-400" : "text-slate-600")}>
                            <MapPin className="inline h-4 w-4 mr-1" /> Meeting Link
                        </p>
                        <div className={cn("flex items-center gap-2 rounded-lg px-4 py-3 border", isDark ? "bg-slate-700 border-slate-600" : "bg-white border-purple-200")}>
                            <code className={cn("flex-1 text-sm font-mono truncate", isDark ? "text-slate-300" : "text-slate-700")}>{meetingLink}</code>
                            <button
                                onClick={copyLink}
                                className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs", isDark ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" : "bg-purple-100 text-purple-700 hover:bg-purple-200")}
                            >
                                <Copy className="h-3 w-3" /> {copied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        {isUpcoming && (
                            <button
                                onClick={onJoin}
                                className={cn("rounded-lg px-4 py-3 font-semibold transition", isDark ? "bg-cyan-600 text-white hover:bg-cyan-700" : "bg-cyan-600 text-white hover:bg-cyan-700")}
                            >
                                Join Now
                            </button>
                        )}
                        <button
                            onClick={onCancel}
                            className={cn(
                                "rounded-lg px-4 py-3 font-semibold transition",
                                isUpcoming
                                    ? isDark ? "border border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600" : "border border-gray-300 bg-white text-slate-700 hover:bg-gray-50"
                                    : isDark ? "col-span-2 border border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600" : "col-span-2 border border-gray-300 bg-white text-slate-700 hover:bg-gray-50"
                            )}
                        >
                            {isUpcoming ? "Cancel" : "Go Back"}
                        </button>
                    </div>

                    {/* Additional Info */}
                    <div className={cn("mt-6 rounded-lg p-4 text-xs border", isDark ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800")}>
                        <p>
                            <strong>Note:</strong> This is a placeholder. Once scheduled, you'll join a call interface on the set time.
                            Camera & microphone will be initialized automatically.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value, isDark }) {
    return (
        <div>
            <p className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-600")}>{label}</p>
            <p className={cn("mt-1 text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>{value}</p>
        </div>
    );
}
