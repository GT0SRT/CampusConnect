import { useEffect, useMemo, useState } from "react";
import { mockUsers } from "../data/mockData";
import { useUserStore } from "../store/useUserStore";
import { getDiscoverProfiles } from "../services/userService";

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

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const normalizeArray = (value) => {
    if (!Array.isArray(value)) {
        return [];
    }

    return [...new Set(value.map((item) => normalizeText(item)).filter(Boolean))];
};

const hasNormalizedValue = (value) => normalizeText(value).length > 0;

function calculateScore(currentUser, otherUser) {
    const currentInterests = normalizeArray(currentUser.interests);
    const otherInterests = new Set(normalizeArray(otherUser.interests));
    const commonInterests = currentInterests.filter((interest) => otherInterests.has(interest));

    const currentSkills = normalizeArray(currentUser.skills);
    const otherSkills = new Set(normalizeArray(otherUser.skills));
    const commonSkills = currentSkills.filter((skill) => otherSkills.has(skill));

    const currentLookingFor = normalizeArray(currentUser.lookingFor);
    const otherLookingFor = new Set(normalizeArray(otherUser.lookingFor));
    const commonLookingFor = currentLookingFor.filter((item) => otherLookingFor.has(item));

    let score = 0;
    score += commonInterests.length * 5;
    score += commonSkills.length * 4;
    score += commonLookingFor.length * 4;

    const currentCampus = normalizeText(currentUser.campus);
    const otherCampus = normalizeText(otherUser.campus);
    const currentBranch = normalizeText(currentUser.branch);
    const otherBranch = normalizeText(otherUser.branch);
    const currentBatch = normalizeText(currentUser.batch);
    const otherBatch = normalizeText(otherUser.batch);

    if (currentCampus && currentCampus === otherCampus) score += 3;
    if (currentBranch && currentBranch === otherBranch) score += 3;
    if (currentBatch && currentBatch === otherBatch) score += 2;
    if (otherUser.openToConnect) score += 1;

    const maxScore =
        Math.min(currentInterests.length, 5) * 5 +
        Math.min(currentSkills.length, 5) * 4 +
        Math.min(currentLookingFor.length, 3) * 4 +
        (hasNormalizedValue(currentUser.campus) ? 3 : 0) +
        (hasNormalizedValue(currentUser.branch) ? 3 : 0) +
        (hasNormalizedValue(currentUser.batch) ? 2 : 0) +
        1;

    const compatibilityPercent = maxScore > 0
        ? Math.max(Math.min(Math.round((score / maxScore) * 100), 100), 0)
        : 0;

    return { score, maxScore, compatibilityPercent, commonInterests, commonSkills, commonLookingFor };
}

