import { Tags } from "lucide-react";
import { SectionShell } from "../../ui/SectionShell";
import { EmptyRow } from "../../ui/EmptyRow";

export function SkillsSection({ skills, isMe, theme, onEditClick }) {
    const chipClass =
        theme === "dark"
            ? "border-indigo-500/30 bg-indigo-600/15 text-indigo-100"
            : "border-indigo-300 bg-indigo-50 text-indigo-700";

    return (
        <SectionShell
            title="Skills"
            icon={Tags}
            theme={theme}
            isEditable={isMe}
            onEditClick={onEditClick}
        >
            {skills?.length ? (
                <div className="flex flex-wrap gap-2">
                    {(skills || []).map((item, index) => (
                        <span
                            key={`${item}-${index}`}
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${chipClass}`}
                        >
                            {item}
                        </span>
                    ))}
                </div>
            ) : (
                <EmptyRow text="No skills added." theme={theme} />
            )}
        </SectionShell>
    );
}
