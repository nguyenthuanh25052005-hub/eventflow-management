import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  Users,
} from "lucide-react";
import "./public.css";

export default function HeroSection() {
  return (
    <section className="public-hero">
      <div className="hero-blur hero-blur-one" />
      <div className="hero-blur hero-blur-two" />

      <div className="ef-public-container hero-grid">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            Nền tảng tổ chức sự kiện hiện đại
          </div>

          <h1>
            Biến ý tưởng thành
            <span> một sự kiện đáng nhớ.</span>
          </h1>

          <p className="hero-description">
            EventFlow đồng hành cùng bạn từ tư vấn, thiết kế đến vận hành. Mọi
            tiến độ, công việc và thông tin sự kiện đều được quản lý rõ ràng
            trong một hành trình thống nhất.
          </p>

          <div className="hero-actions">
            <Link to="/customer/requests/new" className="hero-primary-button">
              Bắt đầu sự kiện
              <ArrowRight size={18} />
            </Link>

            <Link to="/services" className="hero-secondary-button">
              Khám phá dịch vụ
            </Link>
          </div>

          <div className="hero-trust">
            <span>
              <CheckCircle2 size={17} />
              Quy trình minh bạch
            </span>

            <span>
              <CheckCircle2 size={17} />
              Theo dõi tiến độ
            </span>

            <span>
              <CheckCircle2 size={17} />
              Đội ngũ chuyên môn
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-event-card">
            <div className="hero-card-header">
              <span className="hero-card-label">EVENTFLOW PLAN</span>
              <span className="hero-card-status">
                <i />
                Đang chuẩn bị
              </span>
            </div>

            <div className="hero-art">
              <div className="hero-art-circle hero-art-circle-one" />
              <div className="hero-art-circle hero-art-circle-two" />

              <strong>EF</strong>
            </div>

            <h3>Wedding Celebration</h3>

            <p>
              Một hành trình được quản lý rõ ràng từ ý tưởng đến ngày diễn ra.
            </p>

            <div className="hero-progress-header">
              <span>Tiến độ chuẩn bị</span>
              <strong>76%</strong>
            </div>

            <div className="hero-progress">
              <div />
            </div>
          </div>

          <div className="hero-floating-card hero-floating-date">
            <CalendarDays size={21} />

            <div>
              <small>Ngày sự kiện</small>
              <strong>24.12.2026</strong>
            </div>
          </div>

          <div className="hero-floating-card hero-floating-guests">
            <Users size={21} />

            <div>
              <small>Khách mời</small>
              <strong>250 người</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
