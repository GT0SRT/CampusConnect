import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useUserStore } from "../store/useUserStore";
import TalentCard from "../components/matchmaker/TalentCard";
import { motion, AnimatePresence } from "framer-motion";

export default function Matchmaker() {
  const { user } = useUserStore();
  const [matches, setMatches] = useState([]);
  const [swipeDirection, setSwipeDirection] = useState(null);

  const calculateScore = (currentUser, otherUser) => {
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
  };

  useEffect(() => {
    if (!user?.uid) return;

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));

        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const maxScore = 5 * 5 + 4 * 3 + 3 + 2;

        const filtered = usersData
          .filter(
            (u) => u.uid !== user.uid && u.openToConnect === true
          )
          .map((u) => {
            const { score, commonInterests, commonLookingFor } =
              calculateScore(user, u);

            const compatibilityPercent = Math.min(
              Math.round((score / maxScore) * 100),
              100
            );

            return {
              ...u,
              compatibilityScore: score,
              compatibilityPercent,
              commonInterests,
              commonLookingFor
            };
          })
          .filter((u) => u.compatibilityScore > 0)
          .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        setMatches(filtered);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [user]);

  const handleSwipe = (direction) => {
    if (!matches.length) return;

    setSwipeDirection(direction);

    // Remove first card immediately
    setMatches((prev) => prev.slice(1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-6">

      {/* Header */}
      <div className="max-w-xl mx-auto mb-10 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">
          Matchmaker
        </h1>
        <p className="text-gray-600 mt-2">
          Discover compatible talent on campus.
        </p>
      </div>

      {/* Swipe Stack */}
      <div className="relative w-full max-w-md mx-auto h-[540px]">

        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
            No compatible matches found.
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={matches[0].uid}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(event, info) => {
                  if (info.offset.x > 120) handleSwipe("right");
                  if (info.offset.x < -120) handleSwipe("left");
                }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{
                  x: swipeDirection === "right" ? 400 : -400,
                  opacity: 0,
                  rotate: swipeDirection === "right" ? 10 : -10,
                  transition: { duration: 0.3 }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute w-full z-30 cursor-grab active:cursor-grabbing"
              >
                <TalentCard
                  u={matches[0]}
                  onSwipe={handleSwipe}
                />
              </motion.div>
            </AnimatePresence>

            {/* Background Cards */}
            {matches.slice(1, 3).map((u, index) => (
              <motion.div
                key={u.uid}
                initial={false}
                animate={{
                  scale: 1 - (index + 1) * 0.05,
                  y: (index + 1) * 15,
                  opacity: 1 - (index + 1) * 0.1
                }}
                transition={{ duration: 0.3 }}
                className="absolute w-full"
                style={{ zIndex: 20 - index }}
              >
                <TalentCard u={u} />
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
