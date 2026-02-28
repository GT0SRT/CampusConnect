import { createElement } from "react";
import { Pencil, Send, MessageSquare } from "lucide-react";
import { StatItem } from "../../ui/StatItem";

export function ProfileHeader({
    mergedProfile,
    isMe,
    theme,
    socialItems,
    onEditProfile,
    onConnect,
    onMessage,
    cardTone,
    subText,
    mutedText,
    softChip,
}) {
    return (
        <header className={`relative rounded-2xl border p-5 ${cardTone}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4 md:max-w-3xl">
                    <div className={`h-20 w-20 shrink-0 rounded-full overflow-hidden border ${theme === "dark" ? "border-slate-700 bg-slate-800" : "border-slate-300 bg-slate-100"}`}>
                        {mergedProfile.profile_pic || mergedProfile.profileImageUrl ? (
                            <img
                                src={mergedProfile.profile_pic || mergedProfile.profileImageUrl}
                                alt={mergedProfile.fullName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className={`h-full w-full flex items-center justify-center text-[10px] font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                                No Profile
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold md:text-3xl">{mergedProfile.fullName}</h1>
                        </div>
                        <p className={`text-sm ${subText}`}>@{mergedProfile.username}</p>
                        <p className={`text-sm leading-relaxed ${mutedText}`}>{mergedProfile.bio}</p>
                    </div>
                </div>

                <div className="flex w-full md:w-auto items-center justify-end gap-2">
                    {!isMe ? (
                        <>
                            <button
                                type="button"
                                onClick={onConnect}
                                className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                            >
                                <Send className="h-4 w-4" />
                                Connect
                            </button>
                            <button
                                type="button"
                                onClick={onMessage}
                                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-indigo-500/40 ${softChip}`}
                            >
                                <MessageSquare className="h-4 w-4" />
                                Message
                            </button>
                        </>
                    ) : null}
                </div>
            </div>

            {isMe ? (
                <button
                    type="button"
                    onClick={onEditProfile}
                    className="absolute right-4 top-4 inline-flex whitespace-nowrap items-center gap-2 rounded-full border border-cyan-500/50 bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-500/30"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </button>
            ) : null}

            {socialItems.length ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {socialItems.map((item) => (
                        <a
                            key={item.key}
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${softChip}`}
                            aria-label={item.label}
                        >
                            {createElement(item.icon, { className: "h-3.5 w-3.5" })}
                            {item.label}
                        </a>
                    ))}
                </div>
            ) : null}

            <div className="mt-5 grid grid-cols-3 gap-3">
                <StatItem label="Total Posts" value={mergedProfile.stats.posts} theme={theme} />
                <StatItem label="Total Threads" value={mergedProfile.stats.threads} theme={theme} />
                <StatItem label="Karma" value={mergedProfile.stats.karma} theme={theme} />
            </div>
        </header>
    );
}
