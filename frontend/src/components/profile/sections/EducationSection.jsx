import { GraduationCap } from "lucide-react";
import { SectionShell } from "../../ui/SectionShell";
import { EmptyRow } from "../../ui/EmptyRow";

export function EducationSection({ education, isMe, theme, onEditClick, cardTone, outerText, subText }) {
    return (
        <SectionShell
            title="Education"
            icon={GraduationCap}
            theme={theme}
            isEditable={isMe}
            onEditClick={onEditClick}
        >
            {education?.length ? (
                <div className="space-y-2">
                    {education.map((item, index) => (
                        <div key={`${item.institution}-${index}`} className={`rounded-xl border px-4 py-3 ${cardTone}`}>
                            <p className={`font-medium ${outerText}`}>{item.institution}</p>
                            <p className={`text-xs ${subText}`}>{item.years}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyRow text="No education details added." theme={theme} />
            )}
        </SectionShell>
    );
}
