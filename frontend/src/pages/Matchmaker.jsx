import TalentCard from "../components/matchmaker/TalentCard";
import { AnimatePresence, motion } from "framer-motion";
import { useMatchmakerController } from "../hooks/useMatchmakerController";
import { useUserStore } from "../store/useUserStore";
import { RotateCcw, SendHorizontal, Sparkles } from "lucide-react";
import { useState } from "react";

const MotionDiv = motion.div;

export default function Matchmaker() {
  const theme = useUserStore((state) => state.theme);
  const user = useUserStore((state) => state.user);
  const isDark = theme === "dark";
  const [filterInput, setFilterInput] = useState("");
  const [connectState, setConnectState] = useState({
    isOpen: false,
    target: null,
    selectedSquadId: "",
    newSquadName: "",
  });
  const [connectNotice, setConnectNotice] = useState("");
  const {
    matches,
    handleSwipe,
    handleSkip,
    handleConnect,
    lastAction,
  } = useMatchmakerController();

  const storageUserKey = user?.uid || user?.id || "demo-user";
  const squadStorageKey = `campusconnect:squads:${storageUserKey}`;
  const messageStorageKey = `campusconnect:messages:${storageUserKey}`;

  const toUsername = (name = "") =>
    String(name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9._]/g, "") || "campususer";

  const loadStoredSquads = () => {
    try {
      const raw = localStorage.getItem(squadStorageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveStoredSquads = (squads) => {
    localStorage.setItem(squadStorageKey, JSON.stringify(squads));
  };

  const loadStoredMessages = () => {
    try {
      const raw = localStorage.getItem(messageStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  };

  const saveStoredMessages = (messagesByUsername) => {
    localStorage.setItem(messageStorageKey, JSON.stringify(messagesByUsername));
  };

  const visibleMatches = filterInput.trim()
    ? matches.filter((candidate) => {
      const searchText = [
        candidate.name,
        candidate.branch,
        candidate.campus,
        ...(candidate.skills || []),
        ...(candidate.interests || []),
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(filterInput.trim().toLowerCase());
    })
    : matches;

  const openConnectModal = (candidate) => {
    const storedSquads = loadStoredSquads();
    const autoFolderName = `${candidate.name} Folder`;

    setConnectState({
      isOpen: true,
      target: candidate,
      selectedSquadId: storedSquads[0]?.id || "",
      newSquadName: storedSquads.length ? "" : autoFolderName,
    });
  };

  const closeConnectModal = () => {
    setConnectState({
      isOpen: false,
      target: null,
      selectedSquadId: "",
      newSquadName: "",
    });
  };

  const confirmConnect = () => {
    const target = connectState.target;
    if (!target) return;

    const storedSquads = loadStoredSquads();
    const enteredName = String(connectState.newSquadName || "").trim();
    let targetSquadId = connectState.selectedSquadId;

    if (enteredName) {
      const existingByName = storedSquads.find(
        (squad) => String(squad.name || "").toLowerCase() === enteredName.toLowerCase()
      );

      if (existingByName) {
        targetSquadId = existingByName.id;
      } else {
        const newSquad = {
          id: `${enteredName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "squad"}-${Date.now()}`,
          name: enteredName,
          members: [],
        };
        storedSquads.unshift(newSquad);
        targetSquadId = newSquad.id;
      }
    }

    if (!targetSquadId) {
      const fallbackName = `${target.name} Folder`;
      const fallbackSquad = {
        id: `${fallbackName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "squad"}-${Date.now()}`,
        name: fallbackName,
        members: [],
      };
      storedSquads.unshift(fallbackSquad);
      targetSquadId = fallbackSquad.id;
    }

    const nextSquads = storedSquads.map((squad) => {
      if (squad.id !== targetSquadId) return squad;

      const existing = Array.isArray(squad.members) ? squad.members : [];
      const alreadyPresent = existing.some((member) => member.uid === target.uid);
      if (alreadyPresent) return squad;

      return {
        ...squad,
        members: [
          ...existing,
          {
            uid: target.uid,
            name: target.name,
            username: target.username || toUsername(target.name),
            avatar: target.profile_pic,
            role: target.branch,
            college: target.campus,
          },
        ],
      };
    });

    saveStoredSquads(nextSquads);

    const username = target.username || toUsername(target.name);
    const messagesByUsername = loadStoredMessages();
    const existingMessages = Array.isArray(messagesByUsername[username]) ? messagesByUsername[username] : [];
    messagesByUsername[username] = [
      ...existingMessages,
      {
        id: `${username}-${Date.now()}`,
        from: storageUserKey,
        to: username,
        text: "Prepare well.",
        time: new Date().toISOString(),
      },
    ];
    saveStoredMessages(messagesByUsername);

    handleConnect(target.uid);
    closeConnectModal();
    setConnectNotice(`Connected with @${username}. Default message sent and added to squad folder.`);
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
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
          <p className={`mt-2 text-xs font-medium ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>
            {connectNotice}
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
            <span className={`rounded-full px-2.5 py-1 font-medium border ${isDark ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" : "bg-cyan-100 text-cyan-700 border-cyan-200"}`}>
              Pro tip: Use filters to find better matches. Try searching for specific skills, interests, or campus!
            </span>
          </div>

          <p className={`text-xs ${isDark ? "text-slate-300" : "text-gray-600"}`}>
            Connect asks you to choose or create a squad and sends a default message.
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
              Choose a squad folder or create one. On confirm, default message “Prepare well.” will be queued.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className={`mb-1 block text-xs font-medium ${isDark ? "text-slate-300" : "text-neutral-700"}`}>
                  Choose existing squad
                </label>
                <select
                  value={connectState.selectedSquadId}
                  onChange={(event) =>
                    setConnectState((prev) => ({ ...prev, selectedSquadId: event.target.value }))
                  }
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${isDark
                    ? "border-slate-700 bg-slate-800 text-slate-100"
                    : "border-gray-300 bg-white text-neutral-900"
                    }`}
                >
                  <option value="">Select squad (or create below)</option>
                  {loadStoredSquads().map((squad) => (
                    <option key={squad.id} value={squad.id}>
                      {squad.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`mb-1 block text-xs font-medium ${isDark ? "text-slate-300" : "text-neutral-700"}`}>
                  Or create new squad
                </label>
                <input
                  value={connectState.newSquadName}
                  onChange={(event) =>
                    setConnectState((prev) => ({ ...prev, newSquadName: event.target.value }))
                  }
                  placeholder={`e.g. ${connectState.target.name} Folder`}
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${isDark
                    ? "border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400"
                    : "border-gray-300 bg-white text-neutral-900 placeholder:text-gray-400"
                    }`}
                />
              </div>
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
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${isDark
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30"
                  : "bg-cyan-600 text-white hover:bg-cyan-700"
                  }`}
              >
                Confirm Connect
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}