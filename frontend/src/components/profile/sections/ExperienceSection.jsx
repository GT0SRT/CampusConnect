import { BriefcaseBusiness } from "lucide-react";
import { SectionShell } from "../../ui/SectionShell";
import { EmptyRow } from "../../ui/EmptyRow";

export function ExperienceSection({ experience, isMe, theme, onEditClick, cardTone, outerText, subText }) {
    return (
        <SectionShell
            title="Experience"
            icon={BriefcaseBusiness}
            theme={theme}
            isEditable={isMe}
            onEditClick={onEditClick}
        >
            {experience?.length ? (
                <div className="space-y-2">
                    {experience.map((item, index) => (
                        <div key={`${item.company}-${index}`} className={`rounded-xl border px-4 py-3 ${cardTone}`}>
                            <p className={`font-medium ${outerText}`}>{item.company}</p>
                            <p className={`text-xs ${subText}`}>{item.role}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyRow text="No experience details added." theme={theme} />
            )}
        </SectionShell>
    );
}
