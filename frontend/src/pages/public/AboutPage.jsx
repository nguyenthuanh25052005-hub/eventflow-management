import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import "./AboutPage.css";

const values = [
  {
    icon: HeartHandshake,
    title: "Tận tâm",
    description:
      "Mỗi sự kiện đều được lắng nghe và xây dựng dựa trên nhu cầu thực tế của khách hàng.",
  },
  {
    icon: Lightbulb,
    title: "Sáng tạo",
    description:
      "Không ngừng tìm kiếm ý tưởng mới để mỗi sự kiện mang một dấu ấn riêng.",
  },
  {
    icon: ShieldCheck,
    title: "Minh bạch",
    description:
      "Tiến độ, trạng thái và các thông tin quan trọng luôn được cập nhật rõ ràng.",
  },
  {
    icon: Users,
    title: "Đồng hành",
    description:
      "EventFlow kết nối khách hàng và đội ngũ tổ chức trong suốt hành trình sự kiện.",
  },
];

const stats = [
  {
    value: "01",
    label: "Nền tảng quản lý",
  },
  {
    value: "04",
    label: "Giai đoạn vận hành",
  },
  {
    value: "100%",
    label: "Tiến độ minh bạch",
  },
  {
    value: "24/7",
    label: "Theo dõi thông tin",
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-blur about-hero-blur-one" />
        <div className="about-hero-blur about-hero-blur-two" />

        <div className="ef-public-container about-hero-grid">
          <div className="about-hero-content">
            <div className="about-kicker">
              <Sparkles size={15} />
              VỀ EVENTFLOW
            </div>

            <h1>
              Không chỉ tổ chức sự kiện.
              <span> Chúng tôi tạo nên hành trình.</span>
            </h1>

            <p>
              EventFlow được xây dựng với mục tiêu giúp quá trình tổ chức sự
              kiện trở nên rõ ràng, thuận tiện và kết nối hơn — từ lúc khách
              hàng chia sẻ ý tưởng cho đến khi sự kiện hoàn thành.
            </p>

            <Link to="/services" className="about-primary-button">
              Khám phá dịch vụ
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="about-hero-visual">
            <div className="about-visual-main">
              <span>EVENTFLOW</span>

              <div className="about-visual-content">
                <small>OUR PURPOSE</small>

                <strong>
                  Kết nối ý tưởng,
                  <br />
                  con người và trải nghiệm.
                </strong>
              </div>

              <div className="about-orbit about-orbit-one" />
              <div className="about-orbit about-orbit-two" />
            </div>

            <div className="about-floating-card">
              <Target size={20} />

              <div>
                <small>Mục tiêu</small>
                <strong>Trải nghiệm trọn vẹn</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="about-section">
        <div className="ef-public-container about-story">
          <div className="about-story-heading">
            <span className="about-section-kicker">CÂU CHUYỆN</span>

            <h2>EventFlow bắt đầu từ một câu hỏi rất đơn giản.</h2>
          </div>

          <div className="about-story-content">
            <p className="about-story-highlight">
              “Làm thế nào để khách hàng không phải lo lắng về hàng chục công
              việc nhỏ khi chuẩn bị cho một sự kiện?”
            </p>

            <p>
              Một sự kiện thành công không chỉ phụ thuộc vào ý tưởng đẹp. Đằng
              sau đó là hàng loạt công việc cần được lên kế hoạch, phân công,
              theo dõi và phối hợp chính xác.
            </p>

            <p>
              EventFlow kết hợp quy trình tổ chức sự kiện với công nghệ quản lý
              để khách hàng có thể theo dõi hành trình của mình một cách dễ dàng
              hơn.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION VISION */}
      <section className="about-section about-soft-section">
        <div className="ef-public-container">
          <div className="about-mission-grid">
            <article className="about-mission-card about-mission-dark">
              <span>01</span>

              <div>
                <small>SỨ MỆNH</small>

                <h3>Đơn giản hóa hành trình tổ chức sự kiện.</h3>

                <p>
                  Giúp khách hàng hiểu rõ từng giai đoạn, dễ dàng theo dõi tiến
                  độ và luôn biết điều gì đang diễn ra.
                </p>
              </div>
            </article>

            <article className="about-mission-card">
              <span>02</span>

              <div>
                <small>TẦM NHÌN</small>

                <h3>Trở thành nền tảng kết nối trải nghiệm sự kiện.</h3>

                <p>
                  Tạo một không gian chung nơi khách hàng và đội ngũ tổ chức có
                  thể phối hợp minh bạch, nhanh chóng và hiệu quả.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="about-section">
        <div className="ef-public-container">
          <div className="about-centered-heading">
            <span className="about-section-kicker">GIÁ TRỊ CỐT LÕI</span>

            <h2>Những giá trị tạo nên cách EventFlow làm việc.</h2>

            <p>
              Mỗi quyết định của chúng tôi đều hướng đến trải nghiệm tốt hơn cho
              khách hàng và đội ngũ tổ chức.
            </p>
          </div>

          <div className="about-values-grid">
            {values.map(({ icon: Icon, title, description }) => (
              <article className="about-value-card" key={title}>
                <div className="about-value-icon">
                  <Icon size={22} />
                </div>

                <h3>{title}</h3>

                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="about-section about-stats-section">
        <div className="ef-public-container about-stats-grid">
          {stats.map((item) => (
            <div className="about-stat-item" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="about-section">
        <div className="ef-public-container about-philosophy">
          <div className="about-philosophy-visual">
            <div className="about-philosophy-logo">EF</div>

            <div className="about-philosophy-line" />

            <span>PLAN</span>
            <span>CREATE</span>
            <span>CELEBRATE</span>
          </div>

          <div className="about-philosophy-content">
            <span className="about-section-kicker">
              CÁCH CHÚNG TÔI LÀM VIỆC
            </span>

            <h2>Mọi chi tiết đều cần có lý do để tồn tại.</h2>

            <p>
              EventFlow không chạy theo việc làm thật nhiều. Chúng tôi tập trung
              vào việc làm đúng, đúng lúc và đúng với mục tiêu của sự kiện.
            </p>

            <div className="about-check-list">
              <span>
                <CheckCircle2 size={18} />
                Hiểu rõ nhu cầu trước khi đề xuất giải pháp
              </span>

              <span>
                <CheckCircle2 size={18} />
                Mỗi đầu việc đều có người phụ trách
              </span>

              <span>
                <CheckCircle2 size={18} />
                Khách hàng theo dõi được tiến độ thực tế
              </span>

              <span>
                <CheckCircle2 size={18} />
                Phản hồi và thay đổi được ghi nhận rõ ràng
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta-section">
        <div className="ef-public-container">
          <div className="about-cta">
            <div>
              <span>BẠN ĐÃ SẴN SÀNG?</span>

              <h2>Cùng EventFlow bắt đầu sự kiện tiếp theo của bạn.</h2>

              <p>
                Chia sẻ ý tưởng và để chúng tôi cùng bạn xây dựng một hành trình
                phù hợp.
              </p>
            </div>

            <Link to="/customer/requests/new" className="about-cta-button">
              Gửi yêu cầu tổ chức
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
