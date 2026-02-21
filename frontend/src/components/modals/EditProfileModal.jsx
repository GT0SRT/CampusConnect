import { useUserStore } from "../../store/useUserStore";
import { X } from "lucide-react";
import { useEditProfileController } from "../../hooks/useEditProfileController";

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const theme = useUserStore((state) => state.theme);
  const {
    loading,
    formData,
    previewUrl,
    handleChange,
    handleImageChange,
    handleRemovePhoto,
    handleSubmit,
  } = useEditProfileController({ user, onClose, onUpdate });

  return (
    <div className={`fixed inset-0 h-screen mb-16 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200 ${theme === 'dark' ? 'bg-black/60' : 'bg-black/40'
      }`}>
      <div className={`rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl [&::-webkit-scrollbar]:hidden animate-in zoom-in-95 duration-200 transition-all ${theme === 'dark'
        ? 'bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl'
        : 'bg-white/80 border border-gray-200/50 backdrop-blur-xl'
        }`}>

        {/* Header with gradient */}
        <div className={`top-0 p-6 rounded-t-2xl border-b transition-colors ${theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200/50'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Edit Profile</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close edit profile"
              className={`rounded-full p-2 transition ${theme === 'dark'
                ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'
                : 'hover:bg-gray-100/50 text-slate-600 hover:text-slate-900'
                }`}
            ><X />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`p-6 space-y-6 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
          {/* Profile Photo Section */}
          <div className={`flex flex-col items-center gap-4 py-4 rounded-xl p-6 transition-all ${theme === 'dark'
            ? 'bg-slate-800/60'
            : 'bg-blue-50/50'
            }`}>
            <div className="relative group">
              <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-lg ring-2 transition-all ${theme === 'dark'
                ? 'bg-slate-700 border-slate-800 ring-slate-600'
                : 'bg-gray-100 border-white ring-blue-200'
                }`}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex flex-col items-center justify-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                    <svg className="w-12 h-12 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs">No Photo</span>
                  </div>
                )}
              </div>
              {/* Edit icon overlay */}
              <label className="absolute bottom-0 right-0 bg-cyan-500 text-white p-2.5 rounded-full cursor-pointer hover:bg-cyan-600 transition shadow-lg">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            </div>
            {previewUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                aria-label="Remove profile photo"
                className={`text-sm font-medium hover:underline transition ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
                  }`}
              >
                Remove Photo
              </button>
            )}
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <label className={`flex items-center gap-2 text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>
              <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border rounded-xl p-3 transition focus:outline-none focus:ring-2 focus:ring-cyan-500/30 ${theme === 'dark'
                ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 placeholder:text-slate-400 focus:border-cyan-500/50'
                : 'bg-gray-50/60 border-gray-200/50 text-slate-900 placeholder:text-slate-500 focus:border-cyan-500/50'
                }`}
              required
            />
          </div>

          {/* Two Column Layout for Campus/Branch */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Campus */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}>
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Campus <span className="text-red-500">*</span>
              </label>
              <input
                name="campus"
                placeholder="e.g., Mumbai, Delhi"
                value={formData.campus}
                onChange={handleChange}
                className={`w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white placeholder:text-gray-500'}`}
                required
              />
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Branch <span className="text-red-500">*</span>
              </label>
              <input
                name="branch"
                placeholder="e.g., CSE, ECE, ME"
                value={formData.branch}
                onChange={handleChange}
                className={`w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white placeholder:text-gray-500'}`}
                required
              />
            </div>
          </div>

          {/* Batch Field */}
          <div className="space-y-2">
            <label className={`flex items-center gap-2 text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Batch Year <span className="text-red-500">*</span>
            </label>
            <input
              name="batch"
              placeholder="e.g., 2024, 2025, 2026"
              value={formData.batch}
              onChange={handleChange}
              className={`w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white placeholder:text-gray-500'}`}
              required
            />
          </div>

          {/* Bio Field */}
          <div className="space-y-2">
            <label className={`flex items-center gap-2 text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Bio <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <textarea
              name="bio"
              placeholder="Tell something about yourself..."
              value={formData.bio}
              onChange={handleChange}
              className={`w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition resize-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white placeholder:text-gray-500'}`}
              rows="4"
            />
          </div>

          <div className={`flex items-center gap-1.5 text-xs p-3 rounded-lg border ${theme === 'dark' ? 'text-gray-300 bg-gray-700 border-gray-600' : 'text-gray-500 bg-blue-50 border-blue-100'}`}>
            <svg className="w-4 h-4 text-cyan-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Fields marked with <span className="text-red-500 font-semibold">*</span> are required</span>
          </div>

          {/* Action Buttons */}
          <div className={`flex gap-3 pt-4 ${theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cancel editing"
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${theme === 'dark' ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              aria-label="Save profile changes"
              className={`flex-1 px-6 py-3 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg ${theme === 'dark'
                ? 'bg-linear-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-cyan-500/20'
                : 'bg-linear-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-cyan-500/30'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}