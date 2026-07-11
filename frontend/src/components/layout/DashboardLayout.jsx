import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import "./DashboardLayout.css";

export default function DashboardLayout({
  children,
}) {
  return (
    <div className="layout">

      <Sidebar />

      <div className="main">

        <Topbar />

        <main className="content">

          {children}

        </main>

      </div>

    </div>
  );
}