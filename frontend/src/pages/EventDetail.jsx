import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
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

function getStatusFromProgress(progress, currentStatus) {
  const normalizedProgress = normalizeProgress(progress);
  const normalizedStatus = String(currentStatus || "PENDING").toUpperCase();

  if (normalizedStatus === "CANCELLED") return "CANCELLED";
  if (normalizedProgress >= 100) return "COMPLETED";
  if (normalizedProgress > 0) return "IN_PROGRESS";
  if (normalizedStatus === "PLANNING") return "PLANNING";
  return "PENDING";
}

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    status: "PENDING",
    progress: 0,
    notes: "",
  });

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await eventApi.getById(id);
      const data = response.data?.data || null;

      setEventData(data);

      if (data) {
        setForm({
          status: data.status || "PENDING",
          progress: normalizeProgress(data.progress),
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

  const handleProgressChange = (value) => {
    const nextProgress = normalizeProgress(value);

    setForm((current) => ({
      ...current,
      progress: nextProgress,
      status: getStatusFromProgress(nextProgress, current.status),
    }));
  };

  const handleStatusChange = (status) => {
    setForm((current) => {
      let nextProgress = normalizeProgress(current.progress);

      if (status === "COMPLETED") nextProgress = 100;
      if (status === "PENDING" && nextProgress > 0) nextProgress = 0;

      return {
        ...current,
        status,
        progress: nextProgress,
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const progress = normalizeProgress(form.progress);
      const status = getStatusFromProgress(progress, form.status);

      await eventApi.update(id, {
        status,
        progress,
        notes: form.notes.trim(),
      });

      toast.success(
        progress === 100
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

  return (
    <div className="event-module-page">
      <div className="event-page-header">
        <div>
          <p className="event-breadcrumb">Dashboard / Sự kiện / Chi tiết</p>
          <h1>Chi tiết sự kiện</h1>
          <span>{eventName}</span>
        </div>

        <div className="event-detail-header-actions">
          <button
            type="button"
            className="event-secondary-button"
            onClick={loadEvent}
          >
            <RefreshCw size={18} />
            Làm mới
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
                  {formatDate(
                    eventData.eventDate ||
                      eventData.startDate ||
                      eventData.date
                  )}
                </strong>
              </div>

              <div className="event-detail-item">
                <span><MapPin size={16} />Địa điểm</span>
                <strong>
                  {eventData.location || eventData.venue || "Chưa cập nhật"}
                </strong>
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
                <h2>Tiến độ công việc</h2>
                <p>Tiến độ 100% sẽ tự chuyển trạng thái thành COMPLETED</p>
              </div>
            </div>

            <div className="event-progress-editor">
              <div className="event-progress-editor-top">
                <span>Tiến độ hiện tại</span>
                <strong>{normalizeProgress(form.progress)}%</strong>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.progress}
                onChange={(event) =>
                  handleProgressChange(event.target.value)
                }
              />

              <div className="event-progress-large">
                <span
                  style={{
                    width: `${normalizeProgress(form.progress)}%`,
                  }}
                />
              </div>

              <div className="event-progress-presets">
                {[0, 25, 50, 75, 100].map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={
                      normalizeProgress(form.progress) === value
                        ? "active"
                        : ""
                    }
                    onClick={() => handleProgressChange(value)}
                  >
                    {value}%
                  </button>
                ))}
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
                onChange={(event) =>
                  handleStatusChange(event.target.value)
                }
              >
                {STATUS_OPTIONS.map((status) => (
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
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
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
