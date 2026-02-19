import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import PrivateRoute from "./components/PrivateRoute";
import MainLayout from "./layout/MainLayout";
import Settings from "./pages/Settings";

const Home = lazy(() => import("./pages/Home"));
const Threads = lazy(() => import("./pages/Threads"));
const Profile = lazy(() => import("./pages/Profile"));
const Matchmaker = lazy(() => import("./pages/Matchmaker"));
const ThreadView = lazy(() => import("./pages/ThreadView"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/home" element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
        <Route path="/threads" element={<Suspense fallback={<PageLoader />}><Threads /></Suspense>} />
        <Route path="/threads/:thread_id" element={<Suspense fallback={<PageLoader />}><ThreadView /></Suspense>} />
        <Route path="/profile" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
        <Route path="/profile/:uid" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
        <Route path="/matchmaker" element={<Suspense fallback={<PageLoader />}><Matchmaker /></Suspense>} />
        <Route path="/AI-Interview" element={<Suspense fallback={<PageLoader />}><Matchmaker /></Suspense>} />
        <Route path="/AI-Assessment" element={<Suspense fallback={<PageLoader />}><Matchmaker /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
      </Route>

      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

export default App;
