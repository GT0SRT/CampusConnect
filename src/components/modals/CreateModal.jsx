import { useState } from "react";
import CreatePost from "./CreatePost";

export default function CreateModal({ onClose, onPostCreated }) {
  const [type, setType] = useState("post"); // 'post' or 'thread'

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 transform transition-all scale-100">
        
        {/* Header Title */}
        <h2 className="text-xl font-bold text-gray-800 text-center mb-6">Create New</h2>

        {/* Custom Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          {["post", "thread"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                type === t
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content Switcher */}
        {type === "post" ? (
          <CreatePost onClose={onClose} onPostCreated={onPostCreated} />
        ) : (
          /* THREAD FORM (Placeholder for now) */
          <div className="space-y-4 mt-4 animate-in fade-in duration-300">
            <div>
              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                placeholder="Thread Title (e.g., 'How to solve...')"
              />
            </div>
            <div>
              <textarea
                rows={5}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                placeholder="Describe your discussion in detail..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={onClose} 
                className="px-5 py-2 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-full transition"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full text-sm shadow-sm transition">
                Post Thread
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}