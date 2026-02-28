import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPannel";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, lazy, Suspense, useState } from "react";
import { Info, X } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { useInterviewStore } from "../store/useInterviewStore";

// Lazy load AI components since they're heavy
const GeminiBot = lazy(() => import("../components/AI/GeminiBot"));

function MainLayout() {
  const location = useLocation();
  const theme = useUserStore((state) => state.theme);
  const user = useUserStore((state) => state.user);
  const isInCall = useInterviewStore((state) => state.isInCall);
  const [hideProfileHint, setHideProfileHint] = useState(false);
  const [assessmentPhase, setAssessmentPhase] = useState("setup");
  const isAssessmentRoute = location.pathname.toLowerCase() === "/ai-assessment";
  const isAssessmentFullscreen = isAssessmentRoute && assessmentPhase === "quiz";

  const isDark = useMemo(() => theme === "dark", [theme]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = '#111827';
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = '';
    }
  }, [isDark]);

  useEffect(() => {
    setHideProfileHint(false);
  }, [user?.uid]);

  useEffect(() => {
    const onPhaseChange = (event) => {
      const nextPhase = event?.detail?.phase;
      if (nextPhase) {
        setAssessmentPhase(nextPhase);
      }
    };

    window.addEventListener("assessment-phase-change", onPhaseChange);
    return () => window.removeEventListener("assessment-phase-change", onPhaseChange);
  }, []);

  useEffect(() => {
    if (!isAssessmentRoute) {
      setAssessmentPhase("setup");
    }
  }, [isAssessmentRoute]);

  const profileCompletePercentage = user?.profileCompletePercentage ?? 0;
  const shouldShowProfileHint = Boolean(user?.uid) && profileCompletePercentage < 60 && !hideProfileHint;

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="h-screen flex flex-col site-ambient">
        <div className={isInCall ? 'hidden' : ''}>
          <Navbar />
        </div>

        {!isInCall && shouldShowProfileHint ? (
          <div className={`max-w-7xl mt-2 pt-1 mx-auto w-full ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            <div className={`border px-3 py-1 flex items-center justify-between ${isDark ? "border-cyan-500/30 bg-cyan-500/10" : "border-cyan-300 bg-cyan-50"}`}>
              <div className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-cyan-500" />
                <span>Complete your profile ({profileCompletePercentage}%) for better visibility and recommendations.</span>
              </div>
              <button
                type="button"
                onClick={() => setHideProfileHint(true)}
                className={`rounded-md p-1 ml-[10%] ${isDark ? "hover:bg-slate-800" : "hover:bg-cyan-100"}`}
                aria-label="Close profile completion reminder"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-12 gap-6 px-4 py-6 overflow-auto [&::-webkit-scrollbar]:hidden">
          <aside className={`col-span-3 hidden md:block overflow-y-auto [&::-webkit-scrollbar]:hidden ${isInCall || isAssessmentFullscreen ? 'hidden' : ''}`}>
            <Sidebar />
          </aside>

          <main className={`${isAssessmentFullscreen ? "col-span-12" : "col-span-12 md:col-span-6"} overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden`}>
            <Outlet />
          </main>

          <aside className={`col-span-3 hidden md:block overflow-y-auto [&::-webkit-scrollbar]:hidden ${isInCall || isAssessmentFullscreen ? 'hidden' : ''}`}>
            <RightPanel />
          </aside>
        </div>

        <Suspense fallback={null}>
          {!isInCall && <GeminiBot />}
        </Suspense>
      </div>
    </div>
  );
}

export default MainLayout;