import { useEffect, useMemo, useState } from "react";
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
    MoreVertical,
} from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { useNavigate } from "react-router-dom";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const initialSquads = [
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

function toUsername(name = "") {
    return String(name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9._]/g, "") || "campususer";
}

function resolveSquadIcon(squad) {
    const normalizedId = String(squad?.id || "").toLowerCase();
    const normalizedName = String(squad?.name || "").toLowerCase();

    if (normalizedId === "hackathon-crew" || normalizedId === "mentors") {
        return Star;
    }

    if (normalizedId === "startup-founders") {
        return Users;
    }

    if (normalizedName.includes("hackathon") || normalizedName.includes("mentor")) {
        return Star;
    }

    if (normalizedName.includes("founder") || normalizedName.includes("startup")) {
        return Users;
    }

    return FolderOpen;
}

export default function Squad() {
    const navigate = useNavigate();
    const theme = useUserStore((state) => state.theme);
    const user = useUserStore((state) => state.user);
    const isDark = theme === "dark";
    const [squadsData, setSquadsData] = useState(initialSquads);
    const [expandedSquads, setExpandedSquads] = useState(["hackathon-crew"]);
    const [isCreateSquadModalOpen, setIsCreateSquadModalOpen] = useState(false);
    const [newSquadName, setNewSquadName] = useState("");
    const [chatTarget, setChatTarget] = useState(null);
    const [chatInput, setChatInput] = useState("");
    const [chatByMemberId, setChatByMemberId] = useState({});
    const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
    const [moveState, setMoveState] = useState({
        isOpen: false,
        fromSquadId: "",
        memberId: "",
        memberName: "",
        targetSquadId: "",
    });
    const storageUserKey = user?.uid || user?.id || "demo-user";
    const squadStorageKey = useMemo(() => `campusconnect:squads:${storageUserKey}`, [storageUserKey]);

    const normalizeSquads = (rawSquads) => {
        if (!Array.isArray(rawSquads)) {
            return initialSquads;
        }

        return rawSquads.map((squad) => ({
            id: String(squad?.id || `squad-${Date.now()}`),
            name: String(squad?.name || "New Squad"),
            color: squad?.color || "text-primary",
            bgColor: squad?.bgColor || "bg-cyan-500",
            members: Array.isArray(squad?.members)
                ? squad.members.map((member) => {
                    const memberName = String(member?.name || "Campus User");
                    const initials = memberName
                        .split(" ")
                        .map((part) => part[0] || "")
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                    return {
                        id: String(member?.id || member?.uid || `member-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
                        name: memberName,
                        avatar: member?.avatar || member?.profile_pic || "",
                        initials: member?.initials || initials,
                        role: member?.role || member?.branch || "Student",
                        college: member?.college || member?.campus || "Campus",
                        connectedVia: member?.connectedVia || "Matchmaker Connect",
                        status: member?.status || "online",
                    };
                })
                : [],
        }));
    };

    useEffect(() => {
        try {
            const raw = localStorage.getItem(squadStorageKey);
            if (!raw) {
                return;
            }

            const parsed = JSON.parse(raw);
            const normalized = normalizeSquads(parsed);
            setSquadsData(normalized);
            if (normalized.length > 0) {
                setExpandedSquads((prev) => {
                    const current = Array.isArray(prev) ? prev : [];
                    if (current.length > 0) return current;
                    return [normalized[0].id];
                });
            }
        } catch {
        }
    }, [squadStorageKey]);

    useEffect(() => {
        try {
            localStorage.setItem(squadStorageKey, JSON.stringify(squadsData));
        } catch {
        }
    }, [squadStorageKey, squadsData]);

    const toggleSquad = (id) => {
        setExpandedSquads((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const createSquad = () => {
        const squadName = String(newSquadName || "").trim();

        if (!squadName) {
            return;
        }

        const squadId = `${squadName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "squad"}-${Date.now()}`;

        const newSquad = {
            id: squadId,
            name: squadName,
            icon: FolderOpen,
            color: "text-primary",
            bgColor: "bg-cyan-500",
            members: [],
        };

        setSquadsData((prev) => [newSquad, ...prev]);
        setExpandedSquads((prev) => [...prev, squadId]);
        setNewSquadName("");
        setIsCreateSquadModalOpen(false);
    };

    const openChat = (member) => {
        setChatTarget(member);
        setIsChatMenuOpen(false);
    };

    const closeChat = () => {
        setChatTarget(null);
        setChatInput("");
        setIsChatMenuOpen(false);
    };

    const handleChatMenuAction = (action) => {
        if (!chatTarget) {
            return;
        }

        window.alert(`${action} ${chatTarget.name}`);
        setIsChatMenuOpen(false);
    };

    const sendChatMessage = () => {
        if (!chatTarget) {
            return;
        }

        const message = String(chatInput || "").trim();
        if (!message) {
            return;
        }

        setChatByMemberId((prev) => {
            const existing = prev[chatTarget.id] || [];
            return {
                ...prev,
                [chatTarget.id]: [
                    ...existing,
                    {
                        id: `${chatTarget.id}-${Date.now()}`,
                        text: message,
                        sender: "me",
                        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    },
                ],
            };
        });

        setChatInput("");
    };

    const removeMember = (squadId, memberId, memberName) => {
        const confirmRemove = window.confirm(`Remove ${memberName} from this squad?`);
        if (!confirmRemove) {
            return;
        }

        setSquadsData((prev) =>
            prev.map((squad) =>
                squad.id === squadId
                    ? { ...squad, members: squad.members.filter((member) => member.id !== memberId) }
                    : squad
            )
        );
    };

    const openMoveModal = (fromSquadId, memberId, memberName) => {
        const availableTargets = squadsData.filter((squad) => squad.id !== fromSquadId);

        if (availableTargets.length === 0) {
            window.alert("Create another squad first to move members.");
            return;
        }

        setMoveState({
            isOpen: true,
            fromSquadId,
            memberId,
            memberName,
            targetSquadId: availableTargets[0]?.id || "",
        });
    };

    const closeMoveModal = () => {
        setMoveState({
            isOpen: false,
            fromSquadId: "",
            memberId: "",
            memberName: "",
            targetSquadId: "",
        });
    };

    const confirmMoveMember = () => {
        const { fromSquadId, memberId, targetSquadId } = moveState;

        if (!fromSquadId || !memberId || !targetSquadId) {
            return;
        }

        const targetSquad = squadsData.find((squad) => squad.id === targetSquadId);
        if (!targetSquad || targetSquad.id === fromSquadId) {
            return;
        }

        setSquadsData((prev) => {
            const fromSquad = prev.find((squad) => squad.id === fromSquadId);
            const memberToMove = fromSquad?.members.find((member) => member.id === memberId);

            if (!memberToMove) {
                return prev;
            }

            return prev.map((squad) => {
                if (squad.id === fromSquadId) {
                    return {
                        ...squad,
                        members: squad.members.filter((member) => member.id !== memberId),
                    };
                }

                if (squad.id === targetSquad.id) {
                    return {
                        ...squad,
                        members: [...squad.members, memberToMove],
                    };
                }

                return squad;
            });
        });

        setExpandedSquads((prev) =>
            prev.includes(targetSquad.id) ? prev : [...prev, targetSquad.id]
        );

        closeMoveModal();
    };

    const totalMembers = squadsData.reduce((acc, squad) => acc + squad.members.length, 0);

    return (
        <div className="space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-40 transition-colors bg-transparent">
            <header
                className={cn(
                    "rounded-2xl border backdrop-blur-xl",
                    isDark
                        ? "border-slate-700/40 bg-slate-900/50"
                        : "border-gray-200/50 bg-white/60"
                )}
            >
                <div className="flex items-center justify-between p-4 lg:p-5">
                    <div>
                        <h1 className={cn("text-lg font-bold tracking-tight lg:text-xl", isDark ? "text-slate-100" : "text-neutral-900")}>
                            My Squad
                        </h1>
                        <p className={cn("mt-0.5 text-xs lg:text-sm", isDark ? "text-slate-300" : "text-neutral-700")}>
                            {squadsData.length} squads, {totalMembers} members total
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateSquadModalOpen(true)}
                        className={cn(
                            "inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold transition",
                            isDark
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30"
                                : "bg-cyan-500 text-white hover:bg-cyan-600"
                        )}
                    >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        New Squad
                    </button>
                </div>
            </header>

            <div className="space-y-4">
                <div className="flex flex-col gap-4">
                    {squadsData.map((squad) => {
                        const isExpanded = expandedSquads.includes(squad.id);
                        const Icon = resolveSquadIcon(squad);

                        return (
                            <div
                                key={squad.id}
                                className={cn(
                                    "relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all",
                                    isDark
                                        ? "border-slate-700/40 bg-slate-900/60 shadow-[0_6px_16px_rgba(2,6,23,0.45)]"
                                        : "border-gray-200/50 bg-white/60 shadow-[0_6px_16px_rgba(0,0,0,0.06)]",
                                    "hover:shadow-[0_12px_28px_rgba(6,182,212,0.35)] hover:-translate-y-px"
                                )}
                            >
                                {/* Squad Header */}
                                <button
                                    onClick={() => toggleSquad(squad.id)}
                                    className={cn(
                                        "flex w-full items-center gap-3 p-4 text-left transition-colors",
                                        isDark ? "hover:bg-slate-800/50" : "hover:bg-gray-50/70"
                                    )}
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
                                        <h2 className={cn("text-sm font-bold", isDark ? "text-slate-100" : "text-neutral-900")}>
                                            {squad.name}
                                        </h2>
                                        <p className={cn("text-xs", isDark ? "text-slate-300" : "text-neutral-700")}>
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
                                            <ChevronDown className={cn("h-4 w-4", isDark ? "text-slate-400" : "text-neutral-600")} />
                                        ) : (
                                            <ChevronRight className={cn("h-4 w-4", isDark ? "text-slate-400" : "text-neutral-600")} />
                                        )}
                                    </div>
                                </button>

                                {/* Members */}
                                {isExpanded && (
                                    <div className={cn("border-t", isDark ? "border-slate-700/50" : "border-gray-100")}>
                                        {squad.members.length === 0 && (
                                            <div className="flex flex-col items-center gap-3 px-4 py-8">
                                                <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", isDark ? "bg-slate-800" : "bg-gray-100")}>
                                                    <Users className={cn("h-5 w-5", isDark ? "text-slate-300" : "text-neutral-600")} />
                                                </div>
                                                <div className="text-center">
                                                    <p className={cn("text-sm font-semibold", isDark ? "text-slate-100" : "text-neutral-900")}>
                                                        No members yet
                                                    </p>
                                                    <p className={cn("mt-0.5 text-xs", isDark ? "text-slate-300" : "text-neutral-700")}>
                                                        Start building this squad by scouting talent
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => navigate("/matchmaker?source=squad")}
                                                    className={cn(
                                                        "inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold transition",
                                                        isDark
                                                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30"
                                                            : "bg-cyan-600 text-white hover:bg-cyan-700"
                                                    )}
                                                >
                                                    <Compass className="mr-1.5 h-3.5 w-3.5" />
                                                    Scout for members
                                                </button>
                                            </div>
                                        )}

                                        {squad.members.map((person, idx) => (
                                            <div
                                                key={person.id}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 transition-colors",
                                                    isDark ? "hover:bg-slate-800/50" : "hover:bg-gray-50/70",
                                                    idx !== squad.members.length - 1 && (isDark ? "border-b border-slate-700/50" : "border-b border-gray-100")
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
                                                        <h3 className={cn("truncate text-sm font-semibold", isDark ? "text-slate-100" : "text-neutral-900")}>
                                                            {person.name}
                                                        </h3>
                                                        <span
                                                            className={cn(
                                                                "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                                                                isDark
                                                                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                                                                    : "border-gray-300 text-neutral-800"
                                                            )}
                                                        >
                                                            {person.connectedVia}
                                                        </span>
                                                    </div>
                                                    <p className={cn("truncate text-xs", isDark ? "text-slate-300" : "text-neutral-700")}>
                                                        {person.role} · {person.college}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => openChat(person)}
                                                        className={cn(
                                                            "inline-flex h-8 w-8 items-center justify-center rounded-md transition",
                                                            isDark
                                                                ? "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                                                                : "text-neutral-600 hover:bg-gray-100 hover:text-neutral-900"
                                                        )}
                                                        title="Message"
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => openMoveModal(squad.id, person.id, person.name)}
                                                        className={cn(
                                                            "inline-flex h-8 w-8 items-center justify-center rounded-md transition",
                                                            isDark
                                                                ? "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                                                                : "text-neutral-600 hover:bg-gray-100 hover:text-neutral-900"
                                                        )}
                                                        title="Move"
                                                    >
                                                        <FolderOpen className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => removeMember(squad.id, person.id, person.name)}
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

            {isCreateSquadModalOpen ? (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
                    <div
                        className={cn(
                            "w-full max-w-md rounded-2xl border p-5 backdrop-blur-xl",
                            isDark ? "border-slate-700 bg-slate-900/95" : "border-gray-200 bg-white/95"
                        )}
                    >
                        <h2 className={cn("text-lg font-bold", isDark ? "text-slate-100" : "text-neutral-900")}>
                            Create Squad Folder
                        </h2>
                        <p className={cn("mt-1 text-sm", isDark ? "text-slate-300" : "text-neutral-600")}>
                            Create a new folder to organize members.
                        </p>

                        <div className="mt-4">
                            <label className={cn("mb-1 block text-xs font-medium", isDark ? "text-slate-300" : "text-neutral-700")}>
                                Folder name
                            </label>
                            <input
                                value={newSquadName}
                                onChange={(event) => setNewSquadName(event.target.value)}
                                placeholder="e.g. Hackathon Team"
                                className={cn(
                                    "w-full rounded-xl border px-3 py-2 text-sm outline-none",
                                    isDark
                                        ? "border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400"
                                        : "border-gray-300 bg-white text-neutral-900 placeholder:text-gray-400"
                                )}
                            />
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsCreateSquadModalOpen(false);
                                    setNewSquadName("");
                                }}
                                className={cn(
                                    "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                                    isDark
                                        ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                                        : "border-gray-300 text-neutral-700 hover:bg-gray-100"
                                )}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createSquad}
                                className={cn(
                                    "rounded-lg px-3 py-2 text-sm font-semibold transition",
                                    isDark
                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30"
                                        : "bg-cyan-600 text-white hover:bg-cyan-700"
                                )}
                            >
                                Create Folder
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {chatTarget ? (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
                    <div
                        className={cn(
                            "w-full max-w-lg rounded-2xl border backdrop-blur-xl",
                            isDark ? "border-slate-700 bg-slate-900/95" : "border-gray-200 bg-white/95"
                        )}
                    >
                        <div className={cn("flex items-center justify-between border-b px-4 py-3", isDark ? "border-slate-700" : "border-gray-200")}>
                            <div className="flex items-center gap-3">
                                <Avatar
                                    src={chatTarget.avatar}
                                    alt={chatTarget.name}
                                    initials={chatTarget.initials}
                                    className="h-10 w-10"
                                />
                                <div>
                                    <h3 className={cn("text-sm font-semibold leading-tight", isDark ? "text-slate-100" : "text-neutral-900")}>
                                        {chatTarget.name}
                                    </h3>
                                    <p className={cn("text-xs", isDark ? "text-slate-400" : "text-neutral-500")}>
                                        @{toUsername(chatTarget.name)}
                                    </p>
                                </div>
                            </div>

                            <div className="relative flex items-center gap-2">
                                <button
                                    onClick={() => setIsChatMenuOpen((prev) => !prev)}
                                    className={cn(
                                        "inline-flex h-8 w-8 items-center justify-center rounded-md transition",
                                        isDark ? "text-slate-300 hover:bg-slate-800" : "text-neutral-700 hover:bg-gray-100"
                                    )}
                                    title="More"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </button>

                                {isChatMenuOpen ? (
                                    <div
                                        className={cn(
                                            "absolute right-10 top-0 z-10 w-32 overflow-hidden rounded-xl border text-sm shadow-lg",
                                            isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"
                                        )}
                                    >
                                        <button
                                            onClick={() => handleChatMenuAction("Block")}
                                            className={cn(
                                                "block w-full px-3 py-2 text-left transition",
                                                isDark ? "text-slate-200 hover:bg-slate-800" : "text-neutral-700 hover:bg-gray-50"
                                            )}
                                        >
                                            Block
                                        </button>
                                        <button
                                            onClick={() => handleChatMenuAction("Report")}
                                            className={cn(
                                                "block w-full px-3 py-2 text-left transition",
                                                isDark ? "text-red-300 hover:bg-slate-800" : "text-red-600 hover:bg-gray-50"
                                            )}
                                        >
                                            Report
                                        </button>
                                    </div>
                                ) : null}

                                <button
                                    onClick={closeChat}
                                    className={cn(
                                        "rounded-md px-2 py-1 text-xs font-medium transition",
                                        isDark ? "text-slate-300 hover:bg-slate-800" : "text-neutral-700 hover:bg-gray-100"
                                    )}
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="min-h-72 max-h-80 space-y-2 overflow-y-auto p-4">
                            {(chatByMemberId[chatTarget.id] || []).length === 0 ? (
                                <div className="flex min-h-64 items-center justify-center">
                                    <p className={cn("text-sm", isDark ? "text-slate-400" : "text-neutral-500")}>
                                        No chats yet. Start the conversation.
                                    </p>
                                </div>
                            ) : (
                                (chatByMemberId[chatTarget.id] || []).map((msg) => (
                                    <div key={msg.id} className="flex justify-end">
                                        <div
                                            className={cn(
                                                "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                                                isDark ? "bg-cyan-500/20 text-cyan-200" : "bg-cyan-100 text-cyan-800"
                                            )}
                                        >
                                            <p>{msg.text}</p>
                                            <p className={cn("mt-1 text-[10px]", isDark ? "text-cyan-300" : "text-cyan-700")}>{msg.time}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className={cn("flex items-center gap-2 border-t p-3", isDark ? "border-slate-700" : "border-gray-200")}>
                            <input
                                value={chatInput}
                                onChange={(event) => setChatInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        sendChatMessage();
                                    }
                                }}
                                placeholder="Type your message..."
                                className={cn(
                                    "w-full rounded-xl border px-3 py-2 text-sm outline-none",
                                    isDark
                                        ? "border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400"
                                        : "border-gray-300 bg-white text-neutral-900 placeholder:text-gray-400"
                                )}
                            />
                            <button
                                onClick={sendChatMessage}
                                className={cn(
                                    "rounded-xl px-3 py-2 text-sm font-semibold transition",
                                    isDark
                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30"
                                        : "bg-cyan-600 text-white hover:bg-cyan-700"
                                )}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {moveState.isOpen ? (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
                    <div
                        className={cn(
                            "w-full max-w-md rounded-2xl border p-5 backdrop-blur-xl",
                            isDark ? "border-slate-700 bg-slate-900/95" : "border-gray-200 bg-white/95"
                        )}
                    >
                        <h2 className={cn("text-lg font-bold", isDark ? "text-slate-100" : "text-neutral-900")}>
                            Move Member
                        </h2>
                        <p className={cn("mt-1 text-sm", isDark ? "text-slate-300" : "text-neutral-600")}>
                            Move <span className="font-semibold">{moveState.memberName}</span> to another squad.
                        </p>

                        <div className="mt-4">
                            <label className={cn("mb-1 block text-xs font-medium", isDark ? "text-slate-300" : "text-neutral-700")}>
                                Select destination folder
                            </label>
                            <select
                                value={moveState.targetSquadId}
                                onChange={(event) =>
                                    setMoveState((prev) => ({ ...prev, targetSquadId: event.target.value }))
                                }
                                className={cn(
                                    "w-full rounded-xl border px-3 py-2 text-sm outline-none",
                                    isDark
                                        ? "border-slate-700 bg-slate-800 text-slate-100"
                                        : "border-gray-300 bg-white text-neutral-900"
                                )}
                            >
                                {squadsData
                                    .filter((squad) => squad.id !== moveState.fromSquadId)
                                    .map((squad) => (
                                        <option key={squad.id} value={squad.id}>
                                            {squad.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={closeMoveModal}
                                className={cn(
                                    "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                                    isDark
                                        ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                                        : "border-gray-300 text-neutral-700 hover:bg-gray-100"
                                )}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmMoveMember}
                                className={cn(
                                    "rounded-lg px-3 py-2 text-sm font-semibold transition",
                                    isDark
                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30"
                                        : "bg-cyan-600 text-white hover:bg-cyan-700"
                                )}
                            >
                                Move
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}