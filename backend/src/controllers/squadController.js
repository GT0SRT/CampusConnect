const prisma = require("../lib/prisma");

const toTrimmed = (value) => String(value || "").trim();

const normalizeStatus = (value) => {
    const status = String(value || "online").toLowerCase();
    if (["online", "busy", "offline"].includes(status)) {
        return status;
    }
    return "online";
};

const normalizeMember = (member) => {
    if (!member || typeof member !== "object") {
        return null;
    }

    const name = toTrimmed(member.name || "Campus User");
    const id = toTrimmed(member.id || member.uid || `member-${Date.now()}`);

    return {
        id,
        uid: toTrimmed(member.uid || id),
        username: toTrimmed(member.username),
        name,
        avatar: String(member.avatar || member.profile_pic || "").trim(),
        initials: toTrimmed(member.initials || name.split(" ").map((part) => part[0] || "").join("").slice(0, 2).toUpperCase()),
        role: toTrimmed(member.role || member.branch || "Student"),
        college: toTrimmed(member.college || member.campus || "Campus"),
        connectedVia: toTrimmed(member.connectedVia || "Matchmaker Connect"),
        status: normalizeStatus(member.status),
    };
};

const normalizeSquads = (squads) => {
    if (!Array.isArray(squads)) {
        return [];
    }

    return squads
        .map((squad) => {
            if (!squad || typeof squad !== "object") {
                return null;
            }

            const rawId = toTrimmed(squad.id || `squad-${Date.now()}`);
            const id = rawId === LEGACY_DEFAULT_SQUAD_ID ? DEFAULT_SQUAD_ID : rawId;
            const rawName = toTrimmed(squad.name || "New Squad");
            const name = id === DEFAULT_SQUAD_ID ? DEFAULT_SQUAD_NAME : rawName;

            return {
                id,
                name,
                color: String(squad.color || "text-primary").trim(),
                bgColor: String(squad.bgColor || "bg-cyan-500").trim(),
                members: Array.isArray(squad.members)
                    ? squad.members.map(normalizeMember).filter(Boolean)
                    : [],
            };
        })
        .filter(Boolean);
};

const normalizeChats = (chatsByMemberId) => {
    if (!chatsByMemberId || typeof chatsByMemberId !== "object" || Array.isArray(chatsByMemberId)) {
        return {};
    }

    const output = {};

    for (const [memberId, messages] of Object.entries(chatsByMemberId)) {
        const key = String(memberId || "").trim();
        if (!key || !Array.isArray(messages)) {
            continue;
        }

        const cleaned = messages
            .map((msg) => {
                if (!msg || typeof msg !== "object") {
                    return null;
                }

                const text = toTrimmed(msg.text);
                if (!text) {
                    return null;
                }

                return {
                    id: String(msg.id || `${key}-${Date.now()}`),
                    text,
                    sender: String(msg.sender || "me").trim(),
                    senderId: String(msg.senderId || "").trim(),
                    receiverId: String(msg.receiverId || "").trim(),
                    createdAt: String(msg.createdAt || new Date().toISOString()),
                    time: String(msg.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })),
                };
            })
            .filter(Boolean);

        output[key] = cleaned;
    }

    return output;
};

const REQUESTS_RECEIVED_KEY = "__requestsReceived";
const REQUESTS_SENT_KEY = "__requestsSent";
const DEFAULT_SQUAD_ID = "general";
const LEGACY_DEFAULT_SQUAD_ID = "core-circle";
const DEFAULT_SQUAD_NAME = "General";

const toIsoDate = (value) => {
    const date = new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) {
        return new Date().toISOString();
    }
    return date.toISOString();
};

const toMessageTime = (isoDate) =>
    new Date(isoDate).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

const normalizeRequest = (request) => {
    if (!request || typeof request !== "object") {
        return null;
    }

    const id = toTrimmed(request.id || `request-${Date.now()}`);
    const fromUserId = toTrimmed(request.fromUserId);
    const toUserId = toTrimmed(request.toUserId);
    if (!id || !fromUserId || !toUserId) {
        return null;
    }

    const statusRaw = toTrimmed(request.status || "pending").toLowerCase();
    const status = ["pending", "accepted", "declined"].includes(statusRaw)
        ? statusRaw
        : "pending";

    return {
        id,
        fromUserId,
        toUserId,
        fromUsername: toTrimmed(request.fromUsername),
        fromName: toTrimmed(request.fromName || "Campus User"),
        fromAvatar: String(request.fromAvatar || "").trim(),
        toUsername: toTrimmed(request.toUsername),
        toName: toTrimmed(request.toName || "Campus User"),
        toAvatar: String(request.toAvatar || "").trim(),
        text: toTrimmed(request.text || "Let's connect on CampusConnect!"),
        status,
        createdAt: toIsoDate(request.createdAt),
        respondedAt: request.respondedAt ? toIsoDate(request.respondedAt) : null,
    };
};

