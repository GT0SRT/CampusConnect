import { NavLink } from "react-router-dom";

const Item = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block px-4 py-2 rounded-lg ${
        isActive ? "bg-blue-100 text-blue-600" : "text-gray-700"
      }`
    }
  >
    {label}
  </NavLink>
);

export default function Sidebar() {
  return (
    <div className="bg-white rounded-xl p-4 space-y-2">
      <Item to="/" label="Home" />
      <Item to="/threads" label="Threads" />
      <Item to="/profile" label="Profile" />
    </div>
  );
}
