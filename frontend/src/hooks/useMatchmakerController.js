import { useMemo, useState } from "react";
import { mockUsers } from "../data/mockData";
import { useUserStore } from "../store/useUserStore";

const MOCK_USERS = mockUsers.map((user) => ({
    uid: user.uid,
    name: user.name,
    campus: user.campus,
    branch: user.branch,
    batch: user.batch,
    openToConnect: true,
    interests: user.interests || [],
    skills: user.skills || [],
    lookingFor: ["Study Partner", "Collaboration"],
    profile_pic: user.photoURL || "https://i.pravatar.cc/150?img=1",
    bio: user.bio || "",
    karmaCount: user.karma || 0,
    postsCount: Math.floor(Math.random() * 50) + 5,
    threadsCount: Math.floor(Math.random() * 20) + 2,
}));

function calculateScore(currentUser, otherUser) {
    let score = 0;

    const commonInterests =
        currentUser.interests?.filter((interest) =>
            otherUser.interests?.includes(interest)
        ) || [];

    const commonSkills =
        currentUser.skills?.filter((skill) =>
            otherUser.skills?.includes(skill)
        ) || [];

    const commonLookingFor =
        currentUser.lookingFor?.filter((item) =>
            otherUser.lookingFor?.includes(item)
        ) || [];

    score += commonInterests.length * 5;
    score += commonSkills.length * 4;
    score += commonLookingFor.length * 4;

    if (currentUser.campus && currentUser.campus === otherUser.campus) score += 3;
    if (currentUser.branch === otherUser.branch) score += 3;
    if (currentUser.batch === otherUser.batch) score += 2;
    if (otherUser.openToConnect) score += 1;

    return { score, commonInterests, commonSkills, commonLookingFor };
}

export function useMatchmakerController() {
    const { user } = useUserStore();
    const [lastAction, setLastAction] = useState(null);
    const [decisionState, setDecisionState] = useState({
        key: null,
        passed: [],
        saved: [],
        connected: [],
    });

    const currentUser = useMemo(
        () =>
            user || {
                uid: "demo-user",
                interests: ["Web Development", "AI/ML", "Design", "Data Science"],
                skills: ["React", "Node.js", "Python"],
                lookingFor: ["Study Partner", "Collaboration", "Networking"],
                campus: "MIT",
                branch: "Computer Science",
                batch: "2026",
            },
        [user]
    );

    const decisionKey = currentUser.uid;
    const scopedDecisionState = useMemo(
        () =>
            decisionState.key === decisionKey
                ? decisionState
                : { key: decisionKey, passed: [], saved: [], connected: [] },
        [decisionState, decisionKey]
    );

    const rankedMatches = useMemo(() => {
        const maxScore = 5 * 5 + 4 * 5 + 4 * 3 + 3 + 3 + 2 + 1;

        const filtered = MOCK_USERS
            .filter((candidate) => candidate.uid !== currentUser.uid)
            .map((candidate) => {
                const { score, commonInterests, commonSkills, commonLookingFor } = calculateScore(currentUser, candidate);

                const compatibilityPercent = Math.max(
                    Math.min(Math.round((score / maxScore) * 100), 100),
                    10  // Minimum 10% to always show something
                );

                return {
                    ...candidate,
                    compatibilityScore: score,
                    compatibilityPercent,
                    commonInterests,
                    commonSkills,
                    commonLookingFor,
                };
            })
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        if (filtered.length > 0) return filtered;

        return MOCK_USERS.slice(0, 5).map((u) => ({
            ...u,
            compatibilityPercent: 45,
            compatibilityScore: 10,
            commonInterests: [],
            commonSkills: [],
            commonLookingFor: [],
        }));
    }, [currentUser]);

    const matches = useMemo(() => {
        const hidden = new Set([
            ...scopedDecisionState.passed,
            ...scopedDecisionState.saved,
            ...scopedDecisionState.connected,
        ]);
        return rankedMatches.filter((candidate) => !hidden.has(candidate.uid));
    }, [rankedMatches, scopedDecisionState]);

    const applyAction = (action, candidateUid) => {
        if (!matches.length) return;

        const targetUid = candidateUid || matches[0]?.uid;
        if (!targetUid) return;

        setLastAction(action);

        if (action === "pass" || action === "save" || action === "connect") {
            setDecisionState((prev) => {
                const base =
                    prev.key === decisionKey
                        ? prev
                        : { key: decisionKey, passed: [], saved: [], connected: [] };
                const next = {
                    key: decisionKey,
                    passed: base.passed.filter((uid) => uid !== targetUid),
                    saved: base.saved.filter((uid) => uid !== targetUid),
                    connected: base.connected.filter((uid) => uid !== targetUid),
                };
                if (action === "pass") next.passed.push(targetUid);
                if (action === "save") next.saved.push(targetUid);
                if (action === "connect") next.connected.push(targetUid);
                return next;
            });
        }
    };

    const handleSwipe = (direction) => {
        if (direction === "right") {
            applyAction("connect");
            return;
        }
        if (direction === "left") {
            applyAction("pass");
        }
    };

    return {
        currentMatch: matches[0] || null,
        matches,
        lastAction,
        decisionState: scopedDecisionState,
        handlePass: () => applyAction("pass"),
        handleSave: () => applyAction("save"),
        handleConnect: () => applyAction("connect"),
        handleSwipe,
    };
}
