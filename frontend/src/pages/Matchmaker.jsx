import TalentCard from "../components/matchmaker/TalentCard";
import { AnimatePresence, motion } from "framer-motion";
import { useMatchmakerController } from "../hooks/useMatchmakerController";

const MotionDiv = motion.div;

export default function Matchmaker() {
  const { matches, swipeDirection, handleSwipe } = useMatchmakerController();

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
              <MotionDiv
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
              </MotionDiv>
            </AnimatePresence>

            {/* Background Cards */}
            {matches.slice(1, 3).map((u, index) => (
              <MotionDiv
                key={u.uid}
                initial={false}
                animate={{
                  scale: 1 - (index + 1) * 0.05,
                  y: (index + 1) * 15,
                  opacity: 1 - (index + 1) * 0.1
                }}
                transition={{ duration: 0.3 }}
                className={`absolute w-full ${index === 0 ? "z-20" : "z-10"}`}
              >
                <TalentCard u={u} />
              </MotionDiv>
            ))}
          </>
        )}
      </div>
    </div>
  );
}