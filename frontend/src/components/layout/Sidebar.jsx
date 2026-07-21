import { NavLink } from "react-router-dom";
import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  FileText,
  LayoutDashboard,
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
  },
  {
    title: "Người dùng",
    path: "/users",
    icon: Users,
  },
  {
    title: "Nhân viên",
    path: "/employees",
    icon: UserRoundCog,
  },
  {
    title: "Yêu cầu sự kiện",
    path: "/event-requests",
    icon: CalendarCheck,
  },
  {
    title: "Sự kiện",
    path: "/events",
    icon: CalendarDays,
  },
  {
    title: "Thiết kế",
    path: "/designs",
    icon: Palette,
  },
  {
    title: "Báo giá",
    path: "/quotations",
    icon: FileText,
  },
  {
    title: "Thanh toán",
    path: "/payments",
    icon: CreditCard,
  },
  {
    title: "Báo cáo",
    path: "/reports",
    icon: BarChart3,
  },
  {
    title: "Cài đặt",
    path: "/settings",
    icon: Settings,
  },
];

function Sidebar({ collapsed = false }) {
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
        {menuItems.map((item) => {
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