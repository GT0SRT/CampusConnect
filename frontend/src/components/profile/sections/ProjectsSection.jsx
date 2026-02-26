import { FolderKanban, Rocket } from "lucide-react";
import { SectionShell } from "../../ui/SectionShell";
import { EmptyRow } from "../../ui/EmptyRow";

export function ProjectsSection({ projects, isMe, theme, onEditClick, cardTone, outerText, softChip }) {
    return (
        <SectionShell
            title="Projects"
            icon={FolderKanban}
            theme={theme}
            isEditable={isMe}
            onEditClick={onEditClick}
        >
            {projects?.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {projects.map((project, index) => (
                        <article key={`${project.title}-${index}`} className={`rounded-xl border p-4 ${cardTone}`}>
                            <div className="mb-2 flex items-center gap-2">
                                <Rocket className="h-4 w-4 text-cyan-500" />
                                <h4 className={`font-semibold ${outerText}`}>{project.title}</h4>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {(project.techStack || []).map((tech, techIndex) => (
                                    <span key={`${tech}-${techIndex}`} className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${softChip}`}>
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <EmptyRow text="No projects added yet." theme={theme} />
            )}
        </SectionShell>
    );
}
