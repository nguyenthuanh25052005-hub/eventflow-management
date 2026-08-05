import { Link } from "react-router-dom";
import "./public.css";

export default function PublicHeader() {
  return (
    <header className="public-header">
      <div className="ef-public-container public-header-inner">
        {/* LOGO */}
        <Link to="/" className="public-brand">
          <div className="public-brand-logo">EF</div>

          <div className="public-brand-text">
            <strong>EventFlow</strong>
            <span>Make every moment count</span>
          </div>
        </Link>

        {/* MENU */}
        <nav className="public-nav">
          <Link to="/" className="public-nav-link">
            Trang chủ
          </Link>

          <Link to="/about" className="public-nav-link">
            Giới thiệu
          </Link>

          <Link to="/services" className="public-nav-link">
            Dịch vụ
          </Link>

          <Link to="/gallery" className="public-nav-link">
            Thư viện
          </Link>

          <Link to="/contact" className="public-nav-link">
            Liên hệ
          </Link>
        </nav>

        {/* ACTION */}
        <div className="public-header-actions">
          <Link to="/customer/login" className="public-login-btn">
            Đăng nhập
          </Link>

          <Link to="/customer/requests/new" className="public-request-btn">
            Gửi yêu cầu →
          </Link>
        </div>
      </div>
    </header>
  );
}
