import { Link } from "react-router-dom";
import "./public.css";

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="ef-public-container">
        <div className="public-footer-grid">
          {/* BRAND */}
          <div className="footer-brand-section">
            <Link to="/" className="public-brand footer-brand">
              <div className="public-brand-logo">EF</div>

              <div className="public-brand-text">
                <strong>EventFlow</strong>
                <span>Make every moment count</span>
              </div>
            </Link>

            <p>
              Đồng hành cùng khách hàng từ ý tưởng đến ngày sự kiện,
              mang đến trải nghiệm tổ chức rõ ràng, chuyên nghiệp và
              đáng nhớ.
            </p>
          </div>

          {/* KHÁM PHÁ */}
          <div className="footer-column">
            <h3>Khám phá</h3>

            <Link to="/">Trang chủ</Link>
            <Link to="/about">Giới thiệu</Link>
            <Link to="/services">Dịch vụ</Link>
            <Link to="/gallery">Thư viện</Link>
            <Link to="/contact">Liên hệ</Link>
          </div>

          {/* KHÁCH HÀNG */}
          <div className="footer-column">
            <h3>Khách hàng</h3>

            <Link to="/customer/register">Đăng ký</Link>
            <Link to="/customer/login">Đăng nhập</Link>
            <Link to="/customer/requests">Yêu cầu của tôi</Link>
            <Link to="/customer/events">Sự kiện của tôi</Link>
          </div>

          {/* LIÊN HỆ */}
          <div className="footer-column">
            <h3>Liên hệ</h3>

            <span>0900 000 000</span>
            <span>hello@eventflow.vn</span>
            <span>Việt Nam</span>
          </div>
        </div>

        <div className="public-footer-bottom">
          <span>© 2026 EventFlow. All rights reserved.</span>
          <span>Plan • Create • Celebrate</span>
        </div>
      </div>
    </footer>
  );
}
