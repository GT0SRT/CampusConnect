import { cn } from "../../utils/squadUtils";

export function Avatar({ src, alt, initials, className = "" }) {
    return (
        <div className={cn("overflow-hidden rounded-full bg-cyan-150", className)}>
            {src ? (
                <img src={src} alt={alt} className="h-full w-full object-cover" />
            ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-bold text-cyan-750">
                    {initials}
                </span>
            )}
        </div>
    );
}

export function UnreadDot({ isVisible }) {
    if (!isVisible) {
        return null;
    }

    return <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-cyan-500" />;
}
