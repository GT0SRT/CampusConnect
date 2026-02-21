import { Heart, BookmarkX } from "lucide-react";
import { BaseCard } from "../../ui";
import { getOptimizedImageUrl } from "../../../utils/imageOptimizer";

export function ProfilePostCard({
    post,
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
    const textTone = theme === "dark" ? "text-slate-200" : "text-slate-800";
    const metaTone = theme === "dark" ? "text-slate-400" : "text-slate-600";
    const removeTone =
        theme === "dark"
            ? "border-slate-700 bg-slate-950/90 text-slate-200"
            : "border-slate-300 bg-white text-slate-700";

    const thumbnail = post?.imageUrl
        ? getOptimizedImageUrl(post.imageUrl.slice(0, -3) + "webp", "thumbnail")
        : null;

    return (
        <BaseCard
            onClick={() => onOpen?.(post)}
            className={`group relative cursor-pointer p-3 ${cardTone}`}
        >
            {thumbnail ? (
                <img
                    src={thumbnail}
                    alt={post.caption || post.text || "Post image"}
                    className="mb-3 h-44 w-full rounded-lg object-cover"
                    loading="lazy"
                />
            ) : null}
            <p className={`line-clamp-2 text-sm ${textTone}`}>{post.text || post.caption || "Campus post"}</p>
            <p className={`mt-2 flex items-center gap-1 text-xs ${metaTone}`}>
                <Heart className="h-3.5 w-3.5" /> {post.likes || 0} likes
            </p>

            {isSaved && showRemove ? (
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onRemove?.(post.id);
                    }}
                    className={`absolute right-3 top-3 flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium ${removeTone}`}
                >
                    <BookmarkX className="h-3.5 w-3.5" /> Remove
                </button>
            ) : null}
        </BaseCard>
    );
}
