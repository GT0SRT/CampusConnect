import { NavLink } from "react-router-dom";
import { House } from 'lucide-react';
import { UserCog } from 'lucide-react';
import { MessageCircleQuestionMark } from 'lucide-react';

const Item = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center text-xs ${
        isActive ? "text-blue-600" : "text-gray-500"
      }`
    }
  >
    <span className="text-lg">{icon}</span>
    {label}
  </NavLink>
);

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white flex justify-around py-2 md:hidden z-50">
      <Item to="/" label="Home" icon={<House />} />
      <Item to="/threads" label="Threads" icon={<MessageCircleQuestionMark />} />
      <Item to="/profile" label="Profile" icon={<UserCog />} />
    </nav>
  );
}