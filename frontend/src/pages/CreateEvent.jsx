import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarPlus,
  MapPin,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import toast from "react-hot-toast";

import eventApi from "../api/eventApi";
import eventRequestApi from "../api/eventRequestApi";
import "./EventManagement.css";

function CreateEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    managerId: "",
    eventName: "",
    description: "",
    eventDate: "",
    location: "",
    guestCount: 0,
    estimatedBudget: 0,
    notes: "",
  });

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        const response = await eventRequestApi.getById(id);
        const data = response.data?.data || null;

        setRequest(data);

        if (data) {
          setForm({
            managerId: "",
            eventName:
              data.title || data.eventName || data.eventType?.name || "",
            description: data.description || "",
            eventDate:
              data.expectedDate || data.eventDate
                ? new Date(data.expectedDate || data.eventDate)
                    .toISOString()
                    .slice(0, 10)
                : "",
            location: data.location || data.venue || "",
            guestCount: data.expectedGuests || data.guestCount || 0,
            estimatedBudget: data.budget || data.estimatedBudget || 0,
            notes: "",
          });
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Không thể tải yêu cầu sự kiện.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [id]);

  const updateField = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.eventName.trim()) {
      toast.error("Tên sự kiện là bắt buộc.");
      return;
    }

    if (!form.eventDate || !form.location.trim()) {
      toast.error("Vui lòng nhập ngày và địa điểm tổ chức.");
      return;
    }

    if (form.endDate && form.eventDate) {
      const start = new Date(form.eventDate);
      const end = new Date(form.endDate);
      if (end < start) {
        toast.error("Ngày kết thúc không được trước ngày bắt đầu.");
        return;
      }
    }

    try {
      setSubmitting(true);

      const payload = {
        eventRequestId: id,
        eventName: form.eventName.trim(),
        description: form.description.trim(),
        eventDate: form.eventDate,
        location: form.location.trim(),
        guestCount: Number(form.guestCount),
        estimatedBudget: Number(form.estimatedBudget),
        notes: form.notes.trim(),
      };

      if (form.managerId.trim()) {
        payload.managerId = form.managerId.trim();
      }

      const response = await eventApi.create(payload);

      const createdEvent = response.data?.data || response.data;

      toast.success("Tạo sự kiện thành công.");

      if (createdEvent?._id) {
        navigate(`/events/${createdEvent._id}`, {
          replace: true,
        });
      } else {
        navigate("/events", {
          replace: true,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tạo sự kiện.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="event-state-card">Đang tải dữ liệu yêu cầu...</div>;
  }

  if (!request) {
    return (
      <div className="event-state-card">
        Không tìm thấy yêu cầu để tạo sự kiện.
      </div>
    );
  }

  return (
    <div className="event-module-page">
      <div className="event-page-header">
        <div>
          <p className="event-breadcrumb">
            Dashboard / Yêu cầu sự kiện / Tạo sự kiện
          </p>

          <h1>Tạo sự kiện mới</h1>

          <span>
            Chuyển yêu cầu “
            {request.title || request.eventName || "Chưa đặt tên"}” thành sự
            kiện.
          </span>
        </div>

        <button
          type="button"
          className="event-secondary-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
      </div>

      <section className="event-request-summary">
        <div>
          <span>Khách hàng</span>
          <strong>{request.customer?.fullName || "Chưa cập nhật"}</strong>
        </div>

        <div>
          <span>Loại sự kiện</span>
          <strong>{request.eventType?.name || "Chưa cập nhật"}</strong>
        </div>

        <div>
          <span>Ngân sách yêu cầu</span>
          <strong>
            {new Intl.NumberFormat("vi-VN").format(
              Number(request.budget || request.estimatedBudget || 0),
            )}{" "}
            VNĐ
          </strong>
        </div>
      </section>

      <form className="event-form-card" onSubmit={handleSubmit}>
        <div className="event-form-grid">
          <label className="event-field">
            <span><UserRound size={16} />Manager ID</span>
            <input
              value={form.managerId}
              onChange={(event) => updateField("managerId", event.target.value)}
              placeholder="Có thể để trống và phân công sau"
            />
          </label>

          <label className="event-field">
            <span>
              <CalendarPlus size={16} />
              Tên sự kiện *
            </span>

            <input
              value={form.eventName}
              onChange={(event) => updateField("eventName", event.target.value)}
            />
          </label>

          <label className="event-field event-field-full">
            <span>Mô tả</span>

            <textarea
              rows="4"
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
            />
          </label>

          <label className="event-field">
            <span>
              <CalendarPlus size={16} />
              Ngày tổ chức *
            </span>

            <input
              type="date"
              value={form.eventDate}
              onChange={(event) => updateField("eventDate", event.target.value)}
            />
          </label>

          <label className="event-field">
            <span>
              <MapPin size={16} />
              Địa điểm *
            </span>

            <input
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
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
              onChange={(event) =>
                updateField("guestCount", event.target.value)
              }
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
              onChange={(event) =>
                updateField("estimatedBudget", event.target.value)
              }
            />
          </label>

          <label className="event-field event-field-full">
            <span>Ghi chú nội bộ</span>

            <textarea
              rows="4"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </label>
        </div>

        <div className="event-form-footer">
          <button
            type="button"
            className="event-secondary-button"
            onClick={() => navigate(-1)}
          >
            Hủy
          </button>

          <button
            type="submit"
            className="event-primary-button"
            disabled={submitting}
          >
            <CalendarPlus size={18} />
            {submitting ? "Đang tạo..." : "Tạo sự kiện"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;
