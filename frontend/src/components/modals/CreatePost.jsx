import { useState, useRef } from "react";
import { createPost } from "../../services/postService";
import { useUserStore } from "../../store/useUserStore";
import { Crop, ZoomIn, ZoomOut } from "lucide-react";

export default function CreatePost({ onClose, onPostCreated }) {
  const { user } = useUserStore();
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [showCropEditor, setShowCropEditor] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cropContainerRef = useRef(null);
  const theme = useUserStore((state) => state.theme);
  const styles = ["concise", "professional", "funny", "friendly", "motivational", "sarcastic"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowCropEditor(true);
      setCropZoom(1);
      setCropOffset({ x: 0, y: 0 });
    }
  };

  const handleCropMouseDown = (e) => {
    if (!cropContainerRef.current) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleCropMouseMove = (e) => {
    if (!isDragging || !cropContainerRef.current) return;
    const container = cropContainerRef.current;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Calculate maximum allowed offset based on zoom
    const maxX = cropZoom > 1 ? (container.offsetWidth * (cropZoom - 1)) / 2 : 0;
    const maxY = cropZoom > 1 ? (container.offsetHeight * (cropZoom - 1)) / 2 : 0;

    setCropOffset({
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY))
    });
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
  };

  const applyCrop = () => {
    if (!cropContainerRef.current || !previewUrl) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const containerWidth = cropContainerRef.current.offsetWidth;
      const containerHeight = cropContainerRef.current.offsetHeight;

      // Set canvas size to container size
      canvas.width = containerWidth;
      canvas.height = containerHeight;

      // Calculate the scale to fit image in container
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const scale = Math.max(scaleX, scaleY); // Use max to ensure image covers container

      // Calculate scaled dimensions
      const scaledWidth = img.width * scale * cropZoom;
      const scaledHeight = img.height * scale * cropZoom;

      // Calculate centered position
      const x = (containerWidth - scaledWidth) / 2 - cropOffset.x;
      const y = (containerHeight - scaledHeight) / 2 - cropOffset.y;

      // Draw the image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      canvas.toBlob((blob) => {
        const croppedUrl = URL.createObjectURL(blob);
        setPreviewUrl(croppedUrl);
        setImageFile(new File([blob], "cropped-image.jpg", { type: "image/jpeg" }));
        setShowCropEditor(false);
      }, "image/jpeg", 0.95);
    };
    img.src = previewUrl;
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
    <form onSubmit={handleSubmit} className={`space-y-4 mt-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Crop Editor Modal */}
      {showCropEditor && previewUrl && (
        <div className={`border-2 rounded-xl p-4 space-y-3 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crop size={18} />
              <h3 className="font-semibold text-sm">Crop & Adjust Image</h3>
            </div>
            <p className="text-xs opacity-75">Move & Zoom to frame your shot</p>
          </div>

          {/* Crop Canvas */}
          <div
            ref={cropContainerRef}
            className={`relative w-full aspect-[4/3] rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-200'}`}
            onMouseDown={handleCropMouseDown}
            onMouseMove={handleCropMouseMove}
            onMouseUp={handleCropMouseUp}
            onMouseLeave={handleCropMouseUp}
            style={{ userSelect: 'none' }}
          >
            <img
              src={previewUrl}
              alt="Crop preview"
              className="w-full h-full object-cover"
              style={{
                transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                transition: isDragging ? 'none' : 'transform 0.2s',
                transformOrigin: 'center center'
              }}
              draggable={false}
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                const newZoom = Math.max(1, cropZoom - 0.1);
                setCropZoom(newZoom);
                // Reset offset if zoom is at minimum
                if (newZoom === 1) setCropOffset({ x: 0, y: 0 });
              }}
              disabled={cropZoom <= 1}
              className={`p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
              aria-label="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <div className="flex-1 max-w-xs">
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={cropZoom}
                onChange={(e) => {
                  const newZoom = parseFloat(e.target.value);
                  setCropZoom(newZoom);
                  // Reset offset if zoom is at minimum
                  if (newZoom === 1) setCropOffset({ x: 0, y: 0 });
                }}
                className="w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => setCropZoom(Math.min(3, cropZoom + 0.1))}
              disabled={cropZoom >= 3}
              className={`p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
              aria-label="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Crop Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCropEditor(false)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyCrop}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Apply Crop
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Area - Matches actual post display */}
      <div className={`border-2 border-dashed rounded-xl text-center cursor-pointer transition relative overflow-hidden ${previewUrl && !showCropEditor ? 'aspect-[4/3]' : 'h-52 flex items-center justify-center'} ${theme === 'dark' ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
        {previewUrl && !showCropEditor ? (
          <div className="w-full h-full relative group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowCropEditor(true)}
                className="px-3 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                aria-label="Edit image crop"
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                onClick={() => { setImageFile(null); setPreviewUrl(null); }}
                className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
                aria-label="Remove image"
              >
                ✕ Remove
              </button>
            </div>
          </div>
        ) : !showCropEditor ? (
          <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-400'} flex flex-col items-center gap-2`}>
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
            <span className="text-sm font-medium">
              Click to upload photo
            </span>
          </div>
        ) : null}

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
                  ? `${theme === 'dark' ? 'bg-blue-500 text-white border-blue-500' : 'bg-blue-600 text-white border-blue-600'}`
                  : `${theme === 'dark' ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`)
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
            className={`px-4 py-2 rounded-full text-sm font-medium text-white disabled:opacity-50 ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'}`}
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
        className={`w-full border p-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
      />

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          className={`px-5 py-2 font-medium text-sm rounded-full transition ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 text-white font-medium rounded-full text-sm disabled:opacity-50 transition shadow-sm ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? "Posting..." : "Share Post"}
        </button>
      </div>
    </form>
  );
}
