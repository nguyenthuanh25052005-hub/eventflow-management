import { NavLink } from "react-router-dom";

import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListTodo,
  Palette,
  Settings,
  UserRoundCog,
  Users,
} from "lucide-react";

import "./Sidebar.css";

const menuItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN"],
  },

  {
    title: "Người dùng",
    path: "/users",
    icon: Users,
    roles: ["ADMIN"],
  },

  {
    title: "Nhân viên",
    path: "/employees",
    icon: UserRoundCog,
    roles: ["ADMIN"],
  },

  {
    title: "Yêu cầu sự kiện",
    path: "/event-requests",
    icon: CalendarCheck,
    roles: ["ADMIN", "EVENT_MANAGER"],
  },

  {
    title: "Công việc",
    path: "/tasks",
    icon: ListTodo,
    roles: ["ADMIN", "EVENT_MANAGER", "DESIGNER", "ACCOUNTANT"],
  },

  {
    title: "Sự kiện",
    path: "/events",
    icon: CalendarDays,
    roles: ["ADMIN", "EVENT_MANAGER"],
  },

  {
    title: "Thiết kế",
    path: "/designs",
    icon: Palette,
    roles: ["ADMIN", "DESIGNER"],
  },

  {
    title: "Báo giá",
    path: "/quotations",
    icon: FileText,
    roles: ["ADMIN", "EVENT_MANAGER", "ACCOUNTANT"],
  },

  {
    title: "Thanh toán",
    path: "/payments",
    icon: CreditCard,
    roles: ["ADMIN", "ACCOUNTANT"],
  },

  {
    title: "Báo cáo",
    path: "/reports",
    icon: BarChart3,
    roles: ["ADMIN"],
  },

  {
    title: "Cài đặt",
    path: "/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

function Sidebar({ collapsed = false }) {
  let currentUser = {};

  try {
    currentUser = JSON.parse(localStorage.getItem("eventflow_user")) || {};
  } catch {
    currentUser = {};
  }

  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(currentUser.role),
  );

  return (
    <aside
      className={`eventflow-sidebar ${
        collapsed ? "eventflow-sidebar-collapsed" : ""
      }`}
    >
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">E</div>

        {!collapsed && (
          <div className="sidebar-brand-text">
            <strong>EventFlow</strong>

            <span>Event Management</span>
          </div>
        )}
      </div>

      <div className="sidebar-menu-label">
        {!collapsed && "QUẢN LÝ HỆ THỐNG"}
      </div>

      <nav className="sidebar-menu">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.title : ""}
              className={({ isActive }) =>
                `sidebar-menu-item ${
                  isActive ? "sidebar-menu-item-active" : ""
                }`
              }
            >
              <Icon size={20} />

              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        {!collapsed && (
          <>
            <strong>EventFlow</strong>

            <span>Phiên bản 1.0.0</span>
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
