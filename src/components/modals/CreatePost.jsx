import { useState } from "react";
import { createPost } from "../../services/postService";
import { useUserStore } from "../../store/useUserStore";

export default function CreatePost({ onClose, onPostCreated }) {
  const { user } = useUserStore();
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("");
  const theme = useUserStore((state) => state.theme);
  const styles = ["concise", "professional", "funny", "friendly", "motivational", "sarcastic"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // Strip data URI header if present
        const base64 = typeof result === "string" ? result.split(",")[1] || result : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGenerateCaption = async () => {
    if (!imageFile) {
      alert("Please select an image first to generate a caption.");
      return;
    }
    try {
      setAiLoading(true);
      const base64 = await fileToBase64(imageFile);
      const apiUrl = import.meta.env.VITE_CAPTION_API_URL;
      if (!apiUrl) throw new Error("Caption API URL not configured");
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, instruction: selectedStyle })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Failed to generate caption");
      }
      const data = await res.json();
      setCaption(data.caption || "");
    } catch (err) {
      console.error(err);
      alert(err.message || "Caption generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const uploadToCloudinary = async () => {
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );
    const fileData = await res.json();
    return fileData.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.name || !user.campus || !user.branch || !user.batch) {
      return alert(
        "Please complete your profile first (name, campus, branch, and batch are required)."
      );
    }

    if (!imageFile) return alert("Please select an image!");
    if (!user) return alert("User profile not loaded. Please refresh.");

    setLoading(true);
    try {
      const imageUrl = await uploadToCloudinary();
      await createPost(user.uid, imageUrl, caption, user);

      if (onPostCreated) onPostCreated();
      onClose();
    } catch (error) {
      console.error("Post failed", error);
      alert("Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-gray-900 ">
      {/* Image Preview Area */}
      <div className="border-2 border-dashed border-gray-300  rounded-xl bg-gray-50  text-center cursor-pointer hover:bg-gray-100  transition relative h-52 flex items-center justify-center overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="text-gray-400 flex flex-col items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            <span className="text-sm font-medium ">
              Click to upload photo
            </span>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>

      {/* AI Caption Tools */}
      <div className="grid grid-cols-5">
        <div className="col-span-4 flex overflow-x-auto [&::-webkit-scrollbar]:hidden gap-2">
          {styles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedStyle(style)}
              className={
                `px-1 rounded-xl text-xs border transition ` +
                (selectedStyle === style
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200")
              }
              aria-pressed={selectedStyle === style}
            >
              {style}
            </button>
          ))}
        </div>
        <div>
          <button
            type="button"
            onClick={handleGenerateCaption}
            disabled={aiLoading || !imageFile}
            className="px-4 py-2 rounded-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {aiLoading ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>

      {/* Caption */}
      <textarea
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows="3"
        className="w-full border-gray-200 bg-gray-50   border p-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 text-gray-600 font-medium text-sm hover:bg-gray-100  rounded-full transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-full text-sm disabled:opacity-50 transition shadow-sm"
        >
          {loading ? "Posting..." : "Share Post"}
        </button>
      </div>
    </form>
  );
}
