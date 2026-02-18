import { useState, lazy, Suspense } from "react";
import { useUserStore } from "../store/useUserStore";
import { Plus, Handshake, Menu } from "lucide-react";
import Sidebar from "./Sidebar";

// Lazy load modal to reduce initial bundle size
const CreateModal = lazy(() => import("../components/modals/CreateModal"));

export default function Navbar() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const theme = useUserStore((state) => state.theme);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${theme === "dark"
        ? "bg-slate-900/80 border-b border-slate-700/50 backdrop-blur-xl shadow-lg shadow-cyan-500/5"
        : "bg-white/80 border-b border-gray-200/50 backdrop-blur-xl shadow-md shadow-gray-400/5"
        }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-10 gap-3 items-center">

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle navigation menu"
            className={`md:hidden col-span-1 p-2 rounded-lg transition ${theme === 'dark'
              ? 'text-slate-300 hover:bg-slate-800/60'
              : 'text-gray-600 hover:bg-gray-100/60'
              }`}
          >
            <Menu size={24} />
          </button>

          <div className={`hidden sm:flex items-center gap-2 font-semibold shrink-0 transition-all ${isSidebarOpen ? 'hidden md:flex' : 'flex'
            } ${theme === "dark" ? "text-slate-50" : "text-slate-900"} md:col-span-2 col-span-1`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 transition-transform hover:scale-110 shadow-lg shadow-cyan-500/20">
              <Handshake className="h-5 w-5 text-slate-50" />
            </div>
            <span className="whitespace-nowrap text-lg font-bold tracking-tight">Campus Connect</span>
          </div>

          {/* Search */}
          <input
            className={`
              w-full
              rounded-full
              px-4 py-2.5 text-sm outline-none
              md:col-span-7 col-span-8
              transition-all
              ${theme === "dark"
                ? "bg-slate-800/60 text-slate-50 placeholder-slate-400 border border-slate-700/50 focus:border-cyan-500/50 focus:bg-slate-800/80"
                : "bg-gray-100/60 text-slate-900 placeholder:text-gray-500 border border-gray-200/50 focus:border-cyan-500/50 focus:bg-gray-100/80"}
            `}
            placeholder="Search posts, threads, people..."
          />

          {/* Create Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            aria-label="Create new post or thread"
            className={`px-4 py-2
            rounded-full hover:scale-105 transition-all
            ${theme === "dark"
                ? "bg-linear-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg shadow-cyan-500/20"
                : "bg-linear-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg shadow-cyan-500/15"}
            text-white col-span-1 flex items-center gap-2 justify-center
            h-12 w-12 ml-auto mr-2 cursor-pointer transition-all`}
          >
            <Plus className="scale-150" />
          </button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Mobile Sidebar - Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 bottom-0 z-50 w-64 transform transition-transform duration-300 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <Sidebar onItemClick={() => setIsSidebarOpen(false)} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <Suspense fallback={null}>
          <CreateModal
            onClose={() => setIsCreateOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}
