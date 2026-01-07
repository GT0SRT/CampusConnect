import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  Calendar,
  Code,
  MessageCircle,
  Users,
  HelpCircle,
  User,
  Bookmark,
} from "lucide-react";

/* Sidebar Item */
const Item = ({ to, label, Icon, color }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 rounded-xl transition-all
      ${
        isActive
          ? `${color} bg-opacity-20`
          : "text-gray-600 hover:bg-gray-100"
      }`
    }
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm font-medium">{label}</span>
  </NavLink>
);

/* Section Wrapper */
const Section = ({ title, children }) => (
  <div>
    <p className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2">
      {title}
    </p>
    <div className="space-y-1">{children}</div>
  </div>
);

export default function Sidebar() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 space-y-4">

      {/* Home */}
      <Item
        to="/"
        label="Home"
        Icon={Home}
        color="text-blue-600 bg-blue-100"
      />

      {/* Threads */}
      <Item
        to="/threads"
        label="Threads"
        Icon={MessageCircle}
        color="text-blue-600 bg-blue-100"
      />

      {/* Academic */}
      <Section title="Academic">
        <Item
          to="/academics"
          label="Academics"
          Icon={BookOpen}
          color="text-indigo-600 bg-indigo-100"
        />
        <Item
          to="/resources"
          label="Notes & Resources"
          Icon={Bookmark}
          color="text-teal-600 bg-teal-100"
        />
      </Section>

      {/* Campus Life */}
      <Section title="Campus Life">
        <Item
          to="/events"
          label="Events"
          Icon={Calendar}
          color="text-pink-600 bg-pink-100"
        />
        <Item
          to="/hackathons"
          label="Hackathons"
          Icon={Code}
          color="text-orange-600 bg-orange-100"
        />
      </Section>

      {/* Community */}
      <Section title="Community">
        <Item
          to="/confessions"
          label="Confessions"
          Icon={MessageCircle}
          color="text-red-600 bg-red-100"
        />
        <Item
          to="/discussions"
          label="Discussions"
          Icon={Users}
          color="text-cyan-600 bg-cyan-100"
        />
      </Section>

      {/* Personal */}
      <Section title="Personal">
        <Item
          to="/profile"
          label="Profile"
          Icon={User}
          color="text-gray-700 bg-gray-200"
        />
      </Section>

    </div>
  );
}