const normalizeRequests = (value) => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map(normalizeRequest).filter(Boolean);
};

const ensureCoreSquad = (squads) => {
    const cleaned = normalizeSquads(squads || []);
    const existing = cleaned.find((squad) => squad.id === DEFAULT_SQUAD_ID);
    if (existing) {
        return cleaned;
    }

    return [
        {
            id: DEFAULT_SQUAD_ID,
            name: DEFAULT_SQUAD_NAME,
            color: "text-primary",
            bgColor: "bg-cyan-500",
            members: [],
        },
        ...cleaned,
    ];
};

const ensureMemberInSquad = (squads, member, preferredSquadId) => {
    const allSquads = ensureCoreSquad(squads);

    const hasMember = allSquads.some((squad) =>
        squad.members.some((existing) => existing.id === member.id || existing.uid === member.uid)
    );

    if (hasMember) {
        return allSquads;
    }

    const targetId = toTrimmed(preferredSquadId) || DEFAULT_SQUAD_ID;
    const targetSquadIndex = allSquads.findIndex((squad) => squad.id === targetId);
    const safeIndex = targetSquadIndex >= 0 ? targetSquadIndex : 0;

    const next = [...allSquads];
    next[safeIndex] = {
        ...next[safeIndex],
        members: [...next[safeIndex].members, normalizeMember(member)],
    };

    return next;
};

const getRawChats = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }
    return value;
};

const appendChatMessage = (rawChats, memberId, message) => {
    const normalizedMemberId = toTrimmed(memberId);
    if (!normalizedMemberId) {
        return rawChats;
    }

    const next = { ...rawChats };
    const existing = Array.isArray(next[normalizedMemberId]) ? next[normalizedMemberId] : [];
    next[normalizedMemberId] = [...existing, message];
    return next;
};

