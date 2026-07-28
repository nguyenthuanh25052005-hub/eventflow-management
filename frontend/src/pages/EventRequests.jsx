import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  Eye,
  FilterX,
  RefreshCw,
  Search,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import eventRequestApi from "../api/eventRequestApi";
import StatusBadge from "../components/events/StatusBadge";
import "./EventManagement.css";

const REQUEST_STATUSES = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "CONSULTING", label: "Đang tư vấn" },
  { value: "CONVERTED", label: "Đã chuyển thành sự kiện" },
  { value: "REJECTED", label: "Đã từ chối" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "eventDateAsc", label: "Ngày tổ chức gần nhất" },
  { value: "budgetDesc", label: "Ngân sách cao nhất" },
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

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("vi-VN");
}

function getRequestTitle(request) {
  return (
    request.title ||
    request.eventName ||
    request.eventType?.name ||
    "Yêu cầu chưa đặt tên"
  );
}

function EventRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [eventType, setEventType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [confirmAction, setConfirmAction] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await eventRequestApi.getAll();
      setRequests(response.data?.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Không thể tải danh sách yêu cầu sự kiện.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const eventTypes = useMemo(() => {
    const values = requests
      .map((request) => request.eventType?.name)
      .filter(Boolean);

    return [...new Set(values)].sort((a, b) => a.localeCompare(b, "vi"));
  }, [requests]);

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((item) => item.status === "PENDING").length,
      consulting: requests.filter((item) => item.status === "CONSULTING")
        .length,
      converted: requests.filter((item) => item.status === "CONVERTED").length,
    }),
    [requests],
  );

  const filteredRequests = useMemo(() => {
    const normalizedKeyword = normalizeText(keyword);

    const result = requests.filter((request) => {
      const requestDate = new Date(
        request.expectedDate || request.eventDate || request.createdAt,
      );

      const searchableText = normalizeText(
        [
          getRequestTitle(request),
          request._id,
          request.customer?.fullName,
          request.customer?.email,
          request.customer?.phone,
          request.eventType?.name,
          request.location,
        ].join(" "),
      );

      const matchesKeyword =
        !normalizedKeyword || searchableText.includes(normalizedKeyword);
      const matchesStatus = !status || request.status === status;
      const matchesEventType =
        !eventType || request.eventType?.name === eventType;
      const matchesFromDate =
        !fromDate ||
        (!Number.isNaN(requestDate.getTime()) &&
          requestDate >= new Date(`${fromDate}T00:00:00`));
      const matchesToDate =
        !toDate ||
        (!Number.isNaN(requestDate.getTime()) &&
          requestDate <= new Date(`${toDate}T23:59:59`));

      return (
        matchesKeyword &&
        matchesStatus &&
        matchesEventType &&
        matchesFromDate &&
        matchesToDate
      );
    });

    return [...result].sort((first, second) => {
      const firstCreated = new Date(first.createdAt || 0).getTime();
      const secondCreated = new Date(second.createdAt || 0).getTime();

      if (sortBy === "oldest") return firstCreated - secondCreated;

      if (sortBy === "eventDateAsc") {
        return (
          new Date(
            first.expectedDate || first.eventDate || "9999-12-31",
          ).getTime() -
          new Date(
            second.expectedDate || second.eventDate || "9999-12-31",
          ).getTime()
        );
      }

      if (sortBy === "budgetDesc") {
        return (
          Number(second.budget || second.estimatedBudget || 0) -
          Number(first.budget || first.estimatedBudget || 0)
        );
      }

      return secondCreated - firstCreated;
    });
  }, [requests, keyword, status, eventType, fromDate, toDate, sortBy]);

  const resetFilters = () => {
    setKeyword("");
    setStatus("");
    setEventType("");
    setFromDate("");
    setToDate("");
    setSortBy("newest");
  };

  const openConfirm = (request, nextStatus) => {
    setConfirmAction({
      request,
      nextStatus,
      title:
        nextStatus === "CONSULTING"
          ? "Duyệt yêu cầu sự kiện?"
          : "Từ chối yêu cầu sự kiện?",
      description:
        nextStatus === "CONSULTING"
          ? "Yêu cầu sẽ chuyển sang trạng thái Đang tư vấn và có thể được tạo thành sự kiện."
          : "Yêu cầu sẽ chuyển sang trạng thái Đã từ chối. Hãy chắc chắn thông tin đã được xác minh.",
    });
  };

  const updateStatus = async () => {
    if (!confirmAction) return;

    const { request, nextStatus } = confirmAction;

    try {
      setProcessingId(request._id);
      await eventRequestApi.updateStatus(request._id, nextStatus);

      toast.success(
        nextStatus === "CONSULTING"
          ? "Đã duyệt yêu cầu."
          : "Đã từ chối yêu cầu.",
      );

      setConfirmAction(null);
      await loadRequests();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật yêu cầu.",
      );
    } finally {
      setProcessingId("");
    }
  };

  return (
    <div className="event-module-page">
      <div className="event-page-header">
        <div>
          <p className="event-breadcrumb">Dashboard / Yêu cầu sự kiện</p>
          <h1>Yêu cầu sự kiện</h1>
          <span>
            Tiếp nhận, phân loại và xử lý theo đúng quy trình nghiệp vụ.
          </span>
        </div>

        <button
          type="button"
          className="event-secondary-button"
          onClick={loadRequests}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? "event-spin" : ""} />
          Làm mới
        </button>
      </div>

      <section className="request-stat-grid">
        <article className="request-stat-card">
          <span className="request-stat-icon blue">
            <Sparkles size={20} />
          </span>
          <div>
            <small>Tổng yêu cầu</small>
            <strong>{stats.total}</strong>
          </div>
        </article>

        <article className="request-stat-card">
          <span className="request-stat-icon orange">
            <CalendarClock size={20} />
          </span>
          <div>
            <small>Chờ xử lý</small>
            <strong>{stats.pending}</strong>
          </div>
        </article>

        <article className="request-stat-card">
          <span className="request-stat-icon cyan">
            <UserCheck size={20} />
          </span>
          <div>
            <small>Đang tư vấn</small>
            <strong>{stats.consulting}</strong>
          </div>
        </article>

        <article className="request-stat-card">
          <span className="request-stat-icon green">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <small>Đã chuyển đổi</small>
            <strong>{stats.converted}</strong>
          </div>
        </article>
      </section>

      <section className="event-filter-card request-advanced-filter">
        <div className="request-filter-grid">
          <label className="event-field request-search-field">
            <span>Tìm kiếm</span>
            <div className="event-input-icon">
              <Search size={18} />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tên yêu cầu, khách hàng, email, SĐT hoặc mã..."
              />
            </div>
          </label>

          <label className="event-field">
            <span>Trạng thái</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {REQUEST_STATUSES.map((option) => (
                <option value={option.value} key={option.value || "all"}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="event-field">
            <span>Loại sự kiện</span>
            <select
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
            >
              <option value="">Tất cả loại sự kiện</option>
              {eventTypes.map((name) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="event-field">
            <span>Từ ngày</span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>

          <label className="event-field">
            <span>Đến ngày</span>
            <input
              type="date"
              min={fromDate || undefined}
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>

          <label className="event-field">
            <span>Sắp xếp</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="event-secondary-button request-reset-button"
            onClick={resetFilters}
          >
            <FilterX size={18} />
            Xóa bộ lọc
          </button>
        </div>
      </section>

      <section className="event-table-card">
        <div className="event-table-heading">
          <div>
            <h2>Danh sách yêu cầu</h2>
            <p>
              {filteredRequests.length} / {requests.length} yêu cầu
            </p>
          </div>
        </div>

        <div className="event-table-scroll">
          <table className="event-management-table request-table">
            <thead>
              <tr>
                <th>Yêu cầu</th>
                <th>Khách hàng</th>
                <th>Loại sự kiện</th>
                <th>Ngày dự kiến</th>
                <th>Ngân sách</th>
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

              {!loading && filteredRequests.length === 0 && (
                <tr>
                  <td colSpan="7" className="event-empty-cell">
                    Không tìm thấy yêu cầu phù hợp với bộ lọc.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredRequests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <strong>{getRequestTitle(request)}</strong>
                      <small>
                        Mã:{" "}
                        {request.code ||
                          request.requestCode ||
                          request._id?.slice(-8).toUpperCase()}
                      </small>
                    </td>

                    <td>
                      <strong>
                        {request.customer?.fullName || "Chưa cập nhật"}
                      </strong>
                      <small>{request.customer?.email || ""}</small>
                    </td>

                    <td>{request.eventType?.name || "Chưa cập nhật"}</td>
                    <td>
                      {formatDate(request.expectedDate || request.eventDate)}
                    </td>
                    <td>
                      {formatMoney(request.budget || request.estimatedBudget)}
                    </td>
                    <td>
                      <StatusBadge status={request.status} />
                    </td>

                    <td>
                      <div className="event-action-group">
                        <Link
                          to={`/event-requests/${request._id}`}
                          className="event-icon-button view"
                          title="Xem chi tiết"
                        >
                          <Eye size={17} />
                        </Link>

                        {request.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              className="event-icon-button approve"
                              onClick={() => openConfirm(request, "CONSULTING")}
                              disabled={processingId === request._id}
                              title="Duyệt yêu cầu"
                            >
                              <Check size={17} />
                            </button>

                            <button
                              type="button"
                              className="event-icon-button reject"
                              onClick={() => openConfirm(request, "REJECTED")}
                              disabled={processingId === request._id}
                              title="Từ chối yêu cầu"
                            >
                              <X size={17} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {confirmAction && (
        <div className="event-modal-backdrop">
          <div className="event-modal request-confirm-modal">
            <div className="event-modal-header">
              <div>
                <h2>{confirmAction.title}</h2>
                <p>{getRequestTitle(confirmAction.request)}</p>
              </div>

              <button
                type="button"
                className="event-modal-close"
                onClick={() => setConfirmAction(null)}
                disabled={Boolean(processingId)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="event-modal-body">
              <p className="request-confirm-description">
                {confirmAction.description}
              </p>
            </div>

            <div className="event-modal-footer">
              <button
                type="button"
                className="event-secondary-button"
                onClick={() => setConfirmAction(null)}
                disabled={Boolean(processingId)}
              >
                Hủy
              </button>

              <button
                type="button"
                className={
                  confirmAction.nextStatus === "REJECTED"
                    ? "event-reject-button"
                    : "event-approve-button"
                }
                onClick={updateStatus}
                disabled={Boolean(processingId)}
              >
                {confirmAction.nextStatus === "REJECTED" ? (
                  <X size={18} />
                ) : (
                  <Check size={18} />
                )}
                {processingId
                  ? "Đang xử lý..."
                  : confirmAction.nextStatus === "REJECTED"
                    ? "Xác nhận từ chối"
                    : "Xác nhận duyệt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventRequests;
