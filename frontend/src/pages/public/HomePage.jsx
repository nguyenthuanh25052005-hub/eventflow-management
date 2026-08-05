import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CakeSlice,
  Check,
  HeartHandshake,
  PartyPopper,
  Sparkles,
} from "lucide-react";

import HeroSection from "../../components/public/HeroSection";
import "./HomePage.css";

const services = [
  {
    icon: HeartHandshake,
    title: "Wedding",
    description:
      "Không gian cưới tinh tế, cảm xúc và được cá nhân hóa theo câu chuyện của bạn.",
    accent: "purple",
  },
  {
    icon: Building2,
    title: "Corporate Event",
    description:
      "Hội nghị, gala và sự kiện doanh nghiệp với quy trình vận hành chuyên nghiệp.",
    accent: "blue",
  },
  {
    icon: CakeSlice,
    title: "Birthday & Private",
    description:
      "Những buổi tiệc riêng ấm cúng, sáng tạo và trọn vẹn từng chi tiết.",
    accent: "orange",
  },
];

const steps = [
  {
    number: "01",
    title: "Gửi yêu cầu",
    description: "Chia sẻ nhu cầu, thời gian, ngân sách và ý tưởng sự kiện.",
  },
  {
    number: "02",
    title: "Tư vấn & đề xuất",
    description: "EventFlow cùng bạn thống nhất concept và phương án phù hợp.",
  },
  {
    number: "03",
    title: "Chuẩn bị & theo dõi",
    description:
      "Theo dõi tiến độ, thiết kế và các đầu việc ngay trên hệ thống.",
  },
  {
    number: "04",
    title: "Tổ chức & hoàn thiện",
    description:
      "Đội ngũ vận hành triển khai để sự kiện diễn ra đúng kế hoạch.",
  },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <HeroSection />

      {/* SERVICES */}

      <section className="home-section">
        <div className="ef-public-container">
          <div className="home-section-heading">
            <div>
              <span className="home-kicker">DỊCH VỤ</span>
              <h2>Mỗi sự kiện, một trải nghiệm riêng.</h2>
            </div>

            <Link to="/services" className="home-more-link">
              Xem tất cả dịch vụ
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="home-services">
            {services.map(({ icon: Icon, title, description, accent }) => (
              <article key={title} className={`home-service-card ${accent}`}>
                <div className="home-service-icon">
                  <Icon size={24} />
                </div>

                <div className="home-service-image">
                  <span>{title.slice(0, 1)}</span>
                </div>

                <h3>{title}</h3>

                <p>{description}</p>

                <Link to="/services">
                  Khám phá
                  <ArrowRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHY EVENTFLOW */}

      <section className="home-section home-soft">
        <div className="ef-public-container home-why">
          <div className="home-why-visual">
            <div className="home-why-card">
              <Sparkles size={31} />

              <div>
                <small>EVENT EXPERIENCE</small>

                <strong>
                  Ý tưởng đẹp cần một quy trình tốt để trở thành hiện thực.
                </strong>
              </div>
            </div>

            <div className="home-why-badge">
              <PartyPopper size={21} />

              <div>
                <strong>End-to-end</strong>
                <span>Từ yêu cầu đến sự kiện</span>
              </div>
            </div>
          </div>

          <div className="home-why-content">
            <span className="home-kicker">VÌ SAO CHỌN EVENTFLOW</span>

            <h2>Đơn giản hóa việc tổ chức, nâng tầm trải nghiệm.</h2>

            <p>
              Bạn không chỉ nhận một dịch vụ tổ chức sự kiện. Bạn có một quy
              trình rõ ràng để biết điều gì đang diễn ra, ai đang phụ trách và
              tiến độ hiện tại.
            </p>

            <div className="home-checks">
              <span>
                <Check size={17} />
                Tư vấn theo đúng nhu cầu và ngân sách
              </span>

              <span>
                <Check size={17} />
                Theo dõi trạng thái yêu cầu minh bạch
              </span>

              <span>
                <Check size={17} />
                Cập nhật tiến độ sự kiện tập trung
              </span>

              <span>
                <Check size={17} />
                Kết nối thiết kế, báo giá và thanh toán
              </span>
            </div>

            <Link to="/about" className="home-more-link">
              Tìm hiểu về EventFlow
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* PROCESS */}

      <section className="home-section">
        <div className="ef-public-container">
          <div className="home-process-heading">
            <span className="home-kicker">QUY TRÌNH</span>

            <h2>Từ ý tưởng đến ngày sự kiện chỉ trong 4 bước.</h2>
          </div>

          <div className="home-process">
            {steps.map((step) => (
              <article key={step.number} className="home-process-card">
                <span>{step.number}</span>

                <h3>{step.title}</h3>

                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="home-cta-section">
        <div className="ef-public-container">
          <div className="home-cta">
            <div>
              <span>BẮT ĐẦU NGAY</span>

              <h2>Bạn đã có ý tưởng cho sự kiện tiếp theo?</h2>

              <p>
                Gửi yêu cầu để EventFlow hiểu nhu cầu và cùng bạn xây dựng
                phương án phù hợp.
              </p>
            </div>

            <Link to="/customer/requests/new" className="home-cta-button">
              Gửi yêu cầu tổ chức
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
