import { useCreatePostController } from "../../hooks/useCreatePostController";
import { useUserStore } from "../../store/useUserStore";

export default function CreatePost({ onClose, onPostCreated }) {
  const { user } = useUserStore();
  const {
    styles,
    caption,
    setCaption,
    imageFile,
    previewUrl,
    loading,
    aiLoading,
    selectedStyle,
    setSelectedStyle,
    handleImageChange,
    clearImage,
    handleGenerateCaption,
    handleSubmit,
  } = useCreatePostController({ user, onClose, onPostCreated });
  const theme = useUserStore((state) => state.theme);

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 mt-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Image Preview Area - Matches actual post display */}
      <div className={`border-2 border-dashed rounded-xl text-center cursor-pointer transition relative overflow-hidden ${previewUrl ? 'aspect-4/3' : 'h-52 flex items-center justify-center'} ${theme === 'dark' ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
        {previewUrl ? (
          <div className="w-full h-full relative group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => document.querySelector("#create-post-file-input")?.click()}
                className="px-3 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                aria-label="Replace image"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
                aria-label="Remove image"
              >
                ✕ Remove
              </button>
            </div>
          </div>
        ) : (
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
        )}

        <input
          id="create-post-file-input"
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
