import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Eye, RefreshCw, Search, X } from "lucide-react";
import toast from "react-hot-toast";

import eventRequestApi from "../api/eventRequestApi";
import StatusBadge from "../components/events/StatusBadge";
import "./EventManagement.css";

const REQUEST_STATUSES = ["PENDING", "CONSULTING", "REJECTED", "CONVERTED"];

function formatDate(value) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function formatMoney(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Chưa cập nhật";
  }

  return `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;
}

function EventRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);

      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (status) params.status = status;

      const response = await eventRequestApi.getAll(params);
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

  const updateStatus = async (id, nextStatus) => {
    try {
      await eventRequestApi.updateStatus(id, nextStatus);

      toast.success(
        nextStatus === "CONSULTING"
          ? "Đã duyệt yêu cầu."
          : "Đã từ chối yêu cầu.",
      );

      await loadRequests();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật yêu cầu.",
      );
    }
  };

  return (
    <div className="event-module-page">
      <div className="event-page-header">
        <div>
          <p className="event-breadcrumb">Dashboard / Yêu cầu sự kiện</p>
          <h1>Yêu cầu sự kiện</h1>
          <span>Tiếp nhận, duyệt và chuyển yêu cầu thành sự kiện.</span>
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

      <section className="event-filter-card">
        <div className="event-request-filter-grid">
          <label className="event-field">
            <span>Tìm kiếm</span>
            <div className="event-input-icon">
              <Search size={18} />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tên yêu cầu hoặc khách hàng..."
                onKeyDown={(event) => {
                  if (event.key === "Enter") loadRequests();
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
              {REQUEST_STATUSES.map((option) => (
                <option value={option} key={option}>
                  {option.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="event-primary-button event-search-button"
            onClick={loadRequests}
          >
            <Search size={18} />
            Tìm kiếm
          </button>
        </div>
      </section>

      <section className="event-table-card">
        <div className="event-table-heading">
          <div>
            <h2>Danh sách yêu cầu</h2>
            <p>{requests.length} yêu cầu được tìm thấy</p>
          </div>
        </div>

        <div className="event-table-scroll">
          <table className="event-management-table">
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

              {!loading && requests.length === 0 && (
                <tr>
                  <td colSpan="7" className="event-empty-cell">
                    Chưa có yêu cầu phù hợp.
                  </td>
                </tr>
              )}

              {!loading &&
                requests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <strong>
                        {request.title ||
                          request.eventName ||
                          "Yêu cầu chưa đặt tên"}
                      </strong>
                      <small>{request._id?.slice(-8).toUpperCase()}</small>
                    </td>

                    <td>
                      <strong>
                        {request.customer?.fullName || "Chưa cập nhật"}
                      </strong>
                      <small>{request.customer?.email || ""}</small>
                    </td>

                    <td>{request.eventType?.name || "Chưa cập nhật"}</td>
                    <td>{formatDate(request.expectedDate)}</td>
                    <td>{formatMoney(request.budget)}</td>
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
                              onClick={() =>
                                updateStatus(request._id, "CONSULTING")
                              }
                              title="Duyệt yêu cầu"
                            >
                              <Check size={17} />
                            </button>

                            <button
                              type="button"
                              className="event-icon-button reject"
                              onClick={() =>
                                updateStatus(request._id, "REJECTED")
                              }
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
    </div>
  );
}

export default EventRequests;
