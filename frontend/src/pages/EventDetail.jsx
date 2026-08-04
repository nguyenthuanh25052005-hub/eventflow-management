import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  RefreshCw,
  Save,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import toast from "react-hot-toast";

import eventApi from "../api/eventApi";
import StatusBadge from "../components/events/StatusBadge";
import Timeline from "../components/events/Timeline";
import "./EventManagement.css";

const STATUS_OPTIONS = [
  "PENDING",
  "PLANNING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_FLOW = {
  PENDING: ["PENDING", "PLANNING", "CANCELLED"],
  PLANNING: ["PLANNING", "IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
  COMPLETED: ["COMPLETED"],
  CANCELLED: ["CANCELLED"],
};

function formatDate(value) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function formatMoney(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "Chưa cập nhật";
  return `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;
}

function normalizeProgress(value) {
  return Math.min(Math.max(Number(value || 0), 0), 100);
}

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [taskStats, setTaskStats] = useState({
    totalValid: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    cancelled: 0,
    overdue: 0,
    progressPercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    status: "PENDING",
    notes: "",
  });

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await eventApi.getById(id);
      const data = response.data?.data || null;
      const stats = response.data?.taskStats;

      setEventData(data);

      if (stats) {
        setTaskStats({
          totalValid: stats.totalValid || 0,
          completed: stats.completed || 0,
          inProgress: stats.inProgress || 0,
          todo: stats.todo || 0,
          cancelled: stats.cancelled || 0,
          overdue: stats.overdue || 0,
          progressPercent: normalizeProgress(stats.progressPercent),
        });
      }

      if (data) {
        setForm({
          status: data.status || "PENDING",
          notes: data.notes || "",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể tải chi tiết sự kiện."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleStatusChange = (status) => {
    setForm((current) => {
      return { ...current, status };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const status = form.status;

      await eventApi.update(id, {
        status,
        notes: form.notes.trim(),
      });

      toast.success(
        status === "COMPLETED"
          ? "Sự kiện đã hoàn thành."
          : "Cập nhật sự kiện thành công."
      );
      await loadEvent();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật sự kiện."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="event-state-card">
        <RefreshCw className="event-spin" size={26} />
        <span>Đang tải chi tiết sự kiện...</span>
      </div>
    );
  }

  if (!eventData) {
    return <div className="event-state-card">Không tìm thấy sự kiện.</div>;
  }

  const eventName =
    eventData.eventName ||
    eventData.name ||
    eventData.eventType?.name ||
    "Sự kiện chưa đặt tên";

  const eventCode =
    eventData.code ||
    eventData.eventCode ||
    eventData._id?.slice(-8).toUpperCase();

  const customerName =
    eventData.customer?.fullName || eventData.customerName || "Chưa cập nhật";

  const managerName =
    eventData.manager?.user?.fullName ||
    eventData.manager?.fullName ||
    eventData.managerName ||
    "Chưa phân công";

  const budget =
    eventData.estimatedBudget || eventData.budget || eventData.totalBudget;

  const displayProgress = normalizeProgress(taskStats.progressPercent);

  return (
    <div className="event-module-page">
      <div className="event-page-header">
        <div>
          <p className="event-breadcrumb">Dashboard / Sự kiện / Chi tiết</p>
          <h1>Chi tiết sự kiện</h1>
          <span>{eventName}</span>
        </div>

        <div className="event-detail-header-actions">
          <button type="button" className="event-secondary-button" onClick={loadEvent}>
            <RefreshCw size={18} />
            Làm mới
          </button>
          <button
            type="button"
            className="event-primary-button"
            onClick={() => navigate(`/events/${id}/edit`)}
          >
            Chỉnh sửa
          </button>
          <button
            type="button"
            className="event-secondary-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>
        </div>
      </div>

      <section className="event-detail-hero">
        <div>
          <p>EVENTFLOW EVENT</p>
          <h2>{eventName}</h2>
          <span>Mã sự kiện: {eventCode}</span>
        </div>
        <StatusBadge status={eventData.status} />
      </section>

      <section className="event-detail-layout">
        <div className="event-detail-main">
          <section className="event-detail-card">
            <div className="event-table-heading event-section-heading">
              <div>
                <h2>Thông tin sự kiện</h2>
                <p>Dữ liệu tổng quan của sự kiện</p>
              </div>
            </div>

            <div className="event-detail-grid">
              <div className="event-detail-item">
                <span><UserRound size={16} />Khách hàng</span>
                <strong>{customerName}</strong>
              </div>
              <div className="event-detail-item">
                <span><UserRound size={16} />Người phụ trách</span>
                <strong>{managerName}</strong>
              </div>
              <div className="event-detail-item">
                <span><CalendarDays size={16} />Ngày tổ chức</span>
                <strong>
                  {formatDate(eventData.eventDate || eventData.startDate || eventData.date)}
                </strong>
              </div>
              <div className="event-detail-item">
                <span><CalendarDays size={16} />Ngày kết thúc</span>
                <strong>{formatDate(eventData.endDate)}</strong>
              </div>
              <div className="event-detail-item">
                <span><MapPin size={16} />Địa điểm</span>
                <strong>{eventData.location || eventData.venue || "Chưa cập nhật"}</strong>
              </div>
              <div className="event-detail-item">
                <span><Users size={16} />Số khách</span>
                <strong>{eventData.guestCount || eventData.expectedGuests || 0}</strong>
              </div>
              <div className="event-detail-item">
                <span><WalletCards size={16} />Ngân sách</span>
                <strong>{formatMoney(budget)}</strong>
              </div>
            </div>

            <div className="event-description-box">
              <span>Mô tả</span>
              <p>{eventData.description || "Không có mô tả."}</p>
            </div>
          </section>
          <section className="event-detail-card">
            <div className="event-table-heading event-section-heading">
              <div>
                <h2>Timeline sự kiện</h2>
                <p>Theo dõi các mốc cập nhật quan trọng</p>
              </div>
            </div>
            <Timeline event={eventData} />
          </section>
          <section className="event-detail-card">
            <div className="event-table-heading event-section-heading">
              <div>
                <h2>Tiến độ sự kiện (theo task)</h2>
                <p>% = Task hoàn thành / Tổng task hợp lệ (không tính task đã hủy)</p>
              </div>
            </div>

            <div className="event-progress-editor">
              <div className="event-progress-editor-top">
                <span>Phần trăm hoàn thành</span>
                <strong>{displayProgress}%</strong>
              </div>

              <div className="event-progress-large">
                <span style={{ width: `${displayProgress}%` }} />
              </div>

              <div className="event-task-stats-grid">
                <article className="event-task-stat">
                  <ClipboardList size={18} />
                  <div>
                    <strong>{taskStats.totalValid}</strong>
                    <span>Task hợp lệ</span>
                  </div>
                </article>
                <article className="event-task-stat">
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>{taskStats.completed}</strong>
                    <span>Hoàn thành</span>
                  </div>
                </article>
                <article className="event-task-stat">
                  <Clock3 size={18} />
                  <div>
                    <strong>{taskStats.inProgress}</strong>
                    <span>Đang làm</span>
                  </div>
                </article>
                <article className="event-task-stat danger">
                  <AlertTriangle size={18} />
                  <div>
                    <strong>{taskStats.overdue}</strong>
                    <span>Quá hạn</span>
                  </div>
                </article>
              </div>

            </div>

          </section>
        </div>

        <aside className="event-detail-sidebar">
          <section className="event-control-card">
            <div className="event-control-heading">
              <CheckCircle2 size={21} />
              <div>
                <h3>Điều khiển sự kiện</h3>
                <p>Cập nhật trạng thái và ghi chú</p>
              </div>
            </div>

            <label className="event-field">
              <span>Trạng thái</span>
              <select
                value={form.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={["COMPLETED", "CANCELLED"].includes(
                  String(eventData.status || "").toUpperCase()
                )}
              >
                {(
                  STATUS_FLOW[String(eventData.status || "PENDING").toUpperCase()] ||
                  STATUS_OPTIONS
                ).map((status) => (
                  <option value={status} key={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="event-field">
              <span><ClipboardList size={16} />Ghi chú nội bộ</span>
              <textarea
                rows="7"
                value={form.notes}
                onChange={(e) =>
                  setForm((current) => ({ ...current, notes: e.target.value }))
                }
                placeholder="Nhập ghi chú cho sự kiện..."
              />
            </label>

            <button
              type="button"
              className="event-primary-button event-save-control"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={18} />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </section>

          <section className="event-control-card">
            <div className="event-control-heading">
              <CalendarDays size={21} />
              <div>
                <h3>Thông tin hệ thống</h3>
                <p>Lịch sử tạo và cập nhật</p>
              </div>
            </div>
            <div className="event-system-info">
              <div>
                <span>Ngày tạo</span>
                <strong>{formatDate(eventData.createdAt)}</strong>
              </div>
              <div>
                <span>Cập nhật gần nhất</span>
                <strong>{formatDate(eventData.updatedAt)}</strong>
              </div>
              <div>
                <span>Trạng thái hiện tại</span>
                <StatusBadge status={eventData.status} />
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

export default EventDetail;
