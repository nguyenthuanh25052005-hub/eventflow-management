import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  FilePlus2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  ReceiptText,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";

import api from "../api/axios";
import "./Dashboard.css";

const statusMeta = {
  PENDING: { label: "Chờ xử lý", color: "orange", className: "pending" },
  CONSULTING: { label: "Đang tư vấn", color: "cyan", className: "designing" },
  PLANNING: {
    label: "Đang lên kế hoạch",
    color: "blue",
    className: "preparing",
  },
  IN_PROGRESS: { label: "Đang diễn ra", color: "cyan", className: "designing" },
  COMPLETED: { label: "Hoàn thành", color: "green", className: "confirmed" },
  CONFIRMED: { label: "Đã xác nhận", color: "green", className: "confirmed" },
  CANCELLED: { label: "Đã hủy", color: "orange", className: "pending" },
  REJECTED: { label: "Từ chối", color: "orange", className: "pending" },
};

function formatStatus(status) {
  const normalized = String(status || "PENDING").toUpperCase();
  return (
    statusMeta[normalized] || {
      label: normalized.replaceAll("_", " "),
      color: "blue",
      className: "preparing",
    }
  );
}

function formatDate(value) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatMoney(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Chưa cập nhật";
  }

  return `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;
}

function getEventName(event) {
  return (
    event?.name ||
    event?.title ||
    event?.eventName ||
    event?.eventType?.name ||
    "Sự kiện chưa đặt tên"
  );
}

function getCustomerName(item) {
  return (
    item?.customer?.fullName ||
    item?.customerName ||
    item?.contactName ||
    "Chưa cập nhật"
  );
}

function getManagerName(event) {
  return (
    event?.manager?.user?.fullName ||
    event?.manager?.fullName ||
    event?.managerName ||
    "Chưa phân công"
  );
}

function StatCard({ title, value, description, icon: Icon, color }) {
  return (
    <article className="dashboard-stat-card">
      <div className="stat-card-top">
        <div className={`stat-card-icon ${color}`}>
          <Icon size={24} />
        </div>

        <button type="button" aria-label={`Tùy chọn ${title}`}>
          <MoreHorizontal size={21} />
        </button>
      </div>

      <p>{title}</p>
      <h2>{value}</h2>

      <div className="stat-change">
        <span>{description}</span>
      </div>
    </article>
  );
}

function ActivityIcon({ type }) {
  if (type === "request") return <ClipboardList size={18} />;
  if (type === "quotation") return <ReceiptText size={18} />;
  if (type === "design") return <FilePlus2 size={18} />;
  if (type === "payment") return <WalletCards size={18} />;
  return <CalendarDays size={18} />;
}

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/dashboard/stats");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Không thể tải dữ liệu Dashboard.",
        );
      }

      setDashboardData(response.data.data);
    } catch (requestError) {
      console.error("Dashboard error:", requestError);

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Không thể kết nối đến Dashboard API.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const overview = dashboardData?.overview || {};
  const recentEvents = dashboardData?.recentEvents || [];
  const recentRequests = dashboardData?.recentRequests || [];
  const eventStatus = dashboardData?.charts?.eventStatus || [];

  const statusItems = useMemo(() => {
    if (!eventStatus.length) {
      return [
        { label: "Đang chuẩn bị", count: 0, color: "blue", width: "0%" },
        { label: "Chờ xử lý", count: 0, color: "orange", width: "0%" },
        { label: "Đang diễn ra", count: 0, color: "cyan", width: "0%" },
        { label: "Hoàn thành", count: 0, color: "green", width: "0%" },
      ];
    }

    const maximum = Math.max(...eventStatus.map((item) => item.count), 1);

    return eventStatus.map((item) => {
      const meta = formatStatus(item.status);

      return {
        label: meta.label,
        count: item.count,
        color: meta.color,
        width: `${Math.max((item.count / maximum) * 100, 8)}%`,
      };
    });
  }, [eventStatus]);

  const activities = useMemo(() => {
    const requestActivities = recentRequests.slice(0, 3).map((request) => ({
      id: `request-${request._id}`,
      title: `Yêu cầu mới từ ${getCustomerName(request)}`,
      description:
        request?.eventType?.name ||
        request?.eventName ||
        "Yêu cầu tổ chức sự kiện",
      time: formatDate(request.createdAt),
      type: "request",
    }));

    const eventActivities = recentEvents.slice(0, 3).map((event) => ({
      id: `event-${event._id}`,
      title: getEventName(event),
      description: `${formatStatus(event.status).label} • ${getManagerName(
        event,
      )}`,
      time: formatDate(event.createdAt),
      type: "event",
    }));

    return [...requestActivities, ...eventActivities].slice(0, 5);
  }, [recentRequests, recentEvents]);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("eventflow_user")) || {};
    } catch {
      return {};
    }
  }, []);

  const currentMonth = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <RefreshCw className="dashboard-spinner" size={34} />
          <h2>Đang tải dữ liệu Dashboard</h2>
          <p>Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <h2>Không thể tải Dashboard</h2>
          <p>{error}</p>

          <button type="button" onClick={() => loadDashboard()}>
            <RefreshCw size={18} />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div className="welcome-content">
          <p className="welcome-label">EVENTFLOW MANAGEMENT</p>
          <h2>Xin chào, {user.fullName || "Admin"} 👋</h2>

          <p className="welcome-description">
            Hiện có {overview.pendingRequests || 0} yêu cầu chờ xử lý và{" "}
            {overview.activeEvents || 0} sự kiện đang hoạt động.
          </p>

          <div className="welcome-summary">
            <div>
              <span>Tổng nhân viên</span>
              <strong>{overview.totalEmployees || 0} nhân viên</strong>
            </div>

            <div>
              <span>Loại sự kiện đang mở</span>
              <strong>{overview.totalEventTypes || 0} loại sự kiện</strong>
            </div>

            <div>
              <span>Đang tư vấn</span>
              <strong>{overview.consultingRequests || 0} yêu cầu</strong>
            </div>
          </div>
        </div>

        <div className="welcome-decoration">
          <CalendarDays size={76} />
        </div>
      </section>

      <div className="dashboard-header">
        <div>
          <p className="dashboard-breadcrumb">Trang chủ / Dashboard</p>
          <h1>Tổng quan hệ thống</h1>
          <p className="dashboard-description">
            Dữ liệu được đồng bộ trực tiếp từ EventFlow API.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <div className="dashboard-date">
            <CalendarDays size={19} />
            <span>{currentMonth}</span>
          </div>

          <button
            type="button"
            className="dashboard-refresh-button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={18}
              className={refreshing ? "dashboard-spinner" : ""}
            />
            {refreshing ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      {error && <div className="dashboard-warning">{error}</div>}

      <section className="quick-actions-section">
        <div className="section-heading-row">
          <div>
            <h2>Thao tác nhanh</h2>
            <p>Truy cập nhanh các chức năng thường dùng</p>
          </div>
        </div>

        <div className="quick-actions-grid">
          <button type="button" className="quick-action-item">
            <span className="quick-action-icon blue">
              <Plus size={21} />
            </span>
            <span className="quick-action-text">
              <strong>Tạo sự kiện</strong>
              <small>Thêm sự kiện mới</small>
            </span>
          </button>

          <button type="button" className="quick-action-item">
            <span className="quick-action-icon cyan">
              <UserPlus size={21} />
            </span>
            <span className="quick-action-text">
              <strong>Thêm khách hàng</strong>
              <small>Tạo hồ sơ khách hàng</small>
            </span>
          </button>

          <button type="button" className="quick-action-item">
            <span className="quick-action-icon violet">
              <FilePlus2 size={21} />
            </span>
            <span className="quick-action-text">
              <strong>Tạo báo giá</strong>
              <small>Lập báo giá sự kiện</small>
            </span>
          </button>

          <button type="button" className="quick-action-item">
            <span className="quick-action-icon green">
              <WalletCards size={21} />
            </span>
            <span className="quick-action-text">
              <strong>Ghi nhận thanh toán</strong>
              <small>Cập nhật giao dịch mới</small>
            </span>
          </button>
        </div>
      </section>

      <section className="dashboard-stat-grid">
        <StatCard
          title="Tổng người dùng"
          value={overview.totalUsers || 0}
          description="Tất cả tài khoản trong hệ thống"
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Tổng sự kiện"
          value={overview.totalEvents || 0}
          description={`${overview.activeEvents || 0} sự kiện đang hoạt động`}
          icon={CalendarDays}
          color="cyan"
        />

        <StatCard
          title="Doanh thu tháng"
          value={formatMoney(overview.monthlyRevenue)}
          description="Chưa có module doanh thu thì giá trị bằng 0"
          icon={CircleDollarSign}
          color="green"
        />

        <StatCard
          title="Yêu cầu chờ xử lý"
          value={overview.pendingRequests || 0}
          description={`${overview.consultingRequests || 0} yêu cầu đang tư vấn`}
          icon={ClipboardList}
          color="orange"
        />
      </section>

      <section className="dashboard-middle-grid">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Tổng quan vận hành</h2>
              <p>Số liệu hiện tại của hệ thống</p>
            </div>
          </div>

          <div className="dashboard-overview-list">
            <div>
              <span>Nhân viên</span>
              <strong>{overview.totalEmployees || 0}</strong>
            </div>
            <div>
              <span>Loại sự kiện đang hoạt động</span>
              <strong>{overview.totalEventTypes || 0}</strong>
            </div>
            <div>
              <span>Sự kiện đang hoạt động</span>
              <strong>{overview.activeEvents || 0}</strong>
            </div>
            <div>
              <span>Sự kiện đã hoàn thành</span>
              <strong>{overview.completedEvents || 0}</strong>
            </div>
          </div>

          <div className="dashboard-empty-chart">
            <CircleDollarSign size={38} />
            <strong>Biểu đồ doanh thu đang chờ dữ liệu</strong>
            <p>
              Backend hiện trả về monthlyRevenue bằng 0. Khi module Payment hoàn
              thiện, khu vực này sẽ hiển thị doanh thu theo tháng.
            </p>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Trạng thái sự kiện</h2>
              <p>Dữ liệu tổng hợp trực tiếp từ MongoDB</p>
            </div>
          </div>

          <div className="status-list">
            {statusItems.map((item) => (
              <div className="status-item" key={item.label}>
                <div className="status-row">
                  <div>
                    <span className={`status-dot ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  <strong>{item.count}</strong>
                </div>

                <div className="status-progress">
                  <span className={item.color} style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-panel recent-events">
        <div className="panel-heading">
          <div>
            <h2>Sự kiện gần đây</h2>
            <p>{recentEvents.length} sự kiện mới nhất từ hệ thống</p>
          </div>

          <button type="button" className="view-all-button">
            Xem tất cả <ArrowRight size={18} />
          </button>
        </div>

        <div className="event-table-wrapper">
          <table className="event-table">
            <thead>
              <tr>
                <th>Sự kiện</th>
                <th>Khách hàng</th>
                <th>Ngày tổ chức</th>
                <th>Phụ trách</th>
                <th>Ngân sách</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => {
                  const status = formatStatus(event.status);

                  return (
                    <tr key={event._id}>
                      <td>
                        <div className="event-name">
                          <div className="event-icon">
                            <CalendarDays size={19} />
                          </div>

                          <div>
                            <strong>{getEventName(event)}</strong>
                            <span>
                              {event.code ||
                                event.eventCode ||
                                event._id?.slice(-8).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{getCustomerName(event)}</td>
                      <td>
                        {formatDate(
                          event.eventDate ||
                            event.startDate ||
                            event.date ||
                            event.createdAt,
                        )}
                      </td>
                      <td>{getManagerName(event)}</td>
                      <td className="event-budget">
                        {formatMoney(
                          event.budget ||
                            event.estimatedBudget ||
                            event.totalBudget,
                        )}
                      </td>
                      <td>
                        <span className={`event-status ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="dashboard-table-empty">
                    Chưa có sự kiện nào trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Hoạt động gần đây</h2>
              <p>Kết hợp từ yêu cầu và sự kiện mới nhất</p>
            </div>
          </div>

          <div className="activity-list">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div className="activity-item" key={activity.id}>
                  <div className={`activity-icon ${activity.type}`}>
                    <ActivityIcon type={activity.type} />
                  </div>

                  <div className="activity-content">
                    <strong>{activity.title}</strong>
                    <p>{activity.description}</p>
                  </div>

                  <span className="activity-time">{activity.time}</span>
                </div>
              ))
            ) : (
              <p className="dashboard-empty-text">Chưa có hoạt động gần đây.</p>
            )}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Yêu cầu sự kiện gần đây</h2>
              <p>{recentRequests.length} yêu cầu mới nhất</p>
            </div>
          </div>

          <div className="payment-list">
            {recentRequests.length > 0 ? (
              recentRequests.map((request) => {
                const status = formatStatus(request.status);

                return (
                  <div className="payment-item" key={request._id}>
                    <div className="payment-icon">
                      <ClipboardList size={20} />
                    </div>

                    <div className="payment-information">
                      <strong>{getCustomerName(request)}</strong>
                      <span>
                        {request.eventType?.name ||
                          request.eventName ||
                          "Yêu cầu tổ chức sự kiện"}
                      </span>

                      <small
                        className={`payment-status ${
                          status.color === "green"
                            ? "paid"
                            : status.color === "orange"
                              ? "waiting"
                              : "partial"
                        }`}
                      >
                        {status.label}
                      </small>
                    </div>

                    <div className="payment-amount">
                      <strong>
                        {formatMoney(request.budget || request.estimatedBudget)}
                      </strong>
                      <span>{formatDate(request.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="dashboard-empty-text">
                Chưa có yêu cầu sự kiện nào.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;
