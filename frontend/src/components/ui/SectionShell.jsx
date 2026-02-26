import { createElement } from "react";
import { Pencil } from "lucide-react";

export function SectionShell({ title, icon: Icon, children, theme, isEditable = false, onEditClick }) {
    const shellClass =
        theme === "dark"
            ? "glass-surface border-slate-800/40"
            : "glass-surface border-slate-300/60";
    const titleClass = theme === "dark" ? "text-slate-100" : "text-slate-900";

    return (
        <section className={`rounded-2xl border p-5 ${shellClass}`}>
            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {createElement(Icon, { className: "h-4 w-4 text-cyan-500" })}
                    <h3 className={`text-sm font-semibold uppercase tracking-wide ${titleClass}`}>{title}</h3>
                </div>
                {isEditable && (
                    <button
                        type="button"
                        onClick={onEditClick}
                        className="inline-flex items-center justify-center rounded-full p-1.5 text-slate-400 transition hover:bg-slate-700/30 hover:text-slate-200"
                        aria-label={`Edit ${title}`}
                        title={`Edit ${title}`}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
            {children}
        </section>
    );
}
