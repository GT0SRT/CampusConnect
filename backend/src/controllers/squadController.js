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

            const id = toTrimmed(squad.id || `squad-${Date.now()}`);
            const name = toTrimmed(squad.name || "New Squad");

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
                    time: String(msg.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })),
                };
            })
            .filter(Boolean);

        output[key] = cleaned;
    }

    return output;
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
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.saveSquadState = async (req, res) => {
    try {
        const squads = normalizeSquads(req.body?.squads || []);
        const chatsByMemberId = normalizeChats(req.body?.chatsByMemberId || {});

        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                squadFolders: squads,
                squadChats: chatsByMemberId,
            },
            select: {
                squadFolders: true,
                squadChats: true,
            },
        });

        return res.json({
            squads: normalizeSquads(updated.squadFolders || []),
            chatsByMemberId: normalizeChats(updated.squadChats || {}),
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
