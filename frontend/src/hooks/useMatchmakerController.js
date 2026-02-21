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
        if (!user?.uid) return;

        const maxScore = 5 * 5 + 4 * 3 + 3 + 2;

        const filtered = MOCK_USERS
            .filter((candidate) => candidate.uid !== user.uid && candidate.openToConnect === true)
            .map((candidate) => {
                const { score, commonInterests, commonLookingFor } = calculateScore(user, candidate);

                const compatibilityPercent = Math.min(
                    Math.round((score / maxScore) * 100),
                    100
                );

                return {
                    ...candidate,
                    compatibilityScore: score,
                    compatibilityPercent,
                    commonInterests,
                    commonLookingFor,
                };
            })
            .filter((candidate) => candidate.compatibilityScore > 0)
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        const timer = setTimeout(() => {
            setMatches(filtered);
        }, 0);

        return () => clearTimeout(timer);
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
