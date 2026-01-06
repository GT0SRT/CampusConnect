import { useState } from "react";
import { useUserStore } from "../../store/useUserStore";
import { CreateThread as createThreadService } from "../../services/threadService";
import SimpleEditor from "../threads/SimpleEditor"; // Ensure this path is correct

export default function CreateThread({ onClose, onThreadCreated }) {
  const { user } = useUserStore();

  // Form States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [content, setContent] = useState(""); // Stores HTML from Tiptap
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // 1. Validation
    if (!user) return alert("Please log in to create a thread.");

    // Check profile completion
    if (!user.name || !user.campus || !user.branch || !user.batch || !user.profile_pic) {
      return alert("Please complete your profile first (name, campus, branch, batch, and profile picture are required).");
    }

    if (!title.trim()) return alert("Please enter a title.");
    if (!category) return alert("Please select a category.");
    if (category === "other" && !customCategory.trim()) return alert("Please specify the category.");

    // Check if content is empty (Tiptap usually leaves <p></p> when empty)
    if (!content || content === "<p></p>") return alert("Please add a description.");

    setLoading(true);

    try {
      // Determine final category string
      const finalCategory = category === "other" ? customCategory : category;

      // 2. Call Service
      await createThreadService(
        user.uid,
        title,
        content, // Pass the HTML string
        finalCategory,
        user // Pass user object for snapshot
      );

      // 3. Success Callback & Close
      if (onThreadCreated) onThreadCreated(); // Refresh feed if parent passed this
      onClose();

    } catch (error) {
      console.error("Thread creation failed:", error);
      alert("Failed to create thread.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4 animate-in fade-in duration-300">

      {/* Top Inputs: Category & Title */}
      <div>
        <select
          className="w-full border border-gray-200 rounded-lg p-3 text-sm mb-3 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
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
            className="w-full bg-gray-50 mb-3 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
            placeholder="Specify Category (e.g., 'General', 'Help')"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        )}

        <input
          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
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
          className="px-5 py-2 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-full transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full text-sm shadow-sm transition disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post Thread"}
        </button>
      </div>
    </div>
  );
}