import TalentCard from "../components/matchmaker/TalentCard";
import { AnimatePresence, motion } from "framer-motion";
import { useMatchmakerController } from "../hooks/useMatchmakerController";
import { useUserStore } from "../store/useUserStore";
import { RotateCcw, SendHorizontal, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { generateConnectionMessage, sendConnectionRequest } from "../services/squadService";

const MotionDiv = motion.div;

const BRANCH_KEYWORDS = [
  "my branch",
  "same branch",
  "from my branch",
  "my department",
  "same department",
  "my stream",
  "same stream",
  "my major",
  "same major",
];

const CAMPUS_KEYWORDS = [
  "my college",
  "same college",
  "my campus",
  "same campus",
  "from my college",
  "from my campus",
  "my clg",
  "same clg",
];

const INTERESTS_KEYWORDS = [
  "same interests",
  "my interests",
  "similar interests",
  "with my interests",
];

const SKILLS_KEYWORDS = [
  "same skills",
  "my skills",
  "similar skills",
  "with my skills",
];

const FILTER_STOP_WORDS = new Set([
  "find",
  "me",
  "a",
  "an",
  "the",
  "for",
  "to",
  "from",
  "my",
  "same",
  "teammate",
  "teammate",
  "team",
  "mate",
  "with",
  "of",
  "and",
  "or",
  "in",
  "on",
  "is",
  "it",
  "branch",
  "college",
  "campus",
  "clg",
  "department",
  "major",
  "stream",
  "interests",
  "interest",
  "skills",
  "skill",
]);

const normalizeText = (value = "") =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const parseFilterIntent = (rawText = "") => {
  const normalized = normalizeText(rawText);

  const requiresSameBranch = BRANCH_KEYWORDS.some((keyword) => normalized.includes(keyword));
  const requiresSameCampus = CAMPUS_KEYWORDS.some((keyword) => normalized.includes(keyword));
  const requiresSameInterests = INTERESTS_KEYWORDS.some((keyword) => normalized.includes(keyword));
  const requiresSameSkills = SKILLS_KEYWORDS.some((keyword) => normalized.includes(keyword));

  const keywords = normalized
    .split(" ")
    .filter((token) => token.length > 1 && !FILTER_STOP_WORDS.has(token));

  return {
    requiresSameBranch,
    requiresSameCampus,
    requiresSameInterests,
    requiresSameSkills,
    keywords,
  };
};

const getMyBranch = (currentUser) => {
  const direct = String(currentUser?.branch || currentUser?.headline || "").trim();
  if (direct) return direct;

  const education = Array.isArray(currentUser?.education) ? currentUser.education : [];
  const latest = education.find((entry) => String(entry?.branch || "").trim().length > 0);
  return String(latest?.branch || "").trim();
};

const getMyCampus = (currentUser) => {
  const direct = String(currentUser?.campus || currentUser?.collegeName || "").trim();
  if (direct) return direct;

  const education = Array.isArray(currentUser?.education) ? currentUser.education : [];
  const latest = education.find((entry) => String(entry?.collegeName || "").trim().length > 0);
  return String(latest?.collegeName || "").trim();
};

export default function Matchmaker() {
  const theme = useUserStore((state) => state.theme);
  const user = useUserStore((state) => state.user);
  const isDark = theme === "dark";
  const [filterInput, setFilterInput] = useState("");
  const [manualFilters, setManualFilters] = useState({
    sameBranch: false,
    sameCampus: false,
    sameInterests: false,
    sameSkills: false,
  });
  const [intentFilters, setIntentFilters] = useState({
    sameBranch: false,
    sameCampus: false,
    sameInterests: false,
    sameSkills: false,
    keywords: [],
  });
  const [connectState, setConnectState] = useState({
    isOpen: false,
    target: null,
    message: "",
    isGenerating: false,
    isSending: false,
  });
  const [connectNotice, setConnectNotice] = useState(null);
  const {
    matches,
    handleSwipe,
    handleSkip,
    handleConnect,
    lastAction,
  } = useMatchmakerController();

  const toUsername = (name = "") =>
    String(name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9._]/g, "") || "campususer";

  const myBranch = useMemo(() => normalizeText(getMyBranch(user)), [user]);
  const myCampus = useMemo(() => normalizeText(getMyCampus(user)), [user]);

  const effectiveFilters = useMemo(() => {
    const parsedFromInput = parseFilterIntent(filterInput);

    return {
      sameBranch:
        manualFilters.sameBranch || intentFilters.sameBranch || parsedFromInput.requiresSameBranch,
      sameCampus:
        manualFilters.sameCampus || intentFilters.sameCampus || parsedFromInput.requiresSameCampus,
      sameInterests:
        manualFilters.sameInterests ||
        intentFilters.sameInterests ||
        parsedFromInput.requiresSameInterests,
      sameSkills:
        manualFilters.sameSkills || intentFilters.sameSkills || parsedFromInput.requiresSameSkills,
      keywords:
        intentFilters.keywords.length > 0 ? intentFilters.keywords : parsedFromInput.keywords,
    };
  }, [filterInput, intentFilters, manualFilters]);

  const visibleMatches = useMemo(
    () =>
      matches.filter((candidate) => {
        const candidateBranch = normalizeText(candidate?.branch || "");
        const candidateCampus = normalizeText(candidate?.campus || "");
        const commonInterestsCount = Array.isArray(candidate?.commonInterests)
          ? candidate.commonInterests.length
          : 0;
        const commonSkillsCount = Array.isArray(candidate?.commonSkills)
          ? candidate.commonSkills.length
          : 0;

        if (effectiveFilters.sameBranch && myBranch && candidateBranch !== myBranch) {
          return false;
        }

        if (effectiveFilters.sameCampus && myCampus && candidateCampus !== myCampus) {
          return false;
        }

        if (effectiveFilters.sameInterests && commonInterestsCount === 0) {
          return false;
        }

        if (effectiveFilters.sameSkills && commonSkillsCount === 0) {
          return false;
        }

        if (!effectiveFilters.keywords.length) {
          return true;
        }

        const searchText = normalizeText(
          [
            candidate.name,
            candidate.branch,
            candidate.campus,
            ...(candidate.skills || []),
            ...(candidate.interests || []),
          ].join(" ")
        );

        return effectiveFilters.keywords.every((token) => searchText.includes(token));
      }),
    [effectiveFilters, matches, myBranch, myCampus]
  );

  const openConnectModal = async (candidate) => {
    setConnectNotice(null);
    setConnectState({
      isOpen: true,
      target: candidate,
      message: "",
      isGenerating: true,
      isSending: false,
    });

    try {
      const aiText = await generateConnectionMessage({
        myName: user?.name || user?.username,
        theirName: candidate?.name || candidate?.username,
        context: `${candidate?.branch || ""} ${candidate?.campus || ""}`.trim(),
      });

      setConnectState((prev) => {
        if (!prev.isOpen || prev?.target?.uid !== candidate?.uid) {
          return prev;
        }

        return {
          ...prev,
          message: String(aiText || "").trim(),
          isGenerating: false,
        };
      });
    } catch {
      setConnectState((prev) => {
        if (!prev.isOpen || prev?.target?.uid !== candidate?.uid) {
          return prev;
        }

        return {
          ...prev,
          message: `Hey ${candidate?.name || candidate?.username || "there"}, your profile stood out. Want to connect and explore a collaboration opportunity together?`,
          isGenerating: false,
        };
      });
    }
  };

  const closeConnectModal = () => {
    setConnectState({
      isOpen: false,
      target: null,
      message: "",
      isGenerating: false,
      isSending: false,
    });
  };

  const confirmConnect = async () => {
    const target = connectState.target;
    if (!target || connectState.isSending) return;

    const finalText = String(connectState.message || "").trim();
    if (!finalText) {
      setConnectNotice({
        type: "error",
        text: "Please enter a connection message before sending.",
      });
      return;
    }

    setConnectState((prev) => ({ ...prev, isSending: true }));

    try {
      await sendConnectionRequest({
        targetUserId: target.uid,
        text: finalText,
      });

      handleConnect(target.uid);
      closeConnectModal();
      setConnectNotice({
        type: "success",
        text: `Connection request sent to @${target.username || toUsername(target.name)}.`,
      });
    } catch (error) {
      setConnectState((prev) => ({ ...prev, isSending: false }));
      setConnectNotice({
        type: "error",
        text:
          error?.response?.data?.error ||
          error?.message ||
          "Failed to send connection request.",
      });
    }
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();

    const parsed = parseFilterIntent(filterInput);
    setIntentFilters({
      sameBranch: parsed.requiresSameBranch,
      sameCampus: parsed.requiresSameCampus,
      sameInterests: parsed.requiresSameInterests,
      sameSkills: parsed.requiresSameSkills,
      keywords: parsed.keywords,
    });
  };

  return (
    <div className="space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-2 transition-colors bg-transparent px-2 md:px-4">

      {/* Header */}
      <div className="max-w-2xl mx-auto text-center">
        <h1 className={`text-3xl font-bold mb-1 ${isDark ? "text-slate-100" : "text-gray-900"}`}>
          Find Teammates
        </h1>
        <p className={`text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>
          Discover talent for projects, and then connect.
        </p>

        {lastAction ? (
          <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            Last action: {lastAction}
          </p>
        ) : null}

        {connectNotice ? (
          <p
            className={`mt-2 text-xs font-medium ${connectNotice.type === "success"
              ? isDark
                ? "text-cyan-300"
                : "text-cyan-700"
              : isDark
                ? "text-red-300"
                : "text-red-700"
              }`}
          >
            {connectNotice.text}
          </p>
        ) : null}

      </div>

      <div
        className={`max-w-2xl mb-10 mx-auto rounded-2xl border backdrop-blur-xl p-3 md:p-4 ${isDark
          ? "border-slate-700/40 bg-slate-900/50"
          : "border-gray-200/50 bg-white/60"
          }`}
      >
        <form onSubmit={handleFilterSubmit} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className={`flex flex-1 items-center gap-2 rounded-xl border px-4 py-3 ${isDark ? 'border-slate-700 bg-slate-900/60' : 'border-gray-200 bg-white/70'}`}>
              <Sparkles className={`h-4 w-4 text-cyan-500`} />
              <input
                value={filterInput}
                onChange={(event) => setFilterInput(event.target.value)}
                placeholder="Find me a teammate for my college major project"
                className={`w-full bg-transparent outline-none text-sm ${isDark ? 'text-slate-100 placeholder:text-slate-400' : 'text-gray-800 placeholder:text-gray-500'}`}
              />
              <button
                type="submit"
                aria-label="Send filter query"
                className={`inline-flex items-center rounded-xl cursor-pointer text-sm font-semibold transition text-cyan-500`}
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setFilterInput("");
                setIntentFilters({
                  sameBranch: false,
                  sameCampus: false,
                  sameInterests: false,
                  sameSkills: false,
                  keywords: [],
                });
                setManualFilters({
                  sameBranch: false,
                  sameCampus: false,
                  sameInterests: false,
                  sameSkills: false,
                });
              }}
              className={`inline-flex items-center gap-1 rounded-xl px-3 py-3 text-sm font-semibold transition ${isDark
                ? "text-slate-300 border border-slate-700 hover:bg-slate-800"
                : "text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() =>
                setManualFilters((prev) => ({
                  ...prev,
                  sameBranch: !prev.sameBranch,
                }))
              }
              className={`rounded-full px-2.5 py-1 font-medium border transition ${effectiveFilters.sameBranch
                  ? isDark
                    ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                    : "bg-cyan-100 text-cyan-700 border-cyan-200"
                  : isDark
                    ? "bg-slate-800 text-slate-300 border-slate-700"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                }`}
            >
              Same Branch
            </button>
            <button
              type="button"
              onClick={() =>
                setManualFilters((prev) => ({
                  ...prev,
                  sameCampus: !prev.sameCampus,
                }))
              }
              className={`rounded-full px-2.5 py-1 font-medium border transition ${effectiveFilters.sameCampus
                  ? isDark
                    ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                    : "bg-cyan-100 text-cyan-700 border-cyan-200"
                  : isDark
                    ? "bg-slate-800 text-slate-300 border-slate-700"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                }`}
            >
              Same College
            </button>
            <button
              type="button"
              onClick={() =>
                setManualFilters((prev) => ({
                  ...prev,
                  sameInterests: !prev.sameInterests,
                }))
              }
              className={`rounded-full px-2.5 py-1 font-medium border transition ${effectiveFilters.sameInterests
                  ? isDark
                    ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                    : "bg-cyan-100 text-cyan-700 border-cyan-200"
                  : isDark
                    ? "bg-slate-800 text-slate-300 border-slate-700"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                }`}
            >
              Same Interests
            </button>
            <button
              type="button"
              onClick={() =>
                setManualFilters((prev) => ({
                  ...prev,
                  sameSkills: !prev.sameSkills,
                }))
              }
              className={`rounded-full px-2.5 py-1 font-medium border transition ${effectiveFilters.sameSkills
                  ? isDark
                    ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                    : "bg-cyan-100 text-cyan-700 border-cyan-200"
                  : isDark
                    ? "bg-slate-800 text-slate-300 border-slate-700"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                }`}
            >
              Same Skills
            </button>
            <span className={`rounded-full px-2.5 py-1 font-medium border ${isDark ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" : "bg-cyan-100 text-cyan-700 border-cyan-200"}`}>
              Pro tip: Use filters to find better matches. Try searching for specific skills, interests, or campus!
            </span>
          </div>

          <p className={`text-xs ${isDark ? "text-slate-300" : "text-gray-600"}`}>
            Connect opens a message composer and sends a connection request, same as Profile.
          </p>
        </form>
      </div>

      {/* Swipe Stack */}
      <div className="relative mx-auto h-screen w-full max-w-md">

        {visibleMatches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
            No compatible matches found.
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <MotionDiv
                key={visibleMatches[0].uid}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(event, info) => {
                  if (info.offset.x > 120) openConnectModal(visibleMatches[0]);
                  if (info.offset.x < -120) handleSwipe("left", visibleMatches[0]?.uid);
                }}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  x: 400,
                  opacity: 0,
                  rotate: 4,
                  transition: { duration: 0.3 }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute w-full z-30 cursor-grab active:cursor-grabbing"
              >
                <TalentCard
                  u={visibleMatches[0]}
                  onSkip={() => handleSkip(visibleMatches[0]?.uid)}
                  onConnect={() => openConnectModal(visibleMatches[0])}
                />
              </MotionDiv>
            </AnimatePresence>
          </>
        )}
      </div>

      {connectState.isOpen && connectState.target ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-5 backdrop-blur-xl ${isDark
              ? "border-slate-700 bg-slate-900/95"
              : "border-gray-200 bg-white/95"
              }`}
          >
            <h2 className={`text-lg font-bold ${isDark ? "text-slate-100" : "text-neutral-900"}`}>
              Connect with {connectState.target.name}
            </h2>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-neutral-600"}`}>
              Add a short message to send your connection request.
            </p>

            <div className="mt-4">
              <label className={`mb-1 block text-xs font-medium ${isDark ? "text-slate-300" : "text-neutral-700"}`}>
                Message
              </label>
              <textarea
                value={connectState.message}
                onChange={(event) =>
                  setConnectState((prev) => ({ ...prev, message: event.target.value }))
                }
                rows={4}
                placeholder={connectState.isGenerating ? "Generating AI suggestion..." : "Write your connection message"}
                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${isDark
                  ? "border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400"
                  : "border-gray-300 bg-white text-neutral-900 placeholder:text-gray-400"
                  }`}
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeConnectModal}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${isDark
                  ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                  : "border-gray-300 text-neutral-700 hover:bg-gray-100"
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmConnect}
                disabled={connectState.isGenerating || connectState.isSending}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${isDark
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  : "bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  }`}
              >
                {connectState.isSending ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}