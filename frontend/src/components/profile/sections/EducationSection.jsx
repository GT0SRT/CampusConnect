import { GraduationCap } from "lucide-react";
import { SectionShell } from "../../ui/SectionShell";
import { EmptyRow } from "../../ui/EmptyRow";

function formatEducationYears(item) {
    if (item?.fromYear && item?.toYear) {
        return `${item.fromYear} - ${item.toYear}`;
    }

    return item?.years || "";
}

function getCollegeName(item) {
    return item?.collegeName || item?.institution || "";
}

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
                        <div key={`${getCollegeName(item)}-${item?.id || index}`} className={`rounded-xl border px-4 py-3 ${cardTone}`}>
                            <p className={`font-medium ${outerText}`}>{getCollegeName(item)}</p>
                            <p className={`text-xs ${subText}`}>{item?.branch || item?.degree || ""}</p>
                            <p className={`text-xs ${subText}`}>{formatEducationYears(item)}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyRow text="No education details added." theme={theme} />
            )}
        </SectionShell>
    );
}
