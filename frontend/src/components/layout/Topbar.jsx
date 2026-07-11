import {
  FiBell,
  FiMoon,
  FiSearch,
} from "react-icons/fi";

import "./Topbar.css";

export default function Topbar() {

  const user = JSON.parse(
    localStorage.getItem("eventflow_user") || "{}"
  );

  return (
    <header className="topbar">

      <div className="search-box">

        <FiSearch />

        <input placeholder="Search..." />

      </div>

      <div className="topbar-right">

        <button>

          <FiBell />

        </button>

        <button>

          <FiMoon />

        </button>

        <div className="profile">

          <div className="avatar">

            {user.fullName?.charAt(0)}

          </div>

          <div>

            <strong>{user.fullName}</strong>

            <span>{user.role}</span>

          </div>

        </div>

      </div>

    </header>
  );
}