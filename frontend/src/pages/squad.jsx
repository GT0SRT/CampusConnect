import { useEffect, useMemo, useState } from "react";
import {
    MessageCircle,
    UserMinus,
    FolderOpen,
    ChevronDown,
    ChevronRight,
    Plus,
    Users,
    Compass,
    MoreVertical,
} from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { useLocation, useNavigate } from "react-router-dom";
import {
    getConnectionRequests,
    getSquadState,
    respondConnectionRequest,
    saveSquadState,
    sendDirectMessage,
} from "../services/squadService";
import { Avatar, UnreadDot } from "../components/squad/SquadShared";
import {
    cn,
    DEFAULT_SQUAD_ID,
    DEFAULT_SQUAD_NAME,
    LEGACY_DEFAULT_SQUAD_ID,
    resolveSquadIcon,
    toUsername,
} from "../utils/squadUtils";

const initialSquads = [];

export default function Squad() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useUserStore((state) => state.theme);
    const user = useUserStore((state) => state.user);
    const isDark = theme === "dark";
    const [squadsData, setSquadsData] = useState(initialSquads);
    const [expandedSquads, setExpandedSquads] = useState([]);
    const [isCreateSquadModalOpen, setIsCreateSquadModalOpen] = useState(false);
    const [newSquadName, setNewSquadName] = useState("");
    const [chatTarget, setChatTarget] = useState(null);
    const [chatInput, setChatInput] = useState("");
    const [chatByMemberId, setChatByMemberId] = useState({});
    const [readMessageCountByMemberId, setReadMessageCountByMemberId] = useState({});
    const [connectionRequests, setConnectionRequests] = useState([]);
    const [sentConnectionRequests, setSentConnectionRequests] = useState([]);
    const [sentRequestsCount, setSentRequestsCount] = useState(0);
    const [isRequestsLoading, setIsRequestsLoading] = useState(false);
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
    const squadChatStorageKey = useMemo(() => `campusconnect:squad-chats:${storageUserKey}`, [storageUserKey]);
    const squadReadStorageKey = useMemo(() => `campusconnect:squad-read:${storageUserKey}`, [storageUserKey]);

    const normalizeSquads = (rawSquads) => {
        if (!Array.isArray(rawSquads)) {
            return initialSquads;
        }

        return rawSquads.map((squad) => ({
            id:
                String(squad?.id || `squad-${Date.now()}`) === LEGACY_DEFAULT_SQUAD_ID
                    ? DEFAULT_SQUAD_ID
                    : String(squad?.id || `squad-${Date.now()}`),
            name:
                String(squad?.id || "") === DEFAULT_SQUAD_ID || String(squad?.id || "") === LEGACY_DEFAULT_SQUAD_ID
                    ? DEFAULT_SQUAD_NAME
                    : String(squad?.name || "New Squad"),
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
                        username: String(member?.username || "").trim(),
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

    const normalizeChats = (rawChats) => {
        if (!rawChats || typeof rawChats !== "object" || Array.isArray(rawChats)) {
            return {};
        }

        const output = {};
        for (const [memberId, messages] of Object.entries(rawChats)) {
            if (!Array.isArray(messages)) {
                continue;
            }

            output[String(memberId)] = messages
                .map((msg) => {
                    if (!msg || typeof msg !== "object") {
                        return null;
                    }

                    const cleaned = String(msg.text || "").trim();
                    if (!cleaned) {
                        return null;
                    }

                    const senderId = String(msg.senderId || "").trim();
                    const receiverId = String(msg.receiverId || "").trim();
                    const createdAt = String(msg.createdAt || "").trim();
                    const rawSender = String(msg.sender || "").trim().toLowerCase();
                    const sender =
                        rawSender === "me" || rawSender === "them"
                            ? rawSender
                            : senderId && senderId === storageUserKey
                                ? "me"
                                : "them";

                    return {
                        id: String(msg.id || `${memberId}-${Date.now()}`),
                        text: cleaned,
                        sender,
                        senderId,
                        receiverId,
                        createdAt,
                        time: String(msg.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })),
                    };
                })
                .filter(Boolean);
        }

        return output;
    };

    useEffect(() => {
        let active = true;

        const loadState = async () => {
            let localSquads = [];
            let localChats = {};
            let localReadCounts = {};

            try {
                const rawSquads = localStorage.getItem(squadStorageKey);
                const parsedSquads = rawSquads ? JSON.parse(rawSquads) : [];
                localSquads = normalizeSquads(parsedSquads);
            } catch {
                localSquads = [];
            }

            try {
                const rawChats = localStorage.getItem(squadChatStorageKey);
                const parsedChats = rawChats ? JSON.parse(rawChats) : {};
                localChats = normalizeChats(parsedChats);
            } catch {
                localChats = {};
            }

            try {
                const rawReadCounts = localStorage.getItem(squadReadStorageKey);
                const parsedReadCounts = rawReadCounts ? JSON.parse(rawReadCounts) : {};
                localReadCounts = parsedReadCounts && typeof parsedReadCounts === "object" ? parsedReadCounts : {};
            } catch {
                localReadCounts = {};
            }

            if (!active) return;

            setSquadsData(localSquads);
            setChatByMemberId(localChats);
            setReadMessageCountByMemberId(() => {
                const initial = {};
                for (const [memberId, messages] of Object.entries(localChats)) {
                    const savedCount = Number(localReadCounts?.[memberId]);
                    const safeSavedCount = Number.isFinite(savedCount) && savedCount >= 0
                        ? savedCount
                        : Array.isArray(messages)
                            ? messages.length
                            : 0;
                    initial[memberId] = safeSavedCount;
                }
                return initial;
            });
            if (localSquads.length > 0) {
                setExpandedSquads((prev) => (prev.length > 0 ? prev : [localSquads[0].id]));
            }

            try {
                const remote = await getSquadState();
                if (!active) return;

                const remoteSquads = normalizeSquads(remote?.squads || []);
                const remoteChats = normalizeChats(remote?.chatsByMemberId || {});
                const hasRemoteData = remoteSquads.length > 0 || Object.keys(remoteChats).length > 0;

                if (hasRemoteData) {
                    setSquadsData(remoteSquads);
                    setChatByMemberId(remoteChats);
                    setReadMessageCountByMemberId((prev) => {
                        const next = {};
                        for (const [memberId, messages] of Object.entries(remoteChats)) {
                            const existingCount = Number(prev?.[memberId]);
                            next[memberId] = Number.isFinite(existingCount) && existingCount >= 0
                                ? existingCount
                                : Array.isArray(messages)
                                    ? messages.length
                                    : 0;
                        }
                        return next;
                    });
                    if (remoteSquads.length > 0) {
                        setExpandedSquads((prev) => (prev.length > 0 ? prev : [remoteSquads[0].id]));
                    }
                    return;
                }

                const hasLocalData = localSquads.length > 0 || Object.keys(localChats).length > 0;
                if (hasLocalData) {
                    await saveSquadState({
                        squads: localSquads,
                        chatsByMemberId: localChats,
                    });
                }
            } catch {
            }
        };

        loadState();

        return () => {
            active = false;
        };
    }, [squadStorageKey, squadChatStorageKey, squadReadStorageKey]);

    useEffect(() => {
        let active = true;

        const loadRequests = async () => {
            setIsRequestsLoading(true);
            try {
                const payload = await getConnectionRequests();
                if (!active) return;
                setConnectionRequests(Array.isArray(payload?.received) ? payload.received : []);
                setSentConnectionRequests(Array.isArray(payload?.sent) ? payload.sent : []);
                setSentRequestsCount(Array.isArray(payload?.sent) ? payload.sent.length : 0);
            } catch {
                if (!active) return;
                setConnectionRequests([]);
                setSentConnectionRequests([]);
                setSentRequestsCount(0);
            } finally {
                if (active) {
                    setIsRequestsLoading(false);
                }
            }
        };

        loadRequests();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const stateTarget = location?.state?.openChatTarget;
        if (!stateTarget || typeof stateTarget !== "object") {
            return;
        }

        const chatMember = {
            id: String(stateTarget.id || stateTarget.uid || "").trim(),
            username: String(stateTarget.username || "").trim(),
            name: String(stateTarget.name || stateTarget.fullName || "Campus User").trim(),
            avatar: String(stateTarget.avatar || stateTarget.profileImageUrl || "").trim(),
            initials: String(
                stateTarget.initials ||
                String(stateTarget.name || stateTarget.fullName || "CU")
                    .split(" ")
                    .map((part) => part[0] || "")
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
            ),
            role: String(stateTarget.role || "Student"),
            college: String(stateTarget.college || "Campus"),
            connectedVia: String(stateTarget.connectedVia || "Direct Message"),
            status: String(stateTarget.status || "online"),
        };

        if (!chatMember.id) {
            return;
        }

        setSquadsData((prev) => {
            const hasAnyMember = prev.some((squad) =>
                squad.members.some((member) => member.id === chatMember.id)
            );

            if (hasAnyMember) {
                return prev;
            }

            if (prev.length === 0) {
                return [
                    {
                        id: DEFAULT_SQUAD_ID,
                        name: DEFAULT_SQUAD_NAME,
                        color: "text-primary",
                        bgColor: "bg-cyan-500",
                        members: [chatMember],
                    },
                ];
            }

            return prev.map((squad, index) =>
                index === 0
                    ? {
                        ...squad,
                        members: [...squad.members, chatMember],
                    }
                    : squad
            );
        });

        setChatTarget(chatMember);
        navigate(location.pathname, { replace: true, state: {} });
    }, [location.pathname, location.state, navigate]);

    useEffect(() => {
        try {
            localStorage.setItem(squadStorageKey, JSON.stringify(squadsData));
        } catch {
        }
    }, [squadStorageKey, squadsData]);

    useEffect(() => {
        try {
            localStorage.setItem(squadChatStorageKey, JSON.stringify(chatByMemberId));
        } catch {
        }
    }, [squadChatStorageKey, chatByMemberId]);

    useEffect(() => {
        try {
            localStorage.setItem(squadReadStorageKey, JSON.stringify(readMessageCountByMemberId));
        } catch {
        }
    }, [squadReadStorageKey, readMessageCountByMemberId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            saveSquadState({
                squads: squadsData,
                chatsByMemberId: chatByMemberId,
            }).catch(() => {
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [squadsData, chatByMemberId]);

    useEffect(() => {
        if (!chatTarget?.id) {
            return;
        }

        setReadMessageCountByMemberId((prev) => {
            const latestCount = Array.isArray(chatByMemberId?.[chatTarget.id]) ? chatByMemberId[chatTarget.id].length : 0;
            const current = Number(prev?.[chatTarget.id]);
            if (Number.isFinite(current) && current === latestCount) {
                return prev;
            }

            return {
                ...prev,
                [chatTarget.id]: latestCount,
            };
        });
    }, [chatTarget?.id, chatByMemberId]);

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

    const unreadByMemberId = useMemo(() => {
        const output = {};

        for (const [memberId, messages] of Object.entries(chatByMemberId)) {
            const safeMessages = Array.isArray(messages) ? messages : [];
            const readCount = Number(readMessageCountByMemberId?.[memberId]);
            const safeReadCount = Number.isFinite(readCount) && readCount >= 0 ? readCount : safeMessages.length;
            const unseen = safeMessages.slice(safeReadCount);

            output[memberId] = unseen.some((message) => {
                const sender = String(message?.sender || "").toLowerCase();
                if (sender === "them") {
                    return true;
                }

                const senderId = String(message?.senderId || "").trim();
                return senderId && senderId !== storageUserKey;
            });
        }

        return output;
    }, [chatByMemberId, readMessageCountByMemberId, storageUserKey]);

    const openChat = (member) => {
        setChatTarget(member);
        setIsChatMenuOpen(false);
        setReadMessageCountByMemberId((prev) => {
            const currentCount = Array.isArray(chatByMemberId?.[member?.id]) ? chatByMemberId[member.id].length : 0;
            return {
                ...prev,
                [member.id]: currentCount,
            };
        });
    };

    const openMemberProfile = (member) => {
        const preferredUsername = String(member?.username || "").trim().toLowerCase();
        const fallbackUsername = toUsername(member?.name || "");
        const targetUsername = preferredUsername || fallbackUsername;

        if (!targetUsername) {
            return;
        }

        navigate(`/profile/${targetUsername}`);
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

    const sendChatMessage = async () => {
        if (!chatTarget) {
            return;
        }

        const message = String(chatInput || "").trim();
        if (!message) {
            return;
        }

        const optimisticMessage = {
            id: `${chatTarget.id}-${Date.now()}`,
            text: message,
            sender: "me",
            senderId: storageUserKey,
            receiverId: chatTarget.id,
            createdAt: new Date().toISOString(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setChatByMemberId((prev) => {
            const existing = prev[chatTarget.id] || [];
            return {
                ...prev,
                [chatTarget.id]: [...existing, optimisticMessage],
            };
        });

        setChatInput("");

        try {
            const sent = await sendDirectMessage(chatTarget.id, message);
            const savedMessage = sent?.chat;

            if (savedMessage) {
                setChatByMemberId((prev) => {
                    const existing = prev[chatTarget.id] || [];
                    const withoutOptimistic = existing.filter((item) => item.id !== optimisticMessage.id);
                    return {
                        ...prev,
                        [chatTarget.id]: [...withoutOptimistic, savedMessage],
                    };
                });
            }
        } catch {
            setChatByMemberId((prev) => {
                const existing = prev[chatTarget.id] || [];
                return {
                    ...prev,
                    [chatTarget.id]: existing.filter((item) => item.id !== optimisticMessage.id),
                };
            });
            window.alert("Failed to send message. Try again.");
        }
    };

    const respondRequest = async (requestId, action) => {
        try {
            await respondConnectionRequest(requestId, action);
            setConnectionRequests((prev) =>
                prev.map((request) =>
                    request.id === requestId
                        ? {
                            ...request,
                            status: action === "accept" ? "accepted" : "declined",
                            respondedAt: new Date().toISOString(),
                        }
                        : request
                )
            );

            const state = await getSquadState();
            setSquadsData(normalizeSquads(state?.squads || []));
            const refreshedChats = normalizeChats(state?.chatsByMemberId || {});
            setChatByMemberId(refreshedChats);
            setReadMessageCountByMemberId((prev) => {
                const next = {};
                for (const [memberId, messages] of Object.entries(refreshedChats)) {
                    const existingCount = Number(prev?.[memberId]);
                    next[memberId] = Number.isFinite(existingCount) && existingCount >= 0
                        ? existingCount
                        : Array.isArray(messages)
                            ? messages.length
                            : 0;
                }
                return next;
            });
        } catch {
            window.alert("Failed to update request.");
        }
    };

    const removeMember = (squadId, memberId, memberName) => {
        const confirmRemove = window.confirm(
            `Remove ${memberName} from this squad? This will also delete chat history with this member.`
        );
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

        setChatByMemberId((prev) => {
            const next = { ...prev };
            delete next[memberId];
            return next;
        });

        setReadMessageCountByMemberId((prev) => {
            const next = { ...prev };
            delete next[memberId];
            return next;
        });

        if (chatTarget?.id === memberId) {
            closeChat();
        }
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

            <section
                className={cn(
                    "rounded-2xl border p-4 backdrop-blur-xl",
                    isDark ? "border-slate-700/40 bg-slate-900/60" : "border-gray-200/50 bg-white/60"
                )}
            >
                <div className="flex items-center justify-between gap-2">
                    <h2 className={cn("text-sm font-semibold", isDark ? "text-slate-100" : "text-neutral-900")}>
                        Connection Requests
                    </h2>
                    <p className={cn("text-xs", isDark ? "text-slate-300" : "text-neutral-700")}>
                        {sentRequestsCount} sent
                    </p>
                </div>

                {isRequestsLoading ? (
                    <p className={cn("mt-3 text-xs", isDark ? "text-slate-400" : "text-neutral-600")}>Loading requests...</p>
                ) : null}

                {!isRequestsLoading && connectionRequests.filter((item) => item.status === "pending").length === 0 && sentConnectionRequests.filter((item) => item.status === "pending").length === 0 ? (
                    <p className={cn("mt-3 text-xs", isDark ? "text-slate-400" : "text-neutral-600")}>
                        No pending requests right now.
                    </p>
                ) : null}

                <div className="mt-3 space-y-2">
                    {sentConnectionRequests
                        .filter((item) => item.status === "pending")
                        .slice(0, 5)
                        .map((request) => {
                            const initials = String(request.toName || "CU")
                                .split(" ")
                                .map((part) => part[0] || "")
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();

                            return (
                                <div
                                    key={`sent-${request.id}`}
                                    className={cn(
                                        "rounded-xl border px-3 py-2",
                                        isDark ? "border-slate-700 bg-slate-800/50" : "border-gray-200 bg-white"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            src={request.toAvatar}
                                            alt={request.toName || "Recipient"}
                                            initials={initials}
                                            className="h-9 w-9"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className={cn("truncate text-sm font-semibold", isDark ? "text-slate-100" : "text-neutral-900")}>
                                                To: {request.toName || "Campus User"}
                                            </p>
                                            <p className={cn("truncate text-xs", isDark ? "text-slate-300" : "text-neutral-700")}>
                                                {request.text}
                                            </p>
                                        </div>

                                        <span
                                            className={cn(
                                                "rounded-md px-2 py-1 text-[10px] font-semibold",
                                                isDark ? "border border-slate-600 text-slate-300" : "border border-gray-300 text-neutral-700"
                                            )}
                                        >
                                            Sent
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                    {connectionRequests
                        .filter((item) => item.status === "pending")
                        .slice(0, 5)
                        .map((request) => {
                            const initials = String(request.fromName || "CU")
                                .split(" ")
                                .map((part) => part[0] || "")
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();

                            return (
                                <div
                                    key={request.id}
                                    className={cn(
                                        "rounded-xl border px-3 py-2",
                                        isDark ? "border-slate-700 bg-slate-800/50" : "border-gray-200 bg-white"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            src={request.fromAvatar}
                                            alt={request.fromName}
                                            initials={initials}
                                            className="h-9 w-9"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className={cn("truncate text-sm font-semibold", isDark ? "text-slate-100" : "text-neutral-900")}>
                                                {request.fromName}
                                            </p>
                                            <p className={cn("truncate text-xs", isDark ? "text-slate-300" : "text-neutral-700")}>
                                                {request.text}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => respondRequest(request.id, "accept")}
                                                className={cn(
                                                    "rounded-md px-2.5 py-1 text-xs font-semibold",
                                                    isDark
                                                        ? "border border-cyan-500/30 bg-cyan-500/20 text-cyan-300"
                                                        : "bg-cyan-600 text-white"
                                                )}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => respondRequest(request.id, "decline")}
                                                className={cn(
                                                    "rounded-md px-2.5 py-1 text-xs font-semibold",
                                                    isDark
                                                        ? "border border-slate-600 text-slate-300"
                                                        : "border border-gray-300 text-neutral-700"
                                                )}
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </section>

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
                                                <button
                                                    type="button"
                                                    onClick={() => openMemberProfile(person)}
                                                    className="relative"
                                                    title={`Open ${person.name} profile`}
                                                >
                                                    <Avatar
                                                        src={person.avatar}
                                                        alt={person.name}
                                                        initials={person.initials}
                                                        className="h-10 w-10"
                                                    />
                                                    <UnreadDot isVisible={Boolean(unreadByMemberId?.[person.id])} />
                                                </button>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openMemberProfile(person)}
                                                            className={cn(
                                                                "truncate text-left text-sm font-semibold underline-offset-2 hover:underline",
                                                                isDark ? "text-slate-100" : "text-neutral-900"
                                                            )}
                                                        >
                                                            {person.name}
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => openMemberProfile(person)}
                                                        className={cn(
                                                            "mt-1 text-xs font-medium underline-offset-2 hover:underline",
                                                            isDark ? "text-cyan-300" : "text-cyan-700"
                                                        )}
                                                    >
                                                        @{person.username || toUsername(person.name)}
                                                    </button>
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
                                                        title="Remove member and delete chat history"
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
                                    <button
                                        type="button"
                                        onClick={() => openMemberProfile(chatTarget)}
                                        className={cn("text-sm font-semibold leading-tight underline-offset-2 hover:underline", isDark ? "text-slate-100" : "text-neutral-900")}
                                    >
                                        {chatTarget.name}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openMemberProfile(chatTarget)}
                                        className={cn("block text-left text-xs underline-offset-2 hover:underline", isDark ? "text-slate-400" : "text-neutral-500")}
                                    >
                                        @{chatTarget.username || toUsername(chatTarget.name)}
                                    </button>
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
                                (chatByMemberId[chatTarget.id] || []).map((msg) => {
                                    const isMine =
                                        String(msg.sender || "").toLowerCase() === "me" ||
                                        (msg.senderId && String(msg.senderId) === storageUserKey);

                                    return (
                                        <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                                            <div
                                                className={cn(
                                                    "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                                                    isMine
                                                        ? isDark
                                                            ? "bg-cyan-500/20 text-cyan-200"
                                                            : "bg-cyan-100 text-cyan-800"
                                                        : isDark
                                                            ? "bg-slate-800 text-slate-100"
                                                            : "bg-gray-100 text-neutral-800"
                                                )}
                                            >
                                                <p>{msg.text}</p>
                                                <p
                                                    className={cn(
                                                        "mt-1 text-[10px]",
                                                        isMine
                                                            ? isDark
                                                                ? "text-cyan-300"
                                                                : "text-cyan-700"
                                                            : isDark
                                                                ? "text-slate-400"
                                                                : "text-neutral-500"
                                                    )}
                                                >
                                                    {msg.time}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
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