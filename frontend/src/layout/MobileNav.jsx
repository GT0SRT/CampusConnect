import { NavLink } from "react-router-dom";
import { House } from 'lucide-react';
import { UserCog } from 'lucide-react';
import { MessageCircleQuestionMark } from 'lucide-react';
import { useUserStore } from "../store/useUserStore";

const Item = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center text-xs font-medium ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`
    }
  >
    <span className="text-lg">{icon}</span>
    {label}
  </NavLink>
);

export default function MobileNav() {
  const theme = useUserStore((state) => state.theme);
  return (
    <nav className={`fixed bottom-0 inset-x-0 flex justify-around py-2 md:hidden z-50 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
      <Item to="/" label="Home" icon={<House />} />
      <Item to="/threads" label="Threads" icon={<MessageCircleQuestionMark />} />
      <Item to="/profile" label="Profile" icon={<UserCog />} />
    </nav>
  );
}