const buildMemberFromUser = (user, connectedVia = "Connection") => {
    const fullName = toTrimmed(user?.fullName || user?.username || "Campus User");
    const initials = fullName
        .split(" ")
        .map((part) => part[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return {
        id: toTrimmed(user?.id),
        uid: toTrimmed(user?.id),
        username: toTrimmed(user?.username),
        name: fullName,
        avatar: String(user?.profileImageUrl || "").trim(),
        initials,
        role: "Student",
        college: "Campus",
        connectedVia,
        status: "online",
    };
};

const getRequestState = (rawChats) => ({
    received: normalizeRequests(rawChats?.[REQUESTS_RECEIVED_KEY] || []),
    sent: normalizeRequests(rawChats?.[REQUESTS_SENT_KEY] || []),
});

const setRequestState = (rawChats, nextState) => {
    const next = { ...rawChats };
    next[REQUESTS_RECEIVED_KEY] = normalizeRequests(nextState.received || []);
    next[REQUESTS_SENT_KEY] = normalizeRequests(nextState.sent || []);
    return next;
};

exports.getSquadState = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                squadFolders: true,
                squadChats: true,
            },
        });

        return res.json({
            squads: normalizeSquads(user?.squadFolders || []),
            chatsByMemberId: normalizeChats(user?.squadChats || {}),
            requests: getRequestState(user?.squadChats || {}),
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.saveSquadState = async (req, res) => {
    try {
        const squads = normalizeSquads(req.body?.squads || []);
        const chatsByMemberId = normalizeChats(req.body?.chatsByMemberId || {});

        const existing = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { squadChats: true },
        });

        const requestState = getRequestState(existing?.squadChats || {});
        const mergedChats = {
            ...chatsByMemberId,
            [REQUESTS_RECEIVED_KEY]: requestState.received,
            [REQUESTS_SENT_KEY]: requestState.sent,
        };

        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                squadFolders: squads,
                squadChats: mergedChats,
            },
            select: {
                squadFolders: true,
                squadChats: true,
            },
        });

        return res.json({
            squads: normalizeSquads(updated.squadFolders || []),
            chatsByMemberId: normalizeChats(updated.squadChats || {}),
            requests: getRequestState(updated.squadChats || {}),
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getConnectionRequests = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { squadChats: true },
        });

        return res.json(getRequestState(user?.squadChats || {}));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.sendConnectionRequest = async (req, res) => {
    try {
        const targetUserId = toTrimmed(req.body?.targetUserId);
        const preferredSquadId = toTrimmed(req.body?.squadId);
        const customText = toTrimmed(req.body?.text);

        if (!targetUserId) {
            return res.status(400).json({ error: "targetUserId is required" });
        }

        if (targetUserId === req.user.id) {
            return res.status(400).json({ error: "You cannot connect with yourself" });
        }

        const [senderUser, targetUser] = await Promise.all([
            prisma.user.findUnique({
                where: { id: req.user.id },
                select: { id: true, username: true, fullName: true, profileImageUrl: true, squadFolders: true, squadChats: true },
            }),
            prisma.user.findUnique({
                where: { id: targetUserId },
                select: { id: true, username: true, fullName: true, profileImageUrl: true, squadFolders: true, squadChats: true },
            }),
        ]);

        if (!senderUser || !targetUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const senderRawChats = getRawChats(senderUser.squadChats);
        const targetRawChats = getRawChats(targetUser.squadChats);
        const senderRequests = getRequestState(senderRawChats);
        const targetRequests = getRequestState(targetRawChats);

        const existingPending = targetRequests.received.find(
            (item) => item.fromUserId === senderUser.id && item.status === "pending"
        );

        if (existingPending) {
            return res.status(409).json({ error: "Connection request already pending", request: existingPending });
        }

        const request = normalizeRequest({
            id: `request-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            fromUserId: senderUser.id,
            toUserId: targetUser.id,
            fromUsername: senderUser.username,
            fromName: senderUser.fullName || senderUser.username,
            fromAvatar: senderUser.profileImageUrl,
            toUsername: targetUser.username,
            toName: targetUser.fullName || targetUser.username,
            toAvatar: targetUser.profileImageUrl,
            text: customText || `Hey ${targetUser.fullName || targetUser.username}, would love to connect and collaborate with you!`,
            status: "pending",
            createdAt: new Date().toISOString(),
        });

        const senderMember = buildMemberFromUser(targetUser, "Profile Connect");
        const senderSquads = ensureMemberInSquad(senderUser.squadFolders || [], senderMember, preferredSquadId);

        const nextSenderChats = setRequestState(senderRawChats, {
            received: senderRequests.received,
            sent: [...senderRequests.sent, request],
        });

        const nextTargetChats = setRequestState(targetRawChats, {
            received: [...targetRequests.received, request],
            sent: targetRequests.sent,
        });

        await prisma.$transaction([
            prisma.user.update({
                where: { id: senderUser.id },
                data: {
                    squadFolders: senderSquads,
                    squadChats: nextSenderChats,
                },
            }),
            prisma.user.update({
                where: { id: targetUser.id },
                data: {
                    squadChats: nextTargetChats,
                },
            }),
        ]);

        return res.status(201).json({
            message: "Connection request sent",
            request,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.respondToConnectionRequest = async (req, res) => {
    try {
        const requestId = toTrimmed(req.params.requestId);
        const action = toTrimmed(req.body?.action || "").toLowerCase();

        if (!requestId) {
            return res.status(400).json({ error: "requestId is required" });
        }

        if (!["accept", "decline"].includes(action)) {
            return res.status(400).json({ error: "action must be accept or decline" });
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, username: true, fullName: true, profileImageUrl: true, squadFolders: true, squadChats: true },
        });

        if (!currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const currentRawChats = getRawChats(currentUser.squadChats);
        const currentRequests = getRequestState(currentRawChats);
        const receivedRequest = currentRequests.received.find((request) => request.id === requestId);

        if (!receivedRequest) {
            return res.status(404).json({ error: "Request not found" });
        }

        if (receivedRequest.status !== "pending") {
            return res.status(409).json({ error: `Request already ${receivedRequest.status}` });
        }

        const senderUser = await prisma.user.findUnique({
            where: { id: receivedRequest.fromUserId },
            select: { id: true, username: true, fullName: true, profileImageUrl: true, squadFolders: true, squadChats: true },
        });

        if (!senderUser) {
            return res.status(404).json({ error: "Sender not found" });
        }

        const nextStatus = action === "accept" ? "accepted" : "declined";
        const responseTime = new Date().toISOString();

        const nextCurrentReceived = currentRequests.received.map((request) =>
            request.id === requestId
                ? { ...request, status: nextStatus, respondedAt: responseTime }
                : request
        );

        const senderRawChats = getRawChats(senderUser.squadChats);
        const senderRequests = getRequestState(senderRawChats);
        const nextSenderSent = senderRequests.sent.map((request) =>
            request.id === requestId
                ? { ...request, status: nextStatus, respondedAt: responseTime }
                : request
        );

        let currentSquads = normalizeSquads(currentUser.squadFolders || []);

        if (nextStatus === "accepted") {
            currentSquads = ensureMemberInSquad(
                currentSquads,
                buildMemberFromUser(senderUser, "Accepted Connection"),
                DEFAULT_SQUAD_ID
            );
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: currentUser.id },
                data: {
                    squadFolders: currentSquads,
                    squadChats: setRequestState(currentRawChats, {
                        received: nextCurrentReceived,
                        sent: currentRequests.sent,
                    }),
                },
            }),
            prisma.user.update({
                where: { id: senderUser.id },
                data: {
                    squadChats: setRequestState(senderRawChats, {
                        received: senderRequests.received,
                        sent: nextSenderSent,
                    }),
                },
            }),
        ]);

        return res.json({
            message: `Request ${nextStatus}`,
            requestId,
            status: nextStatus,
            respondedAt: responseTime,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.startDirectMessage = async (req, res) => {
    try {
        const targetUserId = toTrimmed(req.body?.targetUserId);
        if (!targetUserId) {
            return res.status(400).json({ error: "targetUserId is required" });
        }

        if (targetUserId === req.user.id) {
            return res.status(400).json({ error: "You cannot message yourself" });
        }

        const [senderUser, targetUser] = await Promise.all([
            prisma.user.findUnique({
                where: { id: req.user.id },
                select: { id: true, username: true, fullName: true, profileImageUrl: true, squadFolders: true, squadChats: true },
            }),
            prisma.user.findUnique({
                where: { id: targetUserId },
                select: { id: true, username: true, fullName: true, profileImageUrl: true, squadFolders: true, squadChats: true },
            }),
        ]);

        if (!senderUser || !targetUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const senderMember = buildMemberFromUser(targetUser, "Direct Message");
        const targetMember = buildMemberFromUser(senderUser, "Direct Message");

        const nextSenderSquads = ensureMemberInSquad(senderUser.squadFolders || [], senderMember, DEFAULT_SQUAD_ID);
        const nextTargetSquads = ensureMemberInSquad(targetUser.squadFolders || [], targetMember, DEFAULT_SQUAD_ID);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: senderUser.id },
                data: { squadFolders: nextSenderSquads },
            }),
            prisma.user.update({
                where: { id: targetUser.id },
                data: { squadFolders: nextTargetSquads },
            }),
        ]);

        return res.json({
            chatTarget: {
                id: targetUser.id,
                uid: targetUser.id,
                username: toTrimmed(targetUser.username),
                name: targetUser.fullName || targetUser.username || "Campus User",
                avatar: targetUser.profileImageUrl || "",
                initials: (targetUser.fullName || targetUser.username || "CU")
                    .split(" ")
                    .map((item) => item[0] || "")
                    .join("")
                    .slice(0, 2)
                    .toUpperCase(),
                role: "Student",
                college: "Campus",
                connectedVia: "Direct Message",
                status: "online",
            },
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.sendDirectMessage = async (req, res) => {
    try {
        const targetUserId = toTrimmed(req.body?.targetUserId);
        const text = toTrimmed(req.body?.text);

        if (!targetUserId) {
            return res.status(400).json({ error: "targetUserId is required" });
        }

        if (!text) {
            return res.status(400).json({ error: "text is required" });
        }

        if (targetUserId === req.user.id) {
            return res.status(400).json({ error: "You cannot message yourself" });
        }

        const [senderUser, targetUser] = await Promise.all([
            prisma.user.findUnique({
                where: { id: req.user.id },
                select: { id: true, squadChats: true },
            }),
            prisma.user.findUnique({
                where: { id: targetUserId },
                select: { id: true, squadChats: true },
            }),
        ]);

        if (!senderUser || !targetUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const createdAt = new Date().toISOString();
        const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const time = toMessageTime(createdAt);

        const senderMessage = {
            id,
            text,
            sender: "me",
            senderId: senderUser.id,
            receiverId: targetUser.id,
            createdAt,
            time,
        };

        const receiverMessage = {
            id,
            text,
            sender: "them",
            senderId: senderUser.id,
            receiverId: targetUser.id,
            createdAt,
            time,
        };

        const senderRawChats = getRawChats(senderUser.squadChats);
        const targetRawChats = getRawChats(targetUser.squadChats);

        const nextSenderChats = appendChatMessage(senderRawChats, targetUser.id, senderMessage);
        const nextTargetChats = appendChatMessage(targetRawChats, senderUser.id, receiverMessage);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: senderUser.id },
                data: { squadChats: nextSenderChats },
            }),
            prisma.user.update({
                where: { id: targetUser.id },
                data: { squadChats: nextTargetChats },
            }),
        ]);

        return res.status(201).json({
            message: "Message sent",
            chat: senderMessage,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
