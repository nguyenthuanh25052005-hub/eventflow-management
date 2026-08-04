import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Save,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import toast from "react-hot-toast";

import eventApi from "../api/eventApi";
import StatusBadge from "../components/events/StatusBadge";
import "./EventManagement.css";

const STATUS_FLOW = {
  PENDING: ["PENDING", "PLANNING", "IN_PROGRESS", "CANCELLED"],
  PLANNING: ["PLANNING", "IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
  COMPLETED: ["COMPLETED"],
  CANCELLED: ["CANCELLED"],
};

const LOCKED_WHEN_COMPLETED = true;

function formatInputDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function EventEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventData, setEventData] = useState(null);

  const [form, setForm] = useState({
    eventName: "",
    description: "",
    eventDate: "",
    endDate: "",
    location: "",
    guestCount: 0,
    estimatedBudget: 0,
    managerId: "",
    status: "PENDING",
    notes: "",
  });

  const isCompleted = eventData?.status === "COMPLETED";
  const isCancelled = eventData?.status === "CANCELLED";
  const isLocked = isCompleted || isCancelled;

  const allowedStatuses = useMemo(() => {
    const current = eventData?.status || "PENDING";
    return STATUS_FLOW[current] || [current];
  }, [eventData?.status]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await eventApi.getById(id);
        const data = response.data?.data;

        if (!data) {
          toast.error("Không tìm thấy sự kiện.");
          return;
        }

        setEventData(data);
        setForm({
          eventName: data.eventName || "",
          description: data.description || "",
          eventDate: formatInputDate(data.eventDate),
          endDate: formatInputDate(data.endDate),
          location: data.location || "",
          guestCount: data.guestCount || 0,
          estimatedBudget: data.estimatedBudget || 0,
          managerId: data.manager?._id || data.manager || "",
          status: data.status || "PENDING",
          notes: data.notes || "",
        });
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Không thể tải sự kiện.",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.eventName.trim()) {
      toast.error("Tên sự kiện là bắt buộc.");
      return;
    }

    if (form.eventDate && form.endDate) {
      const start = new Date(form.eventDate);
      const end = new Date(form.endDate);
      if (end < start) {
        toast.error("Ngày kết thúc không được trước ngày bắt đầu.");
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        notes: form.notes.trim(),
        status: form.status,
      };

      if (!isLocked) {
        payload.eventName = form.eventName.trim();
        payload.description = form.description.trim();
        payload.eventDate = form.eventDate || undefined;
        payload.location = form.location.trim();
        payload.guestCount = Number(form.guestCount);
        payload.estimatedBudget = Number(form.estimatedBudget);

        if (form.managerId.trim()) {
          payload.managerId = form.managerId.trim();
        } else {
          payload.manager = null;
        }
      }

      await eventApi.update(id, payload);
      toast.success("Cập nhật sự kiện thành công.");
      navigate(`/events/${id}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật sự kiện.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="event-state-card">Đang tải dữ liệu sự kiện...</div>;
  }

  if (!eventData) {
    return <div className="event-state-card">Không tìm thấy sự kiện.</div>;
  }

  return (
    <div className="event-module-page">
      <div className="event-page-header">
        <div>
          <p className="event-breadcrumb">Dashboard / Sự kiện / Chỉnh sửa</p>
          <h1>Chỉnh sửa sự kiện</h1>
          <span>{eventData.eventName}</span>
        </div>

        <button
          type="button"
          className="event-secondary-button"
          onClick={() => navigate(`/events/${id}`)}
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
      </div>

      {isCompleted && (
        <div className="event-request-summary" style={{ marginBottom: 20 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <span>Lưu ý</span>
            <strong>
              Sự kiện đã hoàn thành — không thể sửa tên, ngày, địa điểm, ngân
              sách và người quản lý. Chỉ được cập nhật ghi chú.
            </strong>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="event-request-summary" style={{ marginBottom: 20 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <span>Lưu ý</span>
            <strong>Sự kiện đã hủy — trạng thái không thể thay đổi.</strong>
          </div>
        </div>
      )}

      <form className="event-form-card" onSubmit={handleSubmit}>
        <div className="event-form-grid">
          <label className="event-field">
            <span>Tên sự kiện *</span>
            <input
              value={form.eventName}
              onChange={(e) => updateField("eventName", e.target.value)}
              disabled={isLocked && LOCKED_WHEN_COMPLETED}
              required
            />
          </label>

          <label className="event-field">
            <span>
              <UserRound size={16} />
              Manager ID (Employee)
            </span>
            <input
              value={form.managerId}
              onChange={(e) => updateField("managerId", e.target.value)}
              placeholder="ID nhân viên Event Manager đang active"
              disabled={isLocked}
            />
          </label>

          <label className="event-field event-field-full">
            <span>Mô tả</span>
            <textarea
              rows="4"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              disabled={isLocked}
            />
          </label>

          <label className="event-field">
            <span>
              <CalendarDays size={16} />
              Ngày bắt đầu / tổ chức
            </span>
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => updateField("eventDate", e.target.value)}
              disabled={isLocked}
            />
          </label>

          <label className="event-field">
            <span>
              <CalendarDays size={16} />
              Ngày kết thúc
            </span>
            <input
              type="date"
              value={form.endDate}
              min={form.eventDate || undefined}
              onChange={(e) => updateField("endDate", e.target.value)}
              disabled={isLocked}
            />
          </label>

          <label className="event-field">
            <span>
              <MapPin size={16} />
              Địa điểm
            </span>
            <input
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              disabled={isLocked}
            />
          </label>

          <label className="event-field">
            <span>
              <Users size={16} />
              Số lượng khách
            </span>
            <input
              type="number"
              min="0"
              value={form.guestCount}
              onChange={(e) => updateField("guestCount", e.target.value)}
              disabled={isLocked}
            />
          </label>

          <label className="event-field">
            <span>
              <WalletCards size={16} />
              Ngân sách dự kiến
            </span>
            <input
              type="number"
              min="0"
              value={form.estimatedBudget}
              onChange={(e) => updateField("estimatedBudget", e.target.value)}
              disabled={isLocked}
            />
          </label>

          <label className="event-field">
            <span>Trạng thái</span>
            <select
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              disabled={isCompleted || isCancelled}
            >
              {allowedStatuses.map((status) => (
                <option value={status} key={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>


          <label className="event-field event-field-full">
            <span>Ghi chú nội bộ</span>
            <textarea
              rows="4"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </label>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
          }}
        >
          <span style={{ color: "#64748b", fontSize: 13 }}>Trạng thái hiện tại:</span>
          <StatusBadge status={eventData.status} />
        </div>

        <div className="event-form-footer">
          <button
            type="button"
            className="event-secondary-button"
            onClick={() => navigate(`/events/${id}`)}
          >
            Hủy
          </button>

          <button
            type="submit"
            className="event-primary-button"
            disabled={saving}
          >
            <Save size={18} />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventEdit;
