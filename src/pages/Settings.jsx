import { useState } from "react";

export default function Settings() {
  const [dark, setDark] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Settings</h2>

      <SettingToggle
        label="Dark Mode"
        description="Reduce eye strain in low light"
        value={dark}
        onChange={() => setDark(!dark)}
      />

      <SettingToggle
        label="Private Account"
        description="Only approved followers can see posts"
        value={privateAccount}
        onChange={() => setPrivateAccount(!privateAccount)}
      />

      <div className="bg-white rounded-xl p-4">
        <button className="text-red-600 text-sm font-medium">
          Logout
        </button>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, value, onChange }) {
  return (
    <div className="bg-white rounded-xl p-4 flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full relative transition ${
          value ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${
            value ? "right-0.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}