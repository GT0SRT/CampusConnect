import { useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home, Code, ScrollText, User, LogOut, X, Settings as SettingsIcon,
  Handshake, Bot, UsersRound, Brain, ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { logout } from "../services/authService";

const getLinkStyles = (isActive, theme) => {
  const base = "flex items-center gap-3 px-4 py-2 rounded-xl transition-all font-medium text-sm";
  if (isActive) {
    return `${base} ${theme === 'dark'
      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
      : 'bg-cyan-100/50 text-cyan-700 border border-cyan-200/50'}`;
  }
  return `${base} ${theme === 'dark'
    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
    : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100/50'}`;
};

const Item = ({ to, label, Icon, theme, onItemClick, end = false }) => (
  <NavLink to={to} end={end} onClick={onItemClick} className={({ isActive }) => getLinkStyles(isActive, theme)}>
    {Icon && <Icon className="w-5 h-5" />}
    <span>{label}</span>
  </NavLink>
);

export default function Sidebar({ onItemClick, onClose }) {
  const navigate = useNavigate();
  const theme = useUserStore((state) => state.theme);
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const { pathname } = useLocation();
  const isAiActive = pathname.toLowerCase().startsWith("/interview");
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  const isMenuOpen = isPinned || isHovered;
  const isMobileDrawer = typeof onClose === "function";
  const profileUsername = user?.username || user?.email?.split("@")[0] || "me";
  const profileRoute = `/profile/${profileUsername}`;

  const handleHover = (open) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (open) setIsHovered(true);
    else timerRef.current = setTimeout(() => setIsHovered(false), 220);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
    } finally {
      localStorage.removeItem("auth-token");
      clearUser();
      if (onItemClick) onItemClick();
      navigate("/auth", { replace: true });
    }
  };

  return (
    <div
      className={`h-full w-full md:rounded-2xl p-4 space-y-4 flex flex-col transition-all ${isMobileDrawer
        ? `${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'} opacity-100`
        : `glass-surface ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`
        }`}
    >
      <div className="flex md:hidden mb-10 justify-between items-center">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 shadow-lg shadow-cyan-500/20">
            <Handshake className="h-5 w-5 text-slate-50" />
          </div>
          <span className="text-lg font-bold tracking-tight">Campus Connect</span>
        </div>
        <button onClick={onClose} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}><X size={24} /></button>
      </div>

      <Item to="/home" label="Home" Icon={Home} theme={theme} onItemClick={onItemClick} />
      <Item to="/threads" label="Threads" Icon={ScrollText} theme={theme} onItemClick={onItemClick} />
      <Item to="/matchmaker" label="AI Matchmaker" Icon={Bot} theme={theme} onItemClick={onItemClick} />
      <Item to="/squad" label="Squad" Icon={UsersRound} theme={theme} onItemClick={onItemClick} />
      <Item to="/AI-assessment" label="AI Assessment" Icon={Code} theme={theme} onItemClick={onItemClick} />

      <div >
        <div className={getLinkStyles(isAiActive, theme)}>
          <NavLink to="/interview" onClick={onItemClick} className="flex flex-1 items-center gap-3">
            <Brain className="w-5 h-5" />
            <span>AI Interview</span>
          </NavLink>
          <button
            onClick={(e) => { e.preventDefault(); setIsPinned(!isPinned); }}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
            className={`ml-2 rounded-md p-1 transition ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className={`ml-8 mt-1 space-y-1 overflow-hidden origin-top transition-all duration-300 ease-out 
          ${isMenuOpen ? 'max-h-40 scale-y-100 opacity-100' : 'max-h-0 scale-y-95 opacity-0'}`}>
          <Item to="/interview/join" label="Quick Interview" theme={theme} onItemClick={onItemClick} end />
          <Item to="/interview/history" label="Interview History" theme={theme} onItemClick={onItemClick} />
        </div>
      </div>

      <Item to={profileRoute} label="Profile" Icon={User} theme={theme} onItemClick={onItemClick} />
      <Item to="/settings" label="Settings" Icon={SettingsIcon} theme={theme} onItemClick={onItemClick} />

      <div className={`mt-auto pt-4 border-t ${theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200/50'} px-2`}>
        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition ${theme === 'dark'
            ? 'text-red-400 hover:bg-red-500/10'
            : 'text-red-600 hover:bg-red-50'}`}
        >
          <span>Logout</span>
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}