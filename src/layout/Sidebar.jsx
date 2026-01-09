import { NavLink } from "react-router-dom";
import { Home,  BookOpen,  Calendar,  Code,  MessageCircle,  Users,
  HelpCircle, User,  Bookmark} from "lucide-react";
import { useUserStore } from "../store/useUserStore";

/* Sidebar Item */
const Item = ({ to, label, Icon, activeClasses, theme }) => (
  <NavLink to={to} className={({ isActive }) =>`flex items-center gap-3 px-4 py-2 rounded-xl transition-all
    ${isActive ? `${activeClasses}` : `${theme === 'dark' ?
   'text-gray-300 hover:bg-gray-700' : 'text-black hover:bg-gray-100'}`}`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm font-medium">{label}</span>
  </NavLink>
);

/* Section Wrapper */
const Section = ({ title, children }) => (
  <div>
    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-4 mb-2">
      {title}
    </p>
    <div className="space-y-1">{children}</div>
  </div>
);

export default function Sidebar() {
  const theme = useUserStore((state) => state.theme);
  return (
    <div className={`${theme === "dark" ? "bg-gray-800 text-gray-200" : "bg-white text-black"} rounded-2xl shadow-sm p-3 space-y-4`}>

      {/* Home */}
      <Item
        to="/"
        label="Home"
        Icon={Home}
        activeClasses="text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30"
        theme={theme}
      />

      {/* Threads */}
      <Item
        to="/threads"
        label="Threads"
        Icon={MessageCircle}
        activeClasses="text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30"
        theme={theme}
      />

      {/* Academic */}
      <Section title="Academic">
        <Item
          to="/"
          label="Academics"
          Icon={BookOpen}
          theme={theme}
        />
        <Item
          to="/"
          label="Notes & Resources"
          Icon={Bookmark}
          theme={theme}
        />
      </Section>

      {/* Campus Life */}
      <Section title="Campus Life">
        <Item
          to="/"
          label="Events"
          Icon={Calendar}
          theme={theme}
        />
        <Item
          to="/"
          label="Hackathons"
          Icon={Code}
          theme={theme}
        />
      </Section>

      {/* Community */}
      <Section title="Community">
        <Item
          to="/"
          label="Confessions"
          Icon={MessageCircle}
          theme={theme}
        />
        <Item
          to="/"
          label="Discussions"
          Icon={Users}
          theme={theme}
        />
      </Section>

      {/* Personal */}
      <Section title="Personal">
        <Item
          to="/profile"
          label="Profile"
          Icon={User}
          activeClasses={`${theme === 'dark' ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-100'}`}
          theme={theme}
        />
      </Section>

    </div>
  );
}
