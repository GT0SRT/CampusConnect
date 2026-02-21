export function StatItem({ label, value, theme }) {
    const wrapClass =
        theme === "dark"
            ? "border-slate-700/40 bg-slate-900/55"
            : "border-slate-300 bg-white/75";
    const titleClass = theme === "dark" ? "text-slate-100" : "text-slate-900";
    const labelClass = theme === "dark" ? "text-slate-300" : "text-slate-600";

    return (
        <div className={`rounded-xl border px-4 py-3 text-center ${wrapClass}`}>
            <p className={`text-lg font-bold ${titleClass}`}>{value}</p>
            <p className={`text-xs uppercase tracking-wide ${labelClass}`}>{label}</p>
        </div>
    );
}
