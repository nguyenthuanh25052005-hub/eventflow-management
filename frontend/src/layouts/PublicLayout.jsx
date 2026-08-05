import { Outlet } from "react-router-dom";
import PublicHeader from "../components/public/PublicHeader";
import PublicFooter from "../components/public/PublicFooter";
import "./PublicLayout.css";

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <PublicHeader />

      <main className="public-main">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}
