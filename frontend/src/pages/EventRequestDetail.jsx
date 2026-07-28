import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarPlus,
  Check,
  Clock3,
  Eye,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import eventRequestApi from "../api/eventRequestApi";
import StatusBadge from "../components/events/StatusBadge";
import "./EventManagement.css";

function formatDate(value, includeTime = false) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(date);
}

function formatMoney(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "Chưa cập nhật";
  return `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;
}

function EventRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState("");

  const loadRequest = async () => {
    try {
      setLoading(true);
      const response = await eventRequestApi.getById(id);
      setRequest(response.data?.data || null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể tải chi tiết yêu cầu.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, [id]);

  const updateStatus = async () => {
    if (!confirmStatus) return;

    try {
      setUpdating(true);
      await eventRequestApi.updateStatus(id, confirmStatus);

      toast.success(
        confirmStatus === "CONSULTING"
          ? "Đã duyệt yêu cầu."
          : "Đã từ chối yêu cầu.",
      );

      setConfirmStatus("");
      await loadRequest();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật yêu cầu.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const timeline = useMemo(() => {
    if (!request) return [];

    const items = [
      {
        title: "Khởi tạo yêu cầu",
        description: "Yêu cầu được ghi nhận trên hệ thống.",
        time: request.createdAt,
        status: "PENDING",
      },
    ];

    const status = String(request.status || "").toUpperCase();

    if (["CONSULTING", "CONVERTED"].includes(status)) {
      items.push({
        title: "Yêu cầu được duyệt",
        description: "Yêu cầu đã chuyển sang giai đoạn tư vấn.",
        time: request.consultingAt || request.updatedAt || request.createdAt,
        status: "CONSULTING",
      });
    }

    if (status === "CONVERTED") {
      items.push({
        title: "Đã chuyển thành sự kiện",
        description: "Yêu cầu đã được dùng để tạo sự kiện.",
        time: request.convertedAt || request.updatedAt || request.createdAt,
        status: "CONVERTED",
      });
    }

    if (status === "REJECTED") {
      items.push({
        title: "Yêu cầu bị từ chối",
        description: "Yêu cầu không tiếp tục trong quy trình xử lý.",
        time: request.rejectedAt || request.updatedAt || request.createdAt,
        status: "REJECTED",
      });
    }

    return items;
  }, [request]);

  if (loading) {
    return (
      <div className="event-state-card">
        <RefreshCw className="event-spin" size={26} />
        <span>Đang tải dữ liệu yêu cầu...</span>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="event-state-card">Không tìm thấy yêu cầu sự kiện.</div>
    );
  }

  const normalizedStatus = String(request.status || "PENDING").toUpperCase();

  const convertedEventId =
    request.event?._id ||
    request.eventId ||
    request.convertedEvent?._id ||
    request.convertedEventId;

  const requestTitle =
    request.title ||
    request.eventName ||
    request.eventType?.name ||
    "Yêu cầu tổ chức sự kiện";

  return (
    <div className="event-module-page">
      <div className="event-page-header">
        <div>
          <p className="event-breadcrumb">
            Dashboard / Yêu cầu sự kiện / Chi tiết
          </p>
          <h1>Chi tiết yêu cầu</h1>
          <span>{requestTitle}</span>
        </div>

        <div className="event-detail-header-actions">
          <button
            type="button"
            className="event-secondary-button"
            onClick={loadRequest}
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

      <section className="request-detail-hero">
        <div>
          <p>EVENT REQUEST</p>
          <h2>{requestTitle}</h2>
          <span>
            Mã yêu cầu:{" "}
            {request.code ||
              request.requestCode ||
              request._id?.slice(-8).toUpperCase()}
          </span>
        </div>

        <StatusBadge status={request.status} />
      </section>

      <section className="request-detail-layout">
        <div className="request-detail-main">
          <section className="event-detail-card">
            <div className="request-section-heading">
              <div>
                <h2>Thông tin yêu cầu</h2>
                <p>Dữ liệu khách hàng và nhu cầu tổ chức sự kiện</p>
              </div>
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
                  {request.customer?.email || request.email || "Chưa cập nhật"}
                </strong>
              </div>

              <div className="event-detail-item">
                <span>
                  <Phone size={16} />
                  Điện thoại
                </span>
                <strong>
                  {request.customer?.phone || request.phone || "Chưa cập nhật"}
                </strong>
              </div>

              <div className="event-detail-item">
                <span>
                  <CalendarPlus size={16} />
                  Ngày dự kiến
                </span>
                <strong>
                  {formatDate(
                    request.expectedDate || request.eventDate || request.date,
                  )}
                </strong>
              </div>

              <div className="event-detail-item">
                <span>
                  <Users size={16} />
                  Số khách
                </span>
                <strong>
                  {request.expectedGuests || request.guestCount || 0}
                </strong>
              </div>

              <div className="event-detail-item">
                <span>Ngân sách</span>
                <strong>
                  {formatMoney(request.budget || request.estimatedBudget)}
                </strong>
              </div>

              <div className="event-detail-item">
                <span>
                  <MapPin size={16} />
                  Địa điểm
                </span>
                <strong>
                  {request.location || request.venue || "Chưa cập nhật"}
                </strong>
              </div>
            </div>

            <div className="event-description-box">
              <span>Mô tả yêu cầu</span>
              <p>{request.description || request.notes || "Không có mô tả."}</p>
            </div>
          </section>

          <section className="event-detail-card">
            <div className="request-section-heading">
              <div>
                <h2>Lịch sử xử lý</h2>
                <p>Các mốc trạng thái của yêu cầu sự kiện</p>
              </div>
            </div>

            <div className="request-process-timeline">
              {timeline.map((item, index) => (
                <div
                  className="request-process-item"
                  key={`${item.status}-${index}`}
                >
                  <div className="request-process-marker">
                    <span />
                    {index < timeline.length - 1 && <i />}
                  </div>

                  <div className="request-process-content">
                    <div>
                      <strong>{item.title}</strong>
                      <StatusBadge status={item.status} />
                    </div>

                    <p>{item.description}</p>

                    <small>
                      <Clock3 size={14} />
                      {formatDate(item.time, true)}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="request-detail-sidebar">
          <section className="event-control-card">
            <div className="event-control-heading">
              <Check size={21} />
              <div>
                <h3>Xử lý yêu cầu</h3>
                <p>Thao tác theo trạng thái nghiệp vụ hiện tại</p>
              </div>
            </div>

            {normalizedStatus === "PENDING" && (
              <div className="request-sidebar-actions">
                <button
                  type="button"
                  className="event-approve-button"
                  onClick={() => setConfirmStatus("CONSULTING")}
                >
                  <Check size={18} />
                  Duyệt yêu cầu
                </button>

                <button
                  type="button"
                  className="event-reject-button"
                  onClick={() => setConfirmStatus("REJECTED")}
                >
                  <X size={18} />
                  Từ chối yêu cầu
                </button>
              </div>
            )}

            {normalizedStatus === "CONSULTING" && (
              <div className="request-sidebar-actions">
                <p className="request-sidebar-note">
                  Yêu cầu đã được duyệt. Hãy xác nhận thông tin tư vấn trước khi
                  tạo sự kiện.
                </p>

                <Link
                  to={`/event-requests/${request._id}/create-event`}
                  className="event-primary-button"
                >
                  <CalendarPlus size={18} />
                  Chuyển thành sự kiện
                </Link>
              </div>
            )}

            {normalizedStatus === "CONVERTED" && (
              <div className="request-sidebar-actions">
                <div className="event-converted-note">
                  <Check size={18} />
                  Đã chuyển thành sự kiện
                </div>

                {convertedEventId ? (
                  <Link
                    to={`/events/${convertedEventId}`}
                    className="event-primary-button"
                  >
                    <Eye size={18} />
                    Xem sự kiện
                  </Link>
                ) : (
                  <p className="request-sidebar-note">
                    Backend chưa trả về mã sự kiện liên kết.
                  </p>
                )}
              </div>
            )}

            {normalizedStatus === "REJECTED" && (
              <div className="event-rejected-note">
                <X size={18} />
                Yêu cầu đã bị từ chối
              </div>
            )}
          </section>

          <section className="event-control-card">
            <div className="event-control-heading">
              <Clock3 size={21} />
              <div>
                <h3>Thông tin hệ thống</h3>
                <p>Thời gian tạo và cập nhật gần nhất</p>
              </div>
            </div>

            <div className="event-system-info">
              <div>
                <span>Ngày tạo</span>
                <strong>{formatDate(request.createdAt, true)}</strong>
              </div>

              <div>
                <span>Cập nhật gần nhất</span>
                <strong>{formatDate(request.updatedAt, true)}</strong>
              </div>

              <div>
                <span>Trạng thái hiện tại</span>
                <StatusBadge status={request.status} />
              </div>
            </div>
          </section>
        </aside>
      </section>

      {confirmStatus && (
        <div className="event-modal-backdrop">
          <div className="event-modal request-confirm-modal">
            <div className="event-modal-header">
              <div>
                <h2>
                  {confirmStatus === "CONSULTING"
                    ? "Duyệt yêu cầu?"
                    : "Từ chối yêu cầu?"}
                </h2>
                <p>{requestTitle}</p>
              </div>

              <button
                type="button"
                className="event-modal-close"
                onClick={() => setConfirmStatus("")}
                disabled={updating}
              >
                <X size={20} />
              </button>
            </div>

            <div className="event-modal-body">
              <p className="request-confirm-description">
                {confirmStatus === "CONSULTING"
                  ? "Yêu cầu sẽ chuyển sang trạng thái Đang tư vấn. Sau đó mới có thể tạo sự kiện."
                  : "Yêu cầu sẽ chuyển sang trạng thái Đã từ chối. Hãy chắc chắn rằng thông tin đã được kiểm tra."}
              </p>
            </div>

            <div className="event-modal-footer">
              <button
                type="button"
                className="event-secondary-button"
                onClick={() => setConfirmStatus("")}
                disabled={updating}
              >
                Hủy
              </button>

              <button
                type="button"
                className={
                  confirmStatus === "REJECTED"
                    ? "event-reject-button"
                    : "event-approve-button"
                }
                onClick={updateStatus}
                disabled={updating}
              >
                {confirmStatus === "REJECTED" ? (
                  <X size={18} />
                ) : (
                  <Check size={18} />
                )}
                {updating ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventRequestDetail;
