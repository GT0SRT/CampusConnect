import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "./layout/MainLayout";

import Auth from "./pages/Auth";
import PrivateRoute from "./components/PrivateRoute";

// Lazy load pages for better performance
const Home = lazy(() => {
  console.log('[Route] Loading Home page...')
  return import("./pages/Home")
});
const Threads = lazy(() => {
  console.log('[Route] Loading Threads page...')
  return import("./pages/Threads")
});
const Profile = lazy(() => {
  console.log('[Route] Loading Profile page...')
  return import("./pages/Profile")
});
const ThreadView = lazy(() => {
  console.log('[Route] Loading ThreadView page...')
  return import("./pages/ThreadView")
});

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" role="status" aria-label="Loading page"></div>
        <p className="text-gray-700">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  console.log('[App] App component rendering...')
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
        <Route path="/threads" element={<Suspense fallback={<PageLoader />}><Threads /></Suspense>} />
        <Route path="/profile" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
        <Route path="/threads/:thread_id" element={<Suspense fallback={<PageLoader />}><ThreadView /></Suspense>} />
      </Route>
    </Routes>
  );
}

export default App;
