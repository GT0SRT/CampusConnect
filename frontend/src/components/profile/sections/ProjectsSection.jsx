import { ExternalLink, FolderKanban, Rocket } from "lucide-react";
import { SectionShell } from "../../ui/SectionShell";
import { EmptyRow } from "../../ui/EmptyRow";

export function ProjectsSection({ projects, isMe, theme, onEditClick, cardTone, outerText, softChip }) {
    const descriptionText = theme === "dark" ? "text-slate-300" : "text-slate-600";
    const linkClass = theme === "dark" ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-700";

    const normalizeLink = (value) => {
        const raw = String(value || "").trim();
        if (!raw) {
            return "";
        }

        if (raw.startsWith("http://") || raw.startsWith("https://")) {
            return raw;
        }

        return `https://${raw}`;
    };

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

                            {project.description ? (
                                <p className={`mb-3 text-xs leading-relaxed ${descriptionText}`}>{project.description}</p>
                            ) : null}

                            <div className="flex flex-wrap gap-1.5">
                                {(project.techStack || []).map((tech, techIndex) => (
                                    <span key={`${tech}-${techIndex}`} className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${softChip}`}>
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            {normalizeLink(project.liveLink || project.link || project.url) ? (
                                <a
                                    href={normalizeLink(project.liveLink || project.link || project.url)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold transition ${linkClass}`}
                                >
                                    Open Project
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            ) : null}
                        </article>
                    ))}
                </div>
            ) : (
                <EmptyRow text="No projects added yet." theme={theme} />
            )}
        </SectionShell>
    );
}
