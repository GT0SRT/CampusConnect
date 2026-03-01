import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import PrivateRoute from "./components/PrivateRoute";
import MainLayout from "./layout/MainLayout";

// Lazy Pages
const Home = lazy(() => import("./pages/Home"));
const Threads = lazy(() => import("./pages/Threads"));
const Profile = lazy(() => import("./pages/Profile"));
const Matchmaker = lazy(() => import("./pages/Matchmaker"));
const ThreadView = lazy(() => import("./pages/ThreadView"));
const AIAssessment = lazy(() => import("./pages/AIAssessment"));
const AssessmentHistory = lazy(() => import("./pages/AssessmentHistory"));
const Settings = lazy(() => import("./pages/Settings"));
const Squad = lazy(() => import("./pages/squad"));
const InterviewSetup = lazy(() => import("./components/interview/InterviewSetup"));
const InterviewCallRoom = lazy(() => import("./components/interview/InterviewCallRoom"));
const InterviewHistory = lazy(() => import("./components/interview/InterviewHistory"));
const InterviewSummary = lazy(() => import("./components/interview/InterviewSummary"));
import { useInterviewStore } from "./store/useInterviewStore";
import { useUserStore } from "./store/useUserStore";
import { getInterviewHistory } from "./services/interviewHistoryService";

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
    </div>
  );
}

function App() {
  const interviewHistory = useInterviewStore((state) => state.interviewHistory);
  const mergeInterviewHistory = useInterviewStore((state) => state.mergeInterviewHistory);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    let isMounted = true;

    if (!user?.id && !user?.uid) return () => {
      isMounted = false;
    };

    const hydrateInterviewHistory = async () => {
      try {
        const records = await getInterviewHistory();
        if (!isMounted || records.length === 0) return;
        mergeInterviewHistory(records);
      } catch (error) {
        console.debug("Interview history hydration skipped", error);
      }
    };

    hydrateInterviewHistory();

    return () => {
      isMounted = false;
    };
  }, [mergeInterviewHistory, user?.id, user?.uid]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />

      {/* Main Authenticated Layout */}
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/home" element={<Suspense fallback={null}><Home /></Suspense>} />
        <Route path="/threads" element={<Suspense fallback={null}><Threads /></Suspense>} />
        <Route path="/threads/:thread_id" element={<Suspense fallback={<PageLoader />}><ThreadView /></Suspense>} />
        <Route path="/matchmaker" element={<Suspense fallback={<PageLoader />}><Matchmaker /></Suspense>} />
        <Route path="/squad" element={<Suspense fallback={<PageLoader />}><Squad /></Suspense>} />
        <Route path="/AI-assessment" element={<Suspense fallback={<PageLoader />}><AIAssessment /></Suspense>} />
        <Route path="/AI-assessment/history" element={<Suspense fallback={<PageLoader />}><AssessmentHistory /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />

        <Route path="/interview" element={<Suspense fallback={<PageLoader />}><Outlet /></Suspense>}>
          <Route index element={<Navigate to="join" replace />} />
          <Route path="join" element={<InterviewSetup />} />
          <Route path="join/:id" element={<InterviewCallRoom
            onRouteStateChange={(isActive) => console.log("Room active:", isActive)}
          />} />
          <Route path="history" element={<InterviewHistory interviews={interviewHistory} />} />
          <Route path="history/:id" element={<InterviewSummary />} />
        </Route>
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/profile/:username" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
      </Route>

      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

export default App;