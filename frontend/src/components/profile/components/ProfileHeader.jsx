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
        <header className={`rounded-2xl border p-5 ${cardTone}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3 md:max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold md:text-3xl">{mergedProfile.fullName}</h1>
                    </div>
                    <p className={`text-sm ${subText}`}>@{mergedProfile.username}</p>
                    <p className={`text-sm leading-relaxed ${mutedText}`}>{mergedProfile.bio}</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-500/40 bg-cyan-500/20 px-3 py-1 text-xs font-medium text-cyan-400">
                            {mergedProfile.statusTag}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${softChip}`}>{mergedProfile.availability}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isMe ? (
                        <button
                            type="button"
                            onClick={onEditProfile}
                            className="inline-flex whitespace-nowrap items-center gap-2 rounded-full border border-cyan-500/50 bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-500/30"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit Profile
                        </button>
                    ) : (
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
                    )}
                </div>
            </div>

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

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                <StatItem label="Total Posts" value={mergedProfile.stats.posts} theme={theme} />
                <StatItem label="Total Threads" value={mergedProfile.stats.threads} theme={theme} />
                <StatItem label="Karma" value={mergedProfile.stats.karma} theme={theme} />
            </div>
        </header>
    );
}