export function useMatchmakerController() {
    const { user } = useUserStore();
    const [lastAction, setLastAction] = useState(null);
    const [dbProfiles, setDbProfiles] = useState([]);
    const [useMockFallback, setUseMockFallback] = useState(false);
    const [decisionState, setDecisionState] = useState({
        key: null,
        skipped: [],
        connected: [],
    });

    const currentUser = useMemo(() => {
        if (user) {
            const education = Array.isArray(user.education) ? user.education : [];
            const educationWithBranch = education.find((entry) => normalizeText(entry?.branch).length > 0);
            const educationWithCampus = education.find((entry) => normalizeText(entry?.collegeName).length > 0);

            return {
                ...user,
                interests: Array.isArray(user.interests) ? user.interests : [],
                skills: Array.isArray(user.skills) ? user.skills : [],
                lookingFor: Array.isArray(user.lookingFor) ? user.lookingFor : ["Collaboration", "Project Team"],
                campus: user.campus || user.collegeName || educationWithCampus?.collegeName || "",
                branch: user.branch || user.headline || educationWithBranch?.branch || "",
                batch: user.batch || "",
            };
        }

        return {
            uid: "demo-user",
            interests: ["Web Development", "AI/ML", "Design", "Data Science"],
            skills: ["React", "Node.js", "Python"],
            lookingFor: ["Study Partner", "Collaboration", "Networking"],
            campus: "MIT",
            branch: "Computer Science",
            batch: "2026",
        };
    }, [user]);

    const decisionKey = currentUser.uid;

    useEffect(() => {
        let active = true;

        const loadProfiles = async () => {
            try {
                const profiles = await getDiscoverProfiles();
                if (!active) return;

                const candidates = profiles
                    .filter((item) => (item.uid || item.id) !== currentUser.uid)
                    .map((item) => ({
                        uid: item.uid || item.id,
                        username: item.username,
                        name: item.name || item.username || "Campus User",
                        campus: item.campus || "",
                        branch: item.branch || "",
                        batch: item.batch || "",
                        openToConnect: true,
                        interests: Array.isArray(item.interests) ? item.interests : [],
                        skills: Array.isArray(item.skills) ? item.skills : [],
                        lookingFor: ["Collaboration", "Project Team"],
                        profile_pic: item.profile_pic || item.profileImageUrl || "https://i.pravatar.cc/150?img=1",
                        bio: item.bio || "",
                        karmaCount: item.karmaCount || 0,
                        postsCount: item.postsCount || 0,
                        threadsCount: item.threadsCount || 0,
                    }));

                setDbProfiles(candidates);
                setUseMockFallback(false);
            } catch {
                if (!active) return;
                setUseMockFallback(true);
            }
        };

        loadProfiles();

        return () => {
            active = false;
        };
    }, [currentUser.uid]);

    const scopedDecisionState = useMemo(
        () =>
            decisionState.key === decisionKey
                ? decisionState
                : { key: decisionKey, skipped: [], connected: [] },
        [decisionState, decisionKey]
    );

    const rankedMatches = useMemo(() => {
        const sourceUsers = dbProfiles.length > 0 ? dbProfiles : (useMockFallback ? MOCK_USERS : []);

        const filtered = sourceUsers
            .filter((candidate) => candidate.uid !== currentUser.uid)
            .map((candidate) => {
                const { score, maxScore, compatibilityPercent, commonInterests, commonSkills, commonLookingFor } = calculateScore(currentUser, candidate);

                return {
                    ...candidate,
                    compatibilityScore: score,
                    compatibilityMaxScore: maxScore,
                    compatibilityPercent,
                    commonInterests,
                    commonSkills,
                    commonLookingFor,
                };
            })
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        return filtered;
    }, [currentUser, dbProfiles, useMockFallback]);

    const matches = useMemo(() => {
        const hidden = new Set([
            ...scopedDecisionState.skipped,
            ...scopedDecisionState.connected,
        ]);
        return rankedMatches.filter((candidate) => !hidden.has(candidate.uid));
    }, [rankedMatches, scopedDecisionState]);

    const applyAction = (action, candidateUid) => {
        if (!matches.length) return;

        const targetUid = candidateUid || matches[0]?.uid;
        if (!targetUid) return;

        setLastAction(action);

        if (action === "skip" || action === "connect") {
            setDecisionState((prev) => {
                const base =
                    prev.key === decisionKey
                        ? prev
                        : { key: decisionKey, skipped: [], connected: [] };
                const next = {
                    key: decisionKey,
                    skipped: base.skipped.filter((uid) => uid !== targetUid),
                    connected: base.connected.filter((uid) => uid !== targetUid),
                };
                if (action === "skip") next.skipped.push(targetUid);
                if (action === "connect") next.connected.push(targetUid);
                return next;
            });
        }
    };

    const handleSwipe = (direction, candidateUid) => {
        if (direction === "right") {
            applyAction("connect", candidateUid);
            return;
        }
        if (direction === "left") {
            applyAction("skip", candidateUid);
        }
    };

    return {
        currentMatch: matches[0] || null,
        matches,
        lastAction,
        decisionState: scopedDecisionState,
        handleSkip: (candidateUid) => applyAction("skip", candidateUid),
        handleConnect: (candidateUid) => applyAction("connect", candidateUid),
        handleSwipe,
    };
}
