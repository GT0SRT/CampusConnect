import { NavLink } from "react-router-dom";
import { House } from 'lucide-react';
import { UserCog } from 'lucide-react';
import { MessageCircleQuestionMark } from 'lucide-react';
import { useUserStore } from "../store/useUserStore";

const Item = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${isActive ? "text-cyan-500" : "text-slate-500 hover:text-slate-400"}`
    }
  >
    <span className="text-lg">{icon}</span>
    {label}
  </NavLink>
);

export default function MobileNav() {
  const theme = useUserStore((state) => state.theme);
  return (
    <nav className={`fixed bottom-0 inset-x-0 flex justify-around px-4 py-3 md:hidden z-50 transition-all duration-300 ${theme === "dark"
        ? "bg-slate-900/80 border-t border-slate-700/50 backdrop-blur-xl"
        : "bg-white/80 border-t border-gray-200/50 backdrop-blur-xl"
      }`}>
      <Item to="/home" label="Home" icon={<House />} />
      <Item to="/threads" label="Threads" icon={<MessageCircleQuestionMark />} />
      <Item to="/profile" label="Profile" icon={<UserCog />} />
    </nav>
  );
}