import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPannel";
import { Outlet } from "react-router-dom";
import { useEffect, useMemo, lazy, Suspense } from "react";
import { useUserStore } from "../store/useUserStore";

// Lazy load AI components since they're heavy
const GeminiBot = lazy(() => import("../components/AI/GeminiBot"));

function MainLayout() {
  const theme = useUserStore((state) => state.theme);

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

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="h-screen flex flex-col">
        <Navbar />

        <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-12 gap-6 px-4 py-6 overflow-auto [&::-webkit-scrollbar]:hidden">
          <aside className="col-span-3 hidden md:block overflow-y-auto [&::-webkit-scrollbar]:hidden">
            <Sidebar />
          </aside>

          <main className="col-span-12 md:col-span-6 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden">
            <Outlet />
          </main>

          <aside className="col-span-3 hidden md:block overflow-y-auto [&::-webkit-scrollbar]:hidden">
            <RightPanel />
          </aside>
        </div>

        <Suspense fallback={null}>
          <GeminiBot />
        </Suspense>
      </div>
    </div>
  );
}

export default MainLayout;