import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../api/axios";
import eventApi from "../api/eventApi";
import taskApi from "../api/taskApi";
import "./TaskDashboard.css";

const EMPTY_SUMMARY = { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };
const STATUS_LABELS = { TODO: "Cần làm", IN_PROGRESS: "Đang thực hiện", DONE: "Hoàn thành", CANCELLED: "Đã hủy" };
const PRIORITY_LABELS = { LOW: "Thấp", MEDIUM: "Trung bình", HIGH: "Cao", URGENT: "Khẩn cấp" };
const EMPTY_FORM = { title: "", description: "", event: "", assignedTo: "", priority: "MEDIUM", status: "TODO", deadline: "" };

const formatDate = (value) => {
  if (!value) return "Chưa đặt hạn";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Ngày không hợp lệ" : new Intl.DateTimeFormat("vi-VN").format(date);
};

function TaskDashboard({ mode = "all" }) {
  const { eventId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", overdue: false });
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [saving, setSaving] = useState(false);

  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("eventflow_user") || "{}"); } catch { return {}; }
  }, []);
  const canManage = ["ADMIN", "EVENT_MANAGER"].includes(currentUser.role);
  const pageTitle = eventId ? "Công việc theo sự kiện" : mode === "my" ? "Công việc của tôi" : "Task Dashboard";

  const calculateSummary = (items) => {
    const now = new Date();
    return {
      total: items.length,
      todo: items.filter((item) => item.status === "TODO").length,
      inProgress: items.filter((item) => item.status === "IN_PROGRESS").length,
      done: items.filter((item) => item.status === "DONE").length,
      overdue: items.filter((item) => item.deadline && new Date(item.deadline) < now && !["DONE", "CANCELLED"].includes(item.status)).length,
    };
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = { search: filters.search.trim() || undefined, status: filters.status || undefined, priority: filters.priority || undefined, overdue: filters.overdue ? "true" : undefined };
      const response = eventId
        ? await taskApi.getByEvent(eventId, params)
        : mode === "my" ? await taskApi.getMy(params) : await taskApi.getAll(params);
      const data = response.data?.data || {};
      const receivedTasks = data.tasks || [];
      setTasks(receivedTasks);
      setSummary(data.summary || calculateSummary(receivedTasks));
    } catch (error) {
      setTasks([]);
      setSummary(EMPTY_SUMMARY);
      toast.error(error.response?.data?.message || "Không thể tải danh sách công việc.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { const timer = setTimeout(loadTasks, 250); return () => clearTimeout(timer); }, [filters, mode, eventId]);

  const loadFormOptions = async () => {
    try {
      const [eventResponse, employeeResponse] = await Promise.all([eventApi.getAll(), api.get("/employees")]);
      setEvents((eventResponse.data?.data || []).filter((event) => !["COMPLETED", "CANCELLED"].includes(event.status)));
      setEmployees((employeeResponse.data?.data || []).filter((employee) => employee.user?.status === "active"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải dữ liệu phân công.");
    }
  };

  const openCreate = async () => {
    await loadFormOptions();
    setForm({ ...EMPTY_FORM, event: eventId || "" });
    setModal("create");
  };

  const openEdit = async (task) => {
    await loadFormOptions();
    setForm({
      _id: task._id,
      title: task.title || "",
      description: task.description || "",
      event: task.event?._id || task.event || "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
      priority: task.priority || "MEDIUM",
      status: task.status || "TODO",
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : "",
    });
    setModal("edit");
  };

  const saveTask = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!form.title.trim() || !form.event || !form.deadline) {
      toast.error("Tiêu đề, sự kiện và deadline là bắt buộc.");
      return;
    }
    try {
      setSaving(true);
      const payload = { ...form, title: form.title.trim(), description: form.description.trim(), assignedTo: form.assignedTo || null };
      delete payload._id;
      if (modal === "create") await taskApi.create(payload);
      else await taskApi.update(form._id, payload);
      toast.success(modal === "create" ? "Đã tạo công việc." : "Đã cập nhật công việc.");
      setModal(null);
      await loadTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu công việc.");
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      setUpdatingTaskId(taskId);
      await taskApi.update(taskId, { status });
      toast.success("Đã cập nhật trạng thái công việc.");
      await loadTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái công việc.");
    } finally { setUpdatingTaskId(""); }
  };

  const removeTask = async (task) => {
    if (!window.confirm(`Xóa công việc “${task.title}”?`)) return;
    try {
      await taskApi.remove(task._id);
      toast.success("Đã xóa công việc.");
      await loadTasks();
    } catch (error) { toast.error(error.response?.data?.message || "Không thể xóa công việc."); }
  };

  const completionRate = summary.total ? Math.round((summary.done / summary.total) * 100) : 0;
  const isTaskOverdue = (task) => task.deadline && new Date(task.deadline) < new Date() && !["DONE", "CANCELLED"].includes(task.status);

  return (
    <section className="task-dashboard-page">
      <header className="task-dashboard-header">
        <div><p>QUẢN LÝ VẬN HÀNH</p><h1>{pageTitle}</h1><span>Theo dõi phân công, tiến độ và công việc quá hạn.</span></div>
        <div className="task-header-actions">
          {canManage && <button type="button" className="task-create-button" onClick={openCreate}><Plus size={18} />Tạo công việc</button>}
          <div className="task-progress-ring"><strong>{completionRate}%</strong><span>Hoàn thành</span></div>
        </div>
      </header>

      <div className="task-stat-grid">
        <article><ClipboardList /><div><strong>{summary.total}</strong><span>Tổng công việc</span></div></article>
        <article><Clock3 /><div><strong>{summary.inProgress}</strong><span>Đang thực hiện</span></div></article>
        <article><CheckCircle2 /><div><strong>{summary.done}</strong><span>Đã hoàn thành</span></div></article>
        <article className="danger"><AlertTriangle /><div><strong>{summary.overdue}</strong><span>Quá hạn</span></div></article>
      </div>

      <div className="task-filter-bar">
        <label className="task-search-box"><Search size={18} /><input value={filters.search} placeholder="Tìm theo tên công việc..." onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} /></label>
        <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">Tất cả trạng thái</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}><option value="">Tất cả ưu tiên</option>{Object.entries(PRIORITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <label className="overdue-filter"><input type="checkbox" checked={filters.overdue} onChange={(event) => setFilters((current) => ({ ...current, overdue: event.target.checked }))} /><span>Chỉ hiện quá hạn</span></label>
      </div>

      <div className="task-table-wrap"><table><thead><tr><th>Công việc</th><th>Sự kiện</th><th>Người phụ trách</th><th>Ưu tiên</th><th>Hạn chót</th><th>Trạng thái</th>{canManage && <th>Thao tác</th>}</tr></thead><tbody>
        {loading && <tr><td colSpan={canManage ? 7 : 6} className="empty">Đang tải dữ liệu...</td></tr>}
        {!loading && tasks.length === 0 && <tr><td colSpan={canManage ? 7 : 6} className="empty">Không có công việc phù hợp.</td></tr>}
        {!loading && tasks.map((task) => <tr key={task._id}><td><strong>{task.title}</strong><small>{task.description || "Không có mô tả"}</small></td><td>{eventId ? <Link to={`/events/${task.event?._id || task.event}`}>{task.event?.eventName || "Sự kiện hiện tại"}</Link> : task.event?.eventName || "—"}</td><td>{task.assignedTo?.user?.fullName || "Chưa phân công"}</td><td><span className={`priority ${String(task.priority || "MEDIUM").toLowerCase()}`}>{PRIORITY_LABELS[task.priority] || task.priority}</span></td><td className={isTaskOverdue(task) ? "date-overdue" : ""}>{formatDate(task.deadline)}{isTaskOverdue(task) && <small>Đã quá hạn</small>}</td><td><select value={task.status || "TODO"} disabled={updatingTaskId === task._id} onChange={(event) => handleStatusChange(task._id, event.target.value)}>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>{canManage && <td><div className="task-actions"><button type="button" title="Sửa" onClick={() => openEdit(task)}><Pencil size={16} /></button><button type="button" title="Xóa" onClick={() => removeTask(task)} disabled={task.status === "DONE"}><Trash2 size={16} /></button></div></td>}</tr>)}
      </tbody></table></div>

      {modal && <div className="task-modal-backdrop"><form className="task-modal" onSubmit={saveTask}><div className="task-modal-header"><h2>{modal === "create" ? "Tạo công việc" : "Chỉnh sửa công việc"}</h2><button type="button" onClick={() => setModal(null)}><X size={20} /></button></div><div className="task-modal-grid">
        <label><span>Tiêu đề *</span><input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required /></label>
        <label><span>Sự kiện *</span><select value={form.event} onChange={(event) => setForm((current) => ({ ...current, event: event.target.value }))} disabled={Boolean(eventId)} required><option value="">Chọn sự kiện</option>{events.map((event) => <option key={event._id} value={event._id}>{event.eventName}</option>)}</select></label>
        <label><span>Người được giao</span><select value={form.assignedTo} onChange={(event) => setForm((current) => ({ ...current, assignedTo: event.target.value }))}><option value="">Chưa phân công</option>{employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.user?.fullName || employee.employeeCode}</option>)}</select></label>
        <label><span>Deadline *</span><input type="date" value={form.deadline} onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))} required /></label>
        <label><span>Ưu tiên</span><select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}>{Object.entries(PRIORITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Trạng thái</span><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="full"><span>Mô tả</span><textarea rows="4" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>
      </div><div className="task-modal-footer"><button type="button" onClick={() => setModal(null)}>Hủy</button><button type="submit" disabled={saving}>{saving ? "Đang lưu..." : "Lưu công việc"}</button></div></form></div>}
    </section>
  );
}

export default TaskDashboard;
