import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Eye,
  Pencil,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import eventApi from "../api/eventApi";
import StatusBadge from "../components/events/StatusBadge";
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

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [managerId, setManagerId] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    status: "PENDING",
    progress: 0,
    notes: "",
  });

  const loadEvents = async () => {
    try {
      setLoading(true);

      const params = {};

      if (keyword.trim()) params.keyword = keyword.trim();
      if (status) params.status = status;
      if (managerId.trim()) params.managerId = managerId.trim();

      const response = await eventApi.getAll(params);
      setEvents(response.data?.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách sự kiện."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      status: event.status || "PENDING",
      progress: Number(event.progress || 0),
      notes: event.notes || "",
    });
  };

  const handleSave = async () => {
    try {
      await eventApi.update(editingEvent._id, {
        status: formData.status,
        progress: Number(formData.progress),
        notes: formData.notes,
      });

      toast.success("Cập nhật sự kiện thành công.");
      setEditingEvent(null);
      await loadEvents();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật sự kiện."
      );
    }
  };

  return (
    <div className="event-module-page">
      <div className="event-page-header">
        <div>
          <p className="event-breadcrumb">Dashboard / Sự kiện</p>
          <h1>Quản lý sự kiện</h1>
          <span>Theo dõi tiến độ và cập nhật trạng thái sự kiện.</span>
        </div>

        <button
          type="button"
          className="event-secondary-button"
          onClick={loadEvents}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? "event-spin" : ""} />
          Làm mới
        </button>
      </div>

      <section className="event-filter-card">
        <div className="event-filter-grid">
          <label className="event-field">
            <span>Tìm kiếm</span>
            <div className="event-input-icon">
              <Search size={18} />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tên sự kiện hoặc khách hàng..."
                onKeyDown={(event) => {
                  if (event.key === "Enter") loadEvents();
                }}
              />
            </div>
          </label>

          <label className="event-field">
            <span>Trạng thái</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((option) => (
                <option value={option} key={option}>
                  {option.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <label className="event-field">
            <span>Mã người quản lý</span>
            <input
              value={managerId}
              onChange={(event) => setManagerId(event.target.value)}
              placeholder="Nhập manager ID"
            />
          </label>

          <button
            type="button"
            className="event-primary-button event-search-button"
            onClick={loadEvents}
          >
            <Search size={18} />
            Tìm kiếm
          </button>
        </div>
      </section>

      <section className="event-table-card">
        <div className="event-table-heading">
          <div>
            <h2>Danh sách sự kiện</h2>
            <p>{events.length} sự kiện được tìm thấy</p>
          </div>
        </div>

        <div className="event-table-scroll">
          <table className="event-management-table">
            <thead>
              <tr>
                <th>Sự kiện</th>
                <th>Khách hàng</th>
                <th>Người phụ trách</th>
                <th>Ngày tổ chức</th>
                <th>Tiến độ</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7" className="event-empty-cell">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}

              {!loading && events.length === 0 && (
                <tr>
                  <td colSpan="7" className="event-empty-cell">
                    Chưa có sự kiện phù hợp.
                  </td>
                </tr>
              )}

              {!loading &&
                events.map((event) => (
                  <tr key={event._id}>
                    <td>
                      <div className="event-name-cell">
                        <span className="event-name-icon">
                          <CalendarDays size={19} />
                        </span>

                        <div>
                          <strong>
                            {event.eventName ||
                              event.name ||
                              event.eventType?.name ||
                              "Sự kiện chưa đặt tên"}
                          </strong>
                          <span>
                            {event.code ||
                              event.eventCode ||
                              event._id?.slice(-8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong>{event.customer?.fullName || "Chưa cập nhật"}</strong>
                      <small>{event.customer?.email || ""}</small>
                    </td>

                    <td>
                      {event.manager?.user?.fullName ||
                        event.manager?.fullName ||
                        "Chưa phân công"}
                    </td>

                    <td>{formatDate(event.eventDate)}</td>

                    <td>
                      <div className="event-progress-cell">
                        <div>
                          <span
                            style={{
                              width: `${Math.min(
                                Math.max(Number(event.progress || 0), 0),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <small>{Number(event.progress || 0)}%</small>
                      </div>
                    </td>

                    <td>
                      <StatusBadge status={event.status} />
                    </td>

                    <td>
                      <div className="event-action-group">
                        <Link
                          to={`/events/${event._id}`}
                          className="event-icon-button view"
                          title="Xem chi tiết"
                        >
                          <Eye size={17} />
                        </Link>

                        <button
                          type="button"
                          className="event-icon-button edit"
                          onClick={() => openEditModal(event)}
                          title="Cập nhật"
                        >
                          <Pencil size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {editingEvent && (
        <div className="event-modal-backdrop">
          <div className="event-modal">
            <div className="event-modal-header">
              <div>
                <h2>Cập nhật sự kiện</h2>
                <p>
                  {editingEvent.eventName ||
                    editingEvent.name ||
                    "Sự kiện"}
                </p>
              </div>

              <button
                type="button"
                className="event-modal-close"
                onClick={() => setEditingEvent(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="event-modal-body">
              <label className="event-field">
                <span>Trạng thái</span>
                <select
                  value={formData.status}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option value={option} key={option}>
                      {option.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label className="event-field">
                <span>Tiến độ (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      progress: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="event-field">
                <span>Ghi chú</span>
                <textarea
                  rows="4"
                  value={formData.notes}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="event-modal-footer">
              <button
                type="button"
                className="event-secondary-button"
                onClick={() => setEditingEvent(null)}
              >
                Hủy
              </button>

              <button
                type="button"
                className="event-primary-button"
                onClick={handleSave}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
