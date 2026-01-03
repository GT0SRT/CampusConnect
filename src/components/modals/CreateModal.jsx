import { useState } from "react";

export default function CreateModal({ onClose }) {
  const [type, setType] = useState("post");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6">

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {["post", "thread"].map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-full text-sm ${
                type === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              Create {t}
            </button>
          ))}
        </div>

        {type === "post" ? (
          <textarea
            rows={4}
            className="w-full border rounded-lg p-3 text-sm"
            placeholder="What's happening on campus?"
          />
        ) : (
          <>
            <input
              className="w-full border rounded-lg p-3 text-sm mb-2"
              placeholder="Thread title"
            />
            <textarea
              rows={3}
              className="w-full border rounded-lg p-3 text-sm"
              placeholder="Describe your doubt..."
            />
          </>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-sm">Cancel</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm">
            Post
          </button>
        </div>
      </div>
    </div>
  );
}