import { EmptyRow } from "./EmptyRow";

export function DefaultTabList({ items, emptyText, theme }) {
    const rowClass =
        theme === "dark" ? "glass-surface border-slate-800/40" : "glass-surface border-slate-300/60";
    const titleClass = theme === "dark" ? "text-slate-100" : "text-slate-900";
    const summaryClass = theme === "dark" ? "text-slate-400" : "text-slate-600";

    if (!items?.length) {
        return <EmptyRow text={emptyText} theme={theme} />;
    }

    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <div
                    key={`${item?.id ?? item?.title ?? "item"}-${index}`}
                    className={`rounded-xl border px-4 py-3 ${rowClass}`}
                >
                    <p className={`font-medium ${titleClass}`}>{item?.title || item?.name || "Untitled"}</p>
                    {item?.summary ? <p className={`mt-1 text-sm ${summaryClass}`}>{item.summary}</p> : null}
                </div>
            ))}
        </div>
    );
}
