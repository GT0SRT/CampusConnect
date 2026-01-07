// import { useState } from "react";
// import { useUserStore } from "./useUserStore";

// export default function Settings() {
//    const theme = useUserStore((state) => state.theme);
//   const toggleTheme = useUserStore((state) => state.toggleTheme);
//   const [privateAccount, setPrivateAccount] = useState(false);

//   return (
//     <div className="space-y-6">
//       <h2 className="text-lg font-semibold">Settings</h2>

//       <SettingToggle
//         label="Dark Mode"
//         description="Reduce eye strain in low light"
//         value={dark}
//         onChange={() => setDark(!dark)}
//       />

//       <SettingToggle
//         label="Private Account"
//         description="Only approved followers can see posts"
//         value={privateAccount}
//         onChange={() => setPrivateAccount(!privateAccount)}
//       />

//       <div className="bg-white rounded-xl p-4">
//         <button className="text-red-600 text-sm font-medium">
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }

// function SettingToggle({ label, description, value, onChange }) {
//   return (
//     <div className="bg-white rounded-xl p-4 flex items-center justify-between">
//       <div>
//         <p className="font-medium">{label}</p>
//         <p className="text-sm text-gray-500">{description}</p>
//       </div>

//       <button
//         onClick={onChange}
//         className={`w-12 h-6 rounded-full relative transition ${
//           value ? "bg-blue-600" : "bg-gray-300"
//         }`}
//       >
//         <span
//           className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${
//             value ? "right-0.5" : "left-0.5"
//           }`}
//         />
//       </button>
//     </div>
//   );
// }









export default function Settings() {
  const theme = useUserStore((state) => state.theme);
  const toggleTheme = useUserStore((state) => state.toggleTheme);
  const [privateAccount, setPrivateAccount] = useState(false);

  const isDark = theme === 'dark';

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={`min-h-screen p-6 transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className={`text-lg font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Settings
        </h2>

        <SettingToggle
          label="Dark Mode"
          description="Reduce eye strain in low light"
          value={isDark}
          onChange={toggleTheme}
          isDark={isDark}
        />

        <SettingToggle
          label="Private Account"
          description="Only approved followers can see posts"
          value={privateAccount}
          onChange={() => setPrivateAccount(!privateAccount)}
          isDark={isDark}
        />

        <div className={`rounded-xl p-4 transition-colors ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <button className="text-red-600 text-sm font-medium hover:text-red-700 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, value, onChange, isDark }) {
  return (
    <div className={`rounded-xl p-4 flex items-center justify-between transition-colors ${
      isDark ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div>
        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {label}
        </p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>

      <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full relative transition-all ${
          value ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
            value ? "right-0.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}