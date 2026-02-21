import { useEffect, useState } from "react";
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
    lookingFor: ["Study Partner", "Collaboration"],
    profile_pic: user.photoURL || "https://i.pravatar.cc/150?img=1",
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

    const commonLookingFor =
        currentUser.lookingFor?.filter((item) =>
            otherUser.lookingFor?.includes(item)
        ) || [];

    score += commonInterests.length * 5;
    score += commonLookingFor.length * 4;

    if (currentUser.branch === otherUser.branch) score += 3;
    if (currentUser.batch === otherUser.batch) score += 2;

    return { score, commonInterests, commonLookingFor };
}

export function useMatchmakerController() {
    const { user } = useUserStore();
    const [matches, setMatches] = useState([]);
    const [swipeDirection, setSwipeDirection] = useState(null);

    useEffect(() => {
        // Always show matches for demo - use current user or demo user
        const currentUser = user || {
            uid: "demo-user",
            interests: ["Web Development", "AI/ML", "Design", "Data Science"],
            lookingFor: ["Study Partner", "Collaboration", "Networking"],
            branch: "Computer Science",
            batch: "2026"
        };

        const maxScore = 5 * 5 + 4 * 3 + 3 + 2;

        // Always include all candidates regardless of current user
        const filtered = MOCK_USERS
            .filter((candidate) => candidate.uid !== currentUser.uid)
            .map((candidate) => {
                const { score, commonInterests, commonLookingFor } = calculateScore(currentUser, candidate);

                const compatibilityPercent = Math.max(
                    Math.min(Math.round((score / maxScore) * 100), 100),
                    10  // Minimum 10% to always show something
                );

                return {
                    ...candidate,
                    compatibilityScore: score,
                    compatibilityPercent,
                    commonInterests,
                    commonLookingFor,
                };
            })
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        // Always set matches (even if empty array, but shouldn't be)
        setMatches(filtered.length > 0 ? filtered : MOCK_USERS.slice(0, 5).map((u) => ({
            ...u,
            compatibilityPercent: 45,
            compatibilityScore: 10,
            commonInterests: [],
            commonLookingFor: [],
        })));

        return () => { };
    }, [user]);

    const handleSwipe = (direction) => {
        if (!matches.length) return;
        setSwipeDirection(direction);
        setMatches((prev) => prev.slice(1));
    };

    return {
        matches,
        swipeDirection,
        handleSwipe,
    };
}
