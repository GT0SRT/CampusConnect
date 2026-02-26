import { useUserStore } from "../../store/useUserStore";
import SimpleEditor from "../threads/SimpleEditor"; // Ensure this path is correct
import { useCreateThreadController } from "../../hooks/useCreateThreadController";

export default function CreateThread({ onClose, onThreadCreated }) {
  const { user } = useUserStore();
  const theme = useUserStore((state) => state.theme);
  const {
    title,
    setTitle,
    category,
    setCategory,
    customCategory,
    setCustomCategory,
    setContent,
    loading,
    handleSubmit,
  } = useCreateThreadController({ user, onClose, onThreadCreated });

  return (
    <div className={`space-y-4 mt-4 animate-in fade-in duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>

      {/* Top Inputs: Category & Title */}
      <div>
        <select
          className={`w-full rounded-lg p-3 text-sm mb-3 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="" disabled>Select Category</option>
          <option value="Doubt">Doubt</option>
          <option value="Discussion">Discussion</option>
          <option value="Resource">Resource</option>
          <option value="other">Other</option>
        </select>

        {/* Conditional Input for 'Other' */}
        {category === "other" && (
          <input
            className={`w-full mb-3 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white placeholder:text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500'}`}
            placeholder="Specify Category (e.g., 'General', 'Help')"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        )}

        <input
          className={`w-full rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white placeholder:text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500'}`}
          placeholder="Thread Title (e.g., 'How to solve...')"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Rich Text Editor */}
      <div>
        <SimpleEditor
          onChange={(html) => setContent(html)}
          placeholder="Describe your discussion in detail... (You can add images, bold text, etc.)"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-2">
        <button
          onClick={onClose}
          disabled={loading}
          className={`px-5 py-2 font-medium text-sm rounded-full transition ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-2 text-white font-medium rounded-full text-sm shadow-sm transition disabled:opacity-50 ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? "Posting..." : "Post Thread"}
        </button>
      </div>
    </div>
  );
}