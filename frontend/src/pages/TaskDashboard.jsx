import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

import taskApi from "../api/taskApi";
import "./TaskDashboard.css";

const EMPTY_SUMMARY = {
  total: 0,
  todo: 0,
  inProgress: 0,
  done: 0,
  overdue: 0,
};

const STATUS_LABELS = {
  TODO: "Cần làm",
  IN_PROGRESS: "Đang thực hiện",
  DONE: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const PRIORITY_LABELS = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  URGENT: "Khẩn cấp",
};

const formatDate = (value) => {
  if (!value) {
    return "Chưa đặt hạn";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Ngày không hợp lệ";
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
};

function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    overdue: false,
  });

  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);

      const params = {
        search: filters.search.trim() || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        overdue: filters.overdue ? "true" : undefined,
      };

      const response = await taskApi.getAll(params);

      const responseData = response.data?.data;
      const receivedTasks = responseData?.tasks;
      const receivedSummary = responseData?.summary;

      setTasks(Array.isArray(receivedTasks) ? receivedTasks : []);

      setSummary({
        ...EMPTY_SUMMARY,
        ...(receivedSummary || {}),
      });
    } catch (error) {
      console.error("Load tasks error:", error);

      setTasks([]);
      setSummary(EMPTY_SUMMARY);

      toast.error(
        error.response?.data?.message || "Không thể tải danh sách công việc.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTasks();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const completionRate = useMemo(() => {
    if (!summary.total) {
      return 0;
    }

    return Math.round((summary.done / summary.total) * 100);
  }, [summary]);

  const handleFilterChange = (name, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const handleStatusChange = async (taskId, status) => {
    if (!taskId) {
      toast.error("Task ID không hợp lệ.");
      return;
    }

    try {
      setUpdatingTaskId(taskId);

      await taskApi.update(taskId, {
        status,
      });

      toast.success("Đã cập nhật trạng thái công việc.");

      await loadTasks();
    } catch (error) {
      console.error("Update task status error:", error);

      toast.error(
        error.response?.data?.message ||
          "Không thể cập nhật trạng thái công việc.",
      );
    } finally {
      setUpdatingTaskId("");
    }
  };

  const isTaskOverdue = (task) => {
    if (!task?.deadline) {
      return false;
    }

    if (["DONE", "CANCELLED"].includes(task.status)) {
      return false;
    }

    const deadline = new Date(task.deadline);

    if (Number.isNaN(deadline.getTime())) {
      return false;
    }

    return deadline < new Date();
  };

  return (
    <section className="task-dashboard-page">
      <header className="task-dashboard-header">
        <div>
          <p>QUẢN LÝ VẬN HÀNH</p>

          <h1>Task Dashboard</h1>

          <span>
            Theo dõi phân công, tiến độ và công việc quá hạn của toàn bộ sự
            kiện.
          </span>
        </div>

        <div className="task-progress-ring">
          <strong>{completionRate}%</strong>
          <span>Hoàn thành</span>
        </div>
      </header>

      <div className="task-stat-grid">
        <article>
          <ClipboardList />

          <div>
            <strong>{summary.total}</strong>
            <span>Tổng công việc</span>
          </div>
        </article>

        <article>
          <Clock3 />

          <div>
            <strong>{summary.inProgress}</strong>
            <span>Đang thực hiện</span>
          </div>
        </article>

        <article>
          <CheckCircle2 />

          <div>
            <strong>{summary.done}</strong>
            <span>Đã hoàn thành</span>
          </div>
        </article>

        <article className="danger">
          <AlertTriangle />

          <div>
            <strong>{summary.overdue}</strong>
            <span>Quá hạn</span>
          </div>
        </article>
      </div>

      <div className="task-filter-bar">
        <label className="task-search-box">
          <Search size={18} />

          <input
            type="text"
            value={filters.search}
            placeholder="Tìm theo tên công việc..."
            maxLength={100}
            onChange={(event) =>
              handleFilterChange("search", event.target.value)
            }
          />
        </label>

        <select
          value={filters.status}
          onChange={(event) => handleFilterChange("status", event.target.value)}
        >
          <option value="">Tất cả trạng thái</option>

          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(event) =>
            handleFilterChange("priority", event.target.value)
          }
        >
          <option value="">Tất cả ưu tiên</option>

          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <label className="overdue-filter">
          <input
            type="checkbox"
            checked={filters.overdue}
            onChange={(event) =>
              handleFilterChange("overdue", event.target.checked)
            }
          />

          <span>Chỉ hiện quá hạn</span>
        </label>
      </div>

      <div className="task-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Công việc</th>
              <th>Sự kiện</th>
              <th>Người phụ trách</th>
              <th>Ưu tiên</th>
              <th>Hạn chót</th>
              <th>Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="empty">
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}

            {!loading && tasks.length === 0 && (
              <tr>
                <td colSpan="6" className="empty">
                  Không có công việc phù hợp.
                </td>
              </tr>
            )}

            {!loading &&
              tasks.map((task) => {
                const overdue = isTaskOverdue(task);

                return (
                  <tr key={task._id}>
                    <td>
                      <strong>{task.title || "Chưa có tiêu đề"}</strong>

                      <small>{task.description || "Không có mô tả"}</small>
                    </td>

                    <td>
                      {task.event?.name || task.event?.title || "—"}

                      <small>{task.event?.eventCode || ""}</small>
                    </td>

                    <td>
                      {task.assignedTo?.fullName ||
                        task.assignedTo?.name ||
                        task.assignedTo?.email ||
                        "Chưa phân công"}
                    </td>

                    <td>
                      <span
                        className={`priority ${String(
                          task.priority || "MEDIUM",
                        ).toLowerCase()}`}
                      >
                        {PRIORITY_LABELS[task.priority] ||
                          task.priority ||
                          "Trung bình"}
                      </span>
                    </td>

                    <td className={overdue ? "date-overdue" : ""}>
                      {formatDate(task.deadline)}

                      {overdue && <small>Đã quá hạn</small>}
                    </td>

                    <td>
                      <select
                        value={task.status || "TODO"}
                        disabled={updatingTaskId === task._id}
                        onChange={(event) =>
                          handleStatusChange(task._id, event.target.value)
                        }
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TaskDashboard;
