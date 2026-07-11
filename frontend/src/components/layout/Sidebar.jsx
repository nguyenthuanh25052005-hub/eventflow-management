import {
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiClipboard,
  FiLayers,
  FiBarChart2,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

import "./Sidebar.css";

const menus = [
  { icon: <FiGrid />, label: "Dashboard" },
  { icon: <FiUsers />, label: "Users" },
  { icon: <FiBriefcase />, label: "Employees" },
  { icon: <FiLayers />, label: "Event Types" },
  { icon: <FiClipboard />, label: "Requests" },
  { icon: <FiCalendar />, label: "Events" },
  { icon: <FiBarChart2 />, label: "Reports" },
  { icon: <FiSettings />, label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">

        <div className="logo-icon">EF</div>

        <div>

          <h2>EventFlow</h2>

          <span>Management</span>

        </div>

      </div>

      <nav>

        {menus.map((item) => (
          <button key={item.label} className="menu-item">
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

      </nav>

      <button className="logout">

        <FiLogOut />

        Logout

      </button>

    </aside>
  );
}