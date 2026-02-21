export function EmptyRow({ text, theme }) {
    return <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>{text}</p>;
}
