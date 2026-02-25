import TalentCard from "../components/matchmaker/TalentCard";
import { AnimatePresence, motion } from "framer-motion";
import { useMatchmakerController } from "../hooks/useMatchmakerController";
import { useUserStore } from "../store/useUserStore";

const MotionDiv = motion.div;

export default function Matchmaker() {
  const theme = useUserStore((state) => state.theme);
  const isDark = theme === "dark";
  const {
    currentMatch,
    matches,
    lastAction,
    decisionState,
    handleSwipe,
    handlePass,
    handleSave,
    handleConnect,
  } = useMatchmakerController();

  return (
    <div className="min-h-screen from-gray-50 to-gray-100 py-4 px-4">

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-4 text-center">
        <h1 className={`text-3xl font-bold mb-1 ${isDark ? "text-slate-100" : "text-gray-900"}`}>
          Find Teammates
        </h1>
        <p className={`text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>
          Discover talent for projects, shortlist people, then connect.
        </p>

        <div className="mt-3 flex justify-center gap-2 text-xs">
          <ActionPill label="Passed" value={decisionState.passed.length} color="red" isDark={isDark} />
          <ActionPill label="Saved" value={decisionState.saved.length} color="amber" isDark={isDark} />
          <ActionPill label="Connected" value={decisionState.connected.length} color="cyan" isDark={isDark} />
        </div>
      </div>

      {/* Swipe Stack */}
      <div className="relative mx-auto h-135 w-full max-w-md">

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
                  <TalentCard u={u} showActions={false} />
                </MotionDiv>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionPill({ label, value, color, isDark }) {
  const colorMap = {
    red: isDark ? "bg-red-500/15 text-red-300 border-red-500/30" : "bg-red-100 text-red-700 border-red-200",
    amber: isDark ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : "bg-amber-100 text-amber-700 border-amber-200",
    cyan: isDark ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" : "bg-cyan-100 text-cyan-700 border-cyan-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full font-medium border ${colorMap[color]}`}>
      {label}: {value}
    </span>
  );
}