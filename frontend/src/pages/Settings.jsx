import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const { user, theme, toggleTheme, clearUser } = useUserStore();
  const [privateAccount, setPrivateAccount] = useState(false);

  const handleLogout = async () => {
    try {
      await Promise.resolve();
      clearUser();
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={`space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-40 transition-colors ${theme === 'dark' ? 'bg-transparent' : 'bg-transparent'
      }`}>
      <div className={`rounded-xl p-6 space-y-6 border backdrop-blur-xl transition-colors ${theme === 'dark'
        ? 'bg-slate-900/60 border-slate-700/50'
        : 'bg-white/60 border-gray-200/50'
        }`}>
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
          Settings
        </h2>

        {/* Account Section */}
        <div className={`pt-6 border-t ${theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200/50'
          }`}>
          <h3 className={`font-bold text-lg mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
            Account
          </h3>

          {/* Email Display */}
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
              Email
            </label>
            <div className={`mt-2 p-3 rounded-lg text-sm font-medium border backdrop-blur-md transition-colors ${theme === 'dark'
              ? 'bg-slate-800/60 text-slate-200 border-slate-700/50'
              : 'bg-white/60 text-slate-700 border-gray-200/50'
              }`}>
              {user?.email}
            </div>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
              Email cannot be changed.
            </p>
          </div>
        </div>

        {/* Preferences Section */}
        <div className={`pt-6 border-t ${theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200/50'
          }`}>
          <h3 className={`font-bold text-lg mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
            Preferences
          </h3>

          <div className="space-y-4">
            <SettingToggle
              label="Dark Mode"
              description="Reduce eye strain in low light"
              value={theme === "dark"}
              onChange={toggleTheme}
            />

            <SettingToggle
              label="Private Account"
              description="Only approved followers can see posts"
              value={privateAccount}
              onChange={() => setPrivateAccount(!privateAccount)}
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className={`pt-6 border-t ${theme === 'dark' ? 'border-red-500/30' : 'border-red-200/50'
          }`}>
          <h3 className={`font-bold text-lg mb-4 text-red-600`}>
            Danger Zone
          </h3>
          <button
            onClick={handleLogout}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${theme === 'dark'
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
              : 'bg-red-50/60 text-red-700 hover:bg-red-100/60 border border-red-200/50'
              }`}
          >
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, value, onChange }) {
  const theme = useUserStore((state) => state.theme);
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${theme === 'dark'
      ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60'
      : 'bg-white/40 border-gray-200/50 hover:bg-white/60'
      }`}>
      <div>
        <p className={`font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
          {label}
        </p>
        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>

      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-all flex items-center ${value
          ? 'bg-cyan-500'
          : theme === 'dark'
            ? 'bg-slate-700'
            : 'bg-gray-300'
          }`}
      >
        <span
          className={`w-5 h-5 bg-white rounded-full transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'
            }`}
        />
      </button>
    </div>
  );
}