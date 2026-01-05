import { useState } from "react";
import CreatePost from "./CreatePost";
import CreateThread from "./CreateThread";

export default function CreateModal({ onClose, onPostCreated }) {
  const [type, setType] = useState("post");  

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto overflow-x-hidden">
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

        {type === "post" ? (
          <CreatePost onClose={onClose} onPostCreated={onPostCreated} />
        ) : (
          <CreateThread onClose={onClose} onThreadCreated={onPostCreated} />        
        )}
      </div>
    </div>
  );
}