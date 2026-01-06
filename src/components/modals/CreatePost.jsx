import { useState } from "react";
import { createPost } from "../../services/postService";
import { useUserStore } from "../../store/useUserStore";

export default function CreatePost({ onClose, onPostCreated }) {
  const { user } = useUserStore();
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async () => {
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: data,
    });
    const fileData = await res.json();
    return fileData.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check profile completion first (photo optional)
    if (!user.name || !user.campus || !user.branch || !user.batch) {
      return alert("Please complete your profile first (name, campus, branch, and batch are required).");
    }

    if (!imageFile) return alert("Please select an image!");

    // Safety check: Ensure we have the user profile data needed for filtering
    if (!user) return alert("User profile not loaded. Please refresh.");

    setLoading(true);
    try {
      // 1. Upload Image
      const imageUrl = await uploadToCloudinary();

      // 2. Create Post (Passing 'user' object as 4th arg for filters)
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
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {/* Image Preview Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center cursor-pointer hover:bg-gray-100 transition relative h-52 flex items-center justify-center overflow-hidden">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
        ) : (
          <div className="text-gray-400 flex flex-col items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span className="text-sm font-medium">Click to upload photo</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>

      <textarea
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full border-gray-200 bg-gray-50 border p-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
        rows="3"
      />

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-full transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full text-sm disabled:opacity-50 transition shadow-sm"
        >
          {loading ? "Posting..." : "Share Post"}
        </button>
      </div>
    </form>
  );
}