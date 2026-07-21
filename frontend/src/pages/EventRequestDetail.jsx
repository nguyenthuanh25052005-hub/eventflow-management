import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarPlus,
  Check,
  Eye,
  Mail,
  MapPin,
  Phone,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import eventRequestApi from "../api/eventRequestApi";
import StatusBadge from "../components/events/StatusBadge";
import "./EventManagement.css";

function formatDate(value) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function formatMoney(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Chưa cập nhật";
  }

  return `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;
}

function EventRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadRequest = async () => {
    try {
      setLoading(true);

      const response = await eventRequestApi.getById(id);

      setRequest(response.data?.data || null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Không thể tải chi tiết yêu cầu."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, [id]);

  const updateStatus = async (status) => {
    try {
      setUpdating(true);

      await eventRequestApi.updateStatus(id, status);

      toast.success(
        status === "CONSULTING"
          ? "Đã duyệt yêu cầu."
          : "Đã từ chối yêu cầu."
      );

      await loadRequest();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Không thể cập nhật yêu cầu."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="event-state-card">
        Đang tải dữ liệu yêu cầu...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="event-state-card">
        Không tìm thấy yêu cầu sự kiện.
      </div>
    );
  }

  const normalizedStatus = String(
    request.status || "PENDING"
  ).toUpperCase();

  const convertedEventId =
    request.event?._id ||
    request.eventId ||
    request.convertedEvent?._id ||
    request.convertedEventId;

  return (
    <div className="event-module-page">
      <div className="event-page-header">
        <div>
          <p className="event-breadcrumb">
            Dashboard / Yêu cầu sự kiện / Chi tiết
          </p>

          <h1>Chi tiết yêu cầu</h1>

          <span>
            {request.title ||
              request.eventName ||
              "Yêu cầu tổ chức sự kiện"}
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

      <section className="event-detail-card">
        <div className="event-detail-title">
          <div>
            <h2>
              {request.title ||
                request.eventName ||
                "Yêu cầu tổ chức sự kiện"}
            </h2>

            <p>
              Mã yêu cầu:{" "}
              {request.code ||
                request.requestCode ||
                request._id?.slice(-8).toUpperCase()}
            </p>
          </div>

          <StatusBadge status={request.status} />
        </div>

        <div className="event-detail-grid">
          <div className="event-detail-item">
            <span>Khách hàng</span>
            <strong>
              {request.customer?.fullName ||
                request.customerName ||
                "Chưa cập nhật"}
            </strong>
          </div>

          <div className="event-detail-item">
            <span>Loại sự kiện</span>
            <strong>
              {request.eventType?.name ||
                request.eventTypeName ||
                "Chưa cập nhật"}
            </strong>
          </div>

          <div className="event-detail-item">
            <span>
              <Mail size={16} />
              Email
            </span>
            <strong>
              {request.customer?.email ||
                request.email ||
                "Chưa cập nhật"}
            </strong>
          </div>

          <div className="event-detail-item">
            <span>
              <Phone size={16} />
              Điện thoại
            </span>
            <strong>
              {request.customer?.phone ||
                request.phone ||
                "Chưa cập nhật"}
            </strong>
          </div>

          <div className="event-detail-item">
            <span>
              <CalendarPlus size={16} />
              Ngày dự kiến
            </span>
            <strong>
              {formatDate(
                request.expectedDate ||
                  request.eventDate ||
                  request.date
              )}
            </strong>
          </div>

          <div className="event-detail-item">
            <span>
              <Users size={16} />
              Số khách
            </span>
            <strong>
              {request.expectedGuests ||
                request.guestCount ||
                0}
            </strong>
          </div>

          <div className="event-detail-item">
            <span>Ngân sách</span>
            <strong>
              {formatMoney(
                request.budget ||
                  request.estimatedBudget
              )}
            </strong>
          </div>

          <div className="event-detail-item">
            <span>
              <MapPin size={16} />
              Địa điểm
            </span>
            <strong>
              {request.location ||
                request.venue ||
                "Chưa cập nhật"}
            </strong>
          </div>
        </div>

        <div className="event-description-box">
          <span>Mô tả yêu cầu</span>
          <p>
            {request.description ||
              request.notes ||
              "Không có mô tả."}
          </p>
        </div>

        <div className="event-request-action-panel">
          <div>
            <h3>Thao tác xử lý</h3>
            <p>
              Cập nhật trạng thái hoặc chuyển yêu cầu thành sự kiện.
            </p>
          </div>

          <div className="event-detail-actions">
            {normalizedStatus === "PENDING" && (
              <>
                <button
                  type="button"
                  className="event-approve-button"
                  onClick={() => updateStatus("CONSULTING")}
                  disabled={updating}
                >
                  <Check size={18} />
                  {updating ? "Đang xử lý..." : "Duyệt yêu cầu"}
                </button>

                <button
                  type="button"
                  className="event-reject-button"
                  onClick={() => updateStatus("REJECTED")}
                  disabled={updating}
                >
                  <X size={18} />
                  Từ chối
                </button>
              </>
            )}

            {normalizedStatus === "CONSULTING" && (
              <Link
                to={`/event-requests/${request._id}/create-event`}
                className="event-primary-button"
              >
                <CalendarPlus size={18} />
                Chuyển thành sự kiện
              </Link>
            )}

            {normalizedStatus === "CONVERTED" && (
              <>
                <div className="event-converted-note">
                  <Check size={18} />
                  Yêu cầu đã được chuyển thành sự kiện.
                </div>

                {convertedEventId && (
                  <Link
                    to={`/events/${convertedEventId}`}
                    className="event-primary-button"
                  >
                    <Eye size={18} />
                    Xem sự kiện
                  </Link>
                )}
              </>
            )}

            {normalizedStatus === "REJECTED" && (
              <div className="event-rejected-note">
                <X size={18} />
                Yêu cầu đã bị từ chối.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default EventRequestDetail;
