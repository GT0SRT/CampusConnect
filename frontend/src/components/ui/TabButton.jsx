import { createElement } from "react";
import { motion } from "framer-motion";

const MotionSpan = motion.span;

export function TabButton({ active, label, icon: Icon, onClick, theme }) {
    const activeText = "text-slate-50";
    const inactiveText =
        theme === "dark" ? "text-slate-300 hover:text-slate-100" : "text-slate-600 hover:text-slate-900";

    return (
        <button
            onClick={onClick}
            className={`relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${active ? activeText : inactiveText}`}
            type="button"
        >
            {active ? (
                <MotionSpan
                    layoutId="profile-tab-pill"
                    className="absolute inset-0 rounded-xl bg-cyan-500/90"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
            ) : null}
            <span className="relative z-10 inline-flex items-center gap-2">
                {createElement(Icon, { className: "h-4 w-4" })}
                {label}
            </span>
        </button>
    );
}
