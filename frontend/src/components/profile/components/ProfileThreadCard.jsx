import { BookmarkX, MessageSquare, ThumbsUp } from "lucide-react";
import { BaseCard } from "../../ui";

function getVoteCount(thread) {
    const upvotes = Array.isArray(thread?.upvotes)
        ? thread.upvotes.length
        : Number(thread?.upvotes || 0);
    const downvotes = Array.isArray(thread?.downvotes)
        ? thread.downvotes.length
        : Number(thread?.downvotes || 0);

    return upvotes - downvotes;
}

export function ProfileThreadCard({
    thread,
    theme,
    isSaved = false,
    showRemove = false,
    onOpen,
    onRemove,
}) {
    const cardTone =
        theme === "dark"
            ? "border-slate-800 bg-slate-900 hover:border-indigo-500/50"
            : "border-slate-300 bg-white hover:border-indigo-400/60";
    const titleTone = theme === "dark" ? "text-slate-100 hover:text-indigo-300" : "text-slate-900 hover:text-indigo-700";
    const descTone = theme === "dark" ? "text-slate-300" : "text-slate-700";
    const metaTone = theme === "dark" ? "text-slate-400" : "text-slate-600";
    const removeTone =
        theme === "dark"
            ? "border-slate-700 bg-slate-950 text-slate-200"
            : "border-slate-300 bg-white text-slate-700";

    return (
        <BaseCard className={cardTone}>
            <div className="mb-2 flex items-start justify-between gap-3">
                <h4
                    onClick={() => onOpen?.(thread.id)}
                    className={`cursor-pointer text-base font-semibold ${titleTone}`}
                >
                    {thread.title}
                </h4>
                {isSaved && showRemove ? (
                    <button
                        type="button"
                        onClick={() => onRemove?.(thread.id)}
                        className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium ${removeTone}`}
                    >
                        <BookmarkX className="h-3.5 w-3.5" /> Remove
                    </button>
                ) : null}
            </div>

            <p
                className={`line-clamp-2 text-sm ${descTone}`}
                dangerouslySetInnerHTML={{ __html: thread.description || "No description available." }}
            />

            <div className={`mt-3 flex items-center gap-4 text-xs ${metaTone}`}>
                <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {getVoteCount(thread)} votes</span>
                <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {thread.answersCount || thread.Discussion?.length || 0} answers</span>
            </div>
        </BaseCard>
    );
}
