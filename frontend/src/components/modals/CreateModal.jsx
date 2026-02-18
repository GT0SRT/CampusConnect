import { useState } from "react";
import { useUserStore } from "../../store/useUserStore";
import CreatePost from "./CreatePost";
import CreateThread from "./CreateThread";

export default function CreateModal({ onClose, onPostCreated, onThreadCreated }) {
  const [type, setType] = useState("post");
  const theme = useUserStore((state) => state.theme);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto overflow-x-hidden">
      <div className={`${theme === 'dark'
          ? 'bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl'
          : 'bg-white/80 border border-gray-200/50 backdrop-blur-xl'
        } w-full max-w-lg rounded-2xl shadow-2xl p-6 transform transition-all scale-100`}>

        {/* Header Title */}
        <h2 className={`text-xl font-bold text-center mb-6 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Create New</h2>

        {/* Custom Tabs */}
        <div className={`flex p-1 rounded-xl mb-6 transition-all ${theme === 'dark'
            ? 'bg-slate-800/60'
            : 'bg-gray-100/60'
          }`}>
          {["post", "thread"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${type === t
                  ? `${theme === 'dark'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-cyan-100/50 text-cyan-700 border border-cyan-200/50'}`
                  : `${theme === 'dark'
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'}`
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {type === "post" ? (
          <CreatePost onClose={onClose} onPostCreated={onPostCreated} />
        ) : (
          <CreateThread onClose={onClose} onThreadCreated={onThreadCreated || onPostCreated} />
        )}
      </div>
    </div>
  );
}