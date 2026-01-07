import { useState } from "react";
import CreateModal from "../components/modals/CreateModal";
import { Plus } from "lucide-react";
import { Handshake } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div
          className="
            max-w-7xl mx-auto px-4 py-3
            grid grid-cols-10
            gap-3 items-center
          "
        >
          {/* Logo */}
          <div className="flex items-center gap-2 font-semibold shrink-0 col-span-1 text-gray-900">
            <Handshake size={32} />
            <span className="hidden sm:block">Campus Connect</span>
          </div>

          {/* Search */}
          <input
            className="
               w-full
    bg-gray-100
    placeholder:text-gray-500 dark:placeholder:text-gray-400
    rounded-full
    px-4 py-2 text-sm outline-none
    col-span-8
            "
            placeholder="Search posts, threads, people..."
          />

          {/* Create Button */}
          <button
            onClick={() => setOpen(true)}
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
      {open && <CreateModal onClose={() => setOpen(false)} />}
    </>
  );
}
