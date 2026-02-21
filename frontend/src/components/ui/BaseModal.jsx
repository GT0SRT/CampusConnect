import { X } from "lucide-react";

export function BaseModal({
    open,
    onClose,
    title,
    theme = "dark",
    maxWidthClass = "max-w-md",
    children,
    contentClassName = "",
    hideCloseButton = false,
}) {
    if (!open) return null;

    const overlayClass = theme === "dark" ? "bg-black/60" : "bg-black/40";
    const panelClass =
        theme === "dark"
            ? "bg-slate-900/95 border-slate-700 text-slate-100"
            : "bg-white border-slate-300 text-slate-900";

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${overlayClass}`}>
            <div className={`w-full rounded-2xl border shadow-2xl ${maxWidthClass} ${panelClass} ${contentClassName}`}>
                {(title || !hideCloseButton) && (
                    <div className="flex items-center justify-between border-b border-slate-700/40 p-4">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        {!hideCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-700/40 hover:text-slate-200"
                                aria-label="Close modal"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
