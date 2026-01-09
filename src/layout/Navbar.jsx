import { useState, lazy, Suspense } from "react";
import { useUserStore } from "../store/useUserStore";
import { Plus, Handshake } from "lucide-react";

// Lazy load modal to reduce initial bundle size
const CreateModal = lazy(() => import("../components/modals/CreateModal"));

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const theme = useUserStore((state) => state.theme);

  return (
    <>
      <header className={`${theme === "dark" ? "bg-gray-800 border-b border-gray-700 text-white" : "bg-white border-b border-gray-200 text-black"}`}>
        <div
          className="
            max-w-7xl mx-auto px-4 py-3
            grid grid-cols-10
            gap-3 items-center
          "
        >
          {/* Logo */}
          <div className={`flex items-center gap-2 font-semibold shrink-0 col-span-1 ${theme === "dark" ? "text-white" : "text-black"}`}>
            <Handshake size={32} />
            <span className="hidden sm:block">Campus Connect</span>
          </div>

          {/* Search */}
          <input
            className={`
               w-full
            rounded-full
            px-4 py-2 text-sm outline-none
            col-span-8
              ${theme === "dark" ? "bg-gray-700 text-white placeholder-gray-300" : "bg-gray-100 text-black placeholder:text-gray-500"}
              `}
            placeholder="Search posts, threads, people..."
          />

          {/* Create Button */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Create new post or thread"
            className="shrink-0 px-4 py-2
            rounded-full bg-gradient-to-r from-indigo-500 to-purple-500
            hover:from-indigo-600 hover:to-purple-600
            text-white text-sm font-medium
            col-span-1 flex items-center gap-2 justify-center
            h-12 w-12 ml-auto mr-1
            "
          >
            <Plus />
          </button>
        </div>
      </header>

      {/* Create Modal */}
      {open && (
        <Suspense fallback={null}>
          <CreateModal onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
