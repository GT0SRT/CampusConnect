import { NavLink } from "react-router-dom";
import {
  Home, BookOpen, Calendar, Code, MessageCircle, Users,
  HelpCircle, User, Bookmark, LogOut, X, Settings as SettingsIcon,
  Handshake
} from "lucide-react";
import { useUserStore } from "../store/useUserStore";

/* Sidebar Item */
const Item = ({ to, label, Icon, theme, onItemClick }) => (
  <NavLink
    to={to}
    onClick={onItemClick}
    className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-xl transition-all font-medium ${isActive
      ? theme === 'dark'
        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
        : 'bg-cyan-100/50 text-cyan-700 border border-cyan-200/50'
      : theme === 'dark'
        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100/50'
      }`}
  >
    {Icon && <Icon className="w-5 h-5" />}
    <span className="text-sm">{label}</span>
  </NavLink>
);

export default function Sidebar({ onItemClick, onClose }) {
  const theme = useUserStore((state) => state.theme);

  return (
    <div className={`glass-surface h-full w-full md:rounded-2xl p-4 space-y-4 transition-all duration-300 flex flex-col ${theme === 'dark'
      ? 'text-slate-100'
      : 'text-slate-900'}`}>

      <div className="flex md:hidden mb-10">
        <div className={`flex items-center gap-2 font-semibold shrink-0 transition-all
         md:col-span-2 col-span-1`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 transition-transform hover:scale-110 shadow-lg shadow-cyan-500/20">
            <Handshake className="h-5 w-5 text-slate-50" />
          </div>
          <span className="whitespace-nowrap text-lg font-bold tracking-tight">Campus Connect</span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className={`self-end p-2 rounded-lg ml-auto transition ${theme === 'dark'
            ? 'text-slate-300 hover:bg-slate-800/60'
            : 'text-gray-600 hover:bg-gray-100/60'
            }`}
        >
          <X size={24} />
        </button>
      </div>

      {/* Home */}
      <Item
        to="/home"
        label="Home"
        Icon={Home}
        theme={theme}
        onItemClick={onItemClick}
      />

      {/* Threads */}
      <Item
        to="/threads"
        label="Threads"
        Icon={MessageCircle}
        theme={theme}
        onItemClick={onItemClick}
      />

      <Item
        to="/matchmaker"
        label="AI Matchmaker"
        Icon={Users}
        theme={theme}
        onItemClick={onItemClick}
      />

      <Item
        to="/AI-assessment"
        label="AI Assessment"
        Icon={Code}
        theme={theme}
        onItemClick={onItemClick}
      />

      <Item
        to="/AI-interview"
        label="AI Interview"
        Icon={BookOpen}
        theme={theme}
        onItemClick={onItemClick}
      />

      <Item
        to="/profile"
        label="Profile"
        Icon={User}
        theme={theme}
        onItemClick={onItemClick}
      />

      <Item
        to="/settings"
        label="Settings"
        Icon={SettingsIcon}
        theme={theme}
        onItemClick={onItemClick}
      />

      <div className={`mt-auto pt-4 border-t ${theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200/50'} pl-5`}>
        <button
          className="text-red-600 text-sm font-semibold mr-2 items-center gap-2 inline"
        >Logout
        </button>
        <LogOut className="w-4 h-4 text-red-600 inline" />
      </div>
    </div>
  );
}
