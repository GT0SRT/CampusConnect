import { AlertTriangle, Loader2 } from "lucide-react";

function SkeletonCard({ theme }) {
    const cardClass = theme === "dark" ? "border-slate-800 bg-slate-900" : "border-slate-300 bg-white";
    const lineClass = theme === "dark" ? "bg-slate-700" : "bg-slate-200";

    return (
        <div className={`rounded-xl border p-4 ${cardClass}`}>
            <div className={`mb-3 h-4 w-2/3 animate-pulse rounded ${lineClass}`} />
            <div className={`mb-2 h-3 w-full animate-pulse rounded ${lineClass}`} />
            <div className={`h-3 w-5/6 animate-pulse rounded ${lineClass}`} />
        </div>
    );
}

export function ProfileTabLoading({ theme, count = 2 }) {
    return (
        <div className="space-y-2" role="status" aria-live="polite">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} theme={theme} />
            ))}
        </div>
    );
}

export function ProfileTabError({ theme, error, onRetry }) {
    const panelClass =
        theme === "dark"
            ? "border-red-800/60 bg-red-950/30 text-red-100"
            : "border-red-300 bg-red-50 text-red-800";

    return (
        <div className={`rounded-xl border p-4 ${panelClass}`}>
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4" /> Failed to load profile content
            </p>
            <p className="mb-3 text-xs opacity-90">{error?.message || "Please try again."}</p>
            <button
                type="button"
                onClick={onRetry}
                className="rounded-lg border border-current px-3 py-1.5 text-xs font-semibold hover:bg-black/10"
            >
                Retry
            </button>
        </div>
    );
}

export function ProfileRefreshingState({ theme }) {
    const tone = theme === "dark" ? "text-cyan-300" : "text-cyan-700";

    return (
        <p className={`mb-2 inline-flex items-center gap-1.5 text-xs font-medium ${tone}`}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating latest data...
        </p>
    );
}
