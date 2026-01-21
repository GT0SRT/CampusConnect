import { useState } from "react";
import { useUserStore } from "../../store/useUserStore";
import CreatePost from "./CreatePost";
import CreateThread from "./CreateThread";

export default function CreateModal({ onClose, onPostCreated, onThreadCreated }) {
  const [type, setType] = useState("post");
  const theme = useUserStore((state) => state.theme);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto overflow-x-hidden">
      <div className={`${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} w-full max-w-lg rounded-2xl shadow-2xl p-6 transform transition-all scale-100`}>

        {/* Header Title */}
        <h2 className={`text-xl font-bold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Create New</h2>

        {/* Custom Tabs */}
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} flex p-1 rounded-xl mb-6`}>
          {["post", "thread"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${type === t
                ? `${theme === 'dark' ? 'bg-gray-800 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm'}`
                : `${theme === 'dark' ? 'text-gray-300 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
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