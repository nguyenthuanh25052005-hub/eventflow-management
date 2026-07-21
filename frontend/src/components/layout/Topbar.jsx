import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import "./Topbar.css";

function Topbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const [showUserMenu, setShowUserMenu] = useState(false);

  const [user, setUser] = useState({
    fullName: "Admin EventFlow",
    email: "admin@example.com",
    role: "ADMIN",
  });

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("eventflow_user");

      if (!savedUser) {
        return;
      }

      const parsedUser = JSON.parse(savedUser);

      setUser({
        fullName:
          parsedUser.fullName || parsedUser.name || "Người dùng EventFlow",
        email: parsedUser.email || "",
        role: parsedUser.role || "USER",
      });
    } catch (error) {
      console.error("Không thể đọc thông tin người dùng:", error);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatRole = (role) => {
    const normalizedRole = String(role || "").toUpperCase();

    const roleNames = {
      ADMIN: "Quản trị viên",
      EVENT_MANAGER: "Quản lý sự kiện",
      DESIGNER: "Nhân viên thiết kế",
      ACCOUNTANT: "Nhân viên kế toán",
      CUSTOMER: "Khách hàng",
      USER: "Người dùng",
    };

    return roleNames[normalizedRole] || normalizedRole;
  };

  const getInitials = (fullName) => {
    if (!fullName) {
      return "EF";
    }

    const words = fullName.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    const firstLetter = words[0][0];
    const lastLetter = words[words.length - 1][0];

    return `${firstLetter}${lastLetter}`.toUpperCase();
  };

  const handleToggleUserMenu = () => {
    setShowUserMenu((current) => !current);
  };

  const handleProfile = () => {
    setShowUserMenu(false);
    toast("Trang thông tin tài khoản đang được phát triển.");
  };

  const handleLogout = () => {
    localStorage.removeItem("eventflow_token");
    localStorage.removeItem("eventflow_user");

    setShowUserMenu(false);

    toast.success("Đăng xuất thành công.");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="eventflow-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-icon-button"
          onClick={onToggleSidebar}
          aria-label="Thu gọn hoặc mở rộng thanh menu"
        >
          <Menu size={22} />
        </button>

        <div className="topbar-search">
          <Search size={19} />

          <input type="text" placeholder="Tìm kiếm sự kiện, khách hàng..." />

          <span>Ctrl K</span>
        </div>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="topbar-notification"
          aria-label="Thông báo"
        >
          <Bell size={22} />
          <span className="topbar-notification-dot" />
        </button>

        <div className="topbar-divider" />

        <div className="topbar-user-wrapper" ref={userMenuRef}>
          <button
            type="button"
            className={`topbar-user ${
              showUserMenu ? "topbar-user-active" : ""
            }`}
            onClick={handleToggleUserMenu}
            aria-haspopup="menu"
            aria-expanded={showUserMenu}
          >
            <div className="topbar-avatar">{getInitials(user.fullName)}</div>

            <div className="topbar-user-info">
              <strong>{user.fullName}</strong>
              <span>{formatRole(user.role)}</span>
            </div>

            <ChevronDown
              size={18}
              className={`topbar-chevron ${
                showUserMenu ? "topbar-chevron-open" : ""
              }`}
            />
          </button>

          {showUserMenu && (
            <div className="topbar-user-menu" role="menu">
              <div className="user-menu-header">
                <div className="user-menu-avatar">
                  {getInitials(user.fullName)}
                </div>

                <div className="user-menu-user-info">
                  <strong>{user.fullName}</strong>
                  <span>{user.email}</span>

                  <small>{formatRole(user.role)}</small>
                </div>
              </div>

              <div className="user-menu-divider" />

              <button
                type="button"
                className="user-menu-item"
                onClick={handleProfile}
                role="menuitem"
              >
                <UserRound size={18} />
                <span>Thông tin tài khoản</span>
              </button>

              <button
                type="button"
                className="user-menu-item user-menu-logout"
                onClick={handleLogout}
                role="menuitem"
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
