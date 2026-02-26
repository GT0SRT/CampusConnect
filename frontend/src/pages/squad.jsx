import { useState } from "react";
import {
    MessageCircle,
    UserMinus,
    FolderOpen,
    ChevronDown,
    ChevronRight,
    Plus,
    Users,
    Star,
    Compass,
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const squads = [
    {
        id: "hackathon-crew",
        name: "Hackathon Crew",
        icon: Star,
        color: "text-accent",
        bgColor: "bg-cyan-500",
        members: [
            {
                id: "1",
                name: "Priya Sharma",
                avatar: "https://i.pravatar.cc/150?img=47",
                initials: "PS",
                role: "Full-Stack Dev",
                college: "IIT Delhi",
                connectedVia: "Hackathon Interest",
                status: "online",
            },
            {
                id: "5",
                name: "Ananya Reddy",
                avatar: "https://i.pravatar.cc/150?img=44",
                initials: "AR",
                role: "Backend Dev",
                college: "IIT Delhi",
                connectedVia: "Project Recruit",
                status: "online",
            },
            {
                id: "6",
                name: "Karan Mehta",
                avatar: "https://i.pravatar.cc/150?img=61",
                initials: "KM",
                role: "DevOps Engineer",
                college: "IIT Delhi",
                connectedVia: "Hackathon Interest",
                status: "busy",
            },
        ],
    },
    {
        id: "design-squad",
        name: "Design Squad",
        icon: FolderOpen,
        color: "text-primary",
        bgColor: "bg-cyan-500",
        members: [
            {
                id: "2",
                name: "Meera Krishnan",
                avatar: "https://i.pravatar.cc/150?img=45",
                initials: "MK",
                role: "UI/UX Designer",
                college: "NIFT Mumbai",
                connectedVia: "Mentorship",
                status: "offline",
            },
            {
                id: "7",
                name: "Diya Nair",
                avatar: "https://i.pravatar.cc/150?img=43",
                initials: "DN",
                role: "Graphic Designer",
                college: "NIFT Mumbai",
                connectedVia: "Collaboration",
                status: "online",
            },
        ],
    },
    {
        id: "startup-founders",
        name: "Startup Founders",
        icon: Users,
        color: "text-chart-3",
        bgColor: "bg-cyan-500",
        members: [
            {
                id: "3",
                name: "Rohan Gupta",
                avatar: "https://i.pravatar.cc/150?img=59",
                initials: "RG",
                role: "Mobile Dev",
                college: "BITS Pilani",
                connectedVia: "Project Recruit",
                status: "offline",
            },
            {
                id: "4",
                name: "Arjun Patel",
                avatar: "https://i.pravatar.cc/150?img=53",
                initials: "AP",
                role: "ML Engineer",
                college: "NIT Trichy",
                connectedVia: "Co-founder Search",
                status: "busy",
            },
        ],
    },
    {
        id: "mentors",
        name: "Mentors",
        icon: Star,
        color: "text-chart-4",
        bgColor: "bg-cyan-500",
        members: [],
    },
];

function StatusDot({ status }) {
    return (
        <span
            className={cn(
                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                status === "online" && "bg-green-500",
                status === "busy" && "bg-amber-500",
                status === "offline" && "bg-gray-300"
            )}
        />
    );
}

function Avatar({ src, alt, initials, className = "" }) {
    return (
        <div className={cn("overflow-hidden rounded-full bg-cyan-150", className)}>
            {src ? (
                <img src={src} alt={alt} className="h-full w-full object-cover" />
            ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-bold text-cyan-750">
                    {initials}
                </span>
            )}
        </div>
    );
}

export default function Squad() {
    const [expandedSquads, setExpandedSquads] = useState(["hackathon-crew"]);

    const toggleSquad = (id) => {
        setExpandedSquads((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const totalMembers = squads.reduce((acc, s) => acc + s.members.length, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
                <div className="flex items-center justify-between p-4 lg:p-6">
                    <div>
                        <h1 className="text-lg font-bold text-neutral-900 tracking-tight lg:text-xl">
                            My Squad
                        </h1>
                        <p className="mt-0.5 text-xs text-neutral-700 lg:text-sm">
                            {squads.length} squads, {totalMembers} members total
                        </p>
                    </div>
                    <button className="inline-flex items-center rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-650">
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        New Squad
                    </button>
                </div>
            </header>

            <div className="p-4 pb-24 lg:p-6 lg:pb-6">
                <div className="flex flex-col gap-3">
                    {squads.map((squad) => {
                        const isExpanded = expandedSquads.includes(squad.id);
                        const Icon = squad.icon;

                        return (
                            <div
                                key={squad.id}
                                className="
                                    relative overflow-hidden rounded-2xl 
                                    border border-gray-200 
                                    bg-white
                                    shadow-[0_6px_16px_rgba(0,0,0,0.06)]
                                    hover:shadow-[0_12px_28px_rgba(6,182,212,0.35)]
                                    hover:-translate-y-[1px]
                                    transition-all
                                "
                            >
                                {/* Squad Header */}
                                <button
                                    onClick={() => toggleSquad(squad.id)}
                                    className="flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                                >
                                    <div
                                        className={cn(
                                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                            squad.bgColor
                                        )}
                                    >
                                        <Icon className="h-4 w-4 text-white" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-sm font-bold text-neutral-900">
                                            {squad.name}
                                        </h2>
                                        <p className="text-xs text-neutral-700">
                                            {squad.members.length} members
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {squad.members.slice(0, 3).map((m) => (
                                                <Avatar
                                                    key={m.id}
                                                    src={m.avatar}
                                                    alt={m.name}
                                                    initials={m.initials}
                                                    className="h-6 w-6 border-2 border-white"
                                                />
                                            ))}
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-neutral-600" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-neutral-600" />
                                        )}
                                    </div>
                                </button>

                                {/* Members */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100">
                                        {squad.members.length === 0 && (
                                            <div className="flex flex-col items-center gap-3 px-4 py-8">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                                    <Users className="h-5 w-5 text-neutral-600" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-semibold text-neutral-900">
                                                        No members yet
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-neutral-700">
                                                        Start building this squad by scouting talent
                                                    </p>
                                                </div>
                                                <button className="inline-flex items-center rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700">
                                                    <Compass className="mr-1.5 h-3.5 w-3.5" />
                                                    Scout for members
                                                </button>
                                            </div>
                                        )}

                                        {squad.members.map((person, idx) => (
                                            <div
                                                key={person.id}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
                                                    idx !== squad.members.length - 1 && "border-b border-gray-100"
                                                )}
                                            >
                                                <div className="relative">
                                                    <Avatar
                                                        src={person.avatar}
                                                        alt={person.name}
                                                        initials={person.initials}
                                                        className="h-10 w-10"
                                                    />
                                                    <StatusDot status={person.status} />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="truncate text-sm font-semibold text-neutral-900">
                                                            {person.name}
                                                        </h3>
                                                        <span className="shrink-0 rounded-full border border-gray-300 px-2 py-0.5 text-[10px] font-medium text-neutral-800">
                                                            {person.connectedVia}
                                                        </span>
                                                    </div>
                                                    <p className="truncate text-xs text-neutral-700">
                                                        {person.role} · {person.college}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 transition hover:bg-gray-100 hover:text-neutral-900"
                                                        title="Message"
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 transition hover:bg-gray-100 hover:text-neutral-900"
                                                        title="Move"
                                                    >
                                                        <FolderOpen className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition hover:bg-red-50 hover:text-red-700"
                                                        title="Remove"
                                                    >
                                                        <UserMinus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}