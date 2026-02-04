import { useState } from "react";
import { useUserStore } from "../store/useUserStore";

export default function Settings() {
  const theme = useUserStore((state) => state.theme);
  const toggleTheme = useUserStore((state) => state.toggleTheme);
  const [privateAccount, setPrivateAccount] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Settings</h2>

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

      <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <button className="text-red-600 text-sm font-medium">
          Logout
        </button>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, value, onChange }) {
  const theme = useUserStore((state) => state.theme);
  return (
    <div className={`rounded-xl p-4 flex items-center justify-between ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div>
        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{label}</p>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
      </div>

      <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full relative transition ${value ? "bg-blue-600" : "bg-gray-300"
          }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${value ? "right-0.5" : "left-0.5"
            }`}
        />
      </button>
    </div>
  );
}