import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Unlock,
  UserRound,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import userApi from "../api/userApi";
import "./UsersPage.css";

const ROLE_LABELS = {
  ADMIN: "Quản trị viên",
  EVENT_MANAGER: "Quản lý sự kiện",
  DESIGNER: "Thiết kế",
  ACCOUNTANT: "Kế toán",
  CUSTOMER: "Khách hàng",
};

const STATUS_LABELS = {
  active: "Hoạt động",
  inactive: "Ngừng hoạt động",
  blocked: "Đã khóa",
};

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  role: "CUSTOMER",
  status: "active",
};

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await userApi.getAll();

      setUsers(response.data?.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách người dùng.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const statistics = useMemo(() => {
    return {
      total: users.length,

      active: users.filter((user) => user.status === "active").length,

      blocked: users.filter((user) => user.status === "blocked").length,

      employees: users.filter((user) =>
        ["ADMIN", "EVENT_MANAGER", "DESIGNER", "ACCOUNTANT"].includes(
          user.role,
        ),
      ).length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !keyword ||
        user.fullName?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword);

      const matchesRole = !roleFilter || user.role === roleFilter;

      const matchesStatus = !statusFilter || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      fullName: user.fullName || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      role: user.role || "CUSTOMER",
      status: user.status || "active",
    });

    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingUser(null);
    setFormErrors({});
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ tên.";
    } else if (form.fullName.trim().length < 2) {
      errors.fullName = "Họ tên phải có ít nhất 2 ký tự.";
    }

    if (!form.email.trim()) {
      errors.email = "Vui lòng nhập email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Email không đúng định dạng.";
    }

    if (!editingUser) {
      if (!form.password) {
        errors.password = "Vui lòng nhập mật khẩu.";
      } else if (form.password.length < 6) {
        errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
      }
    }

    if (form.phone && !/^[0-9+\s.-]{8,15}$/.test(form.phone)) {
      errors.phone = "Số điện thoại không đúng định dạng.";
    }

    if (!ROLE_LABELS[form.role]) {
      errors.role = "Vai trò không hợp lệ.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      if (editingUser) {
        await userApi.update(editingUser._id, {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
        });

        if (form.status !== editingUser.status) {
          await userApi.updateStatus(editingUser._id, form.status);
        }

        toast.success("Cập nhật người dùng thành công.");
      } else {
        await userApi.create({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
          role: form.role,
          status: form.status,
        });

        toast.success("Tạo người dùng thành công.");
      }

      closeModal();
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu người dùng.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "blocked" ? "active" : "blocked";

    const message =
      newStatus === "blocked"
        ? `Bạn có chắc muốn khóa tài khoản "${user.fullName}"?`
        : `Bạn có muốn mở khóa tài khoản "${user.fullName}"?`;

    if (!window.confirm(message)) {
      return;
    }

    try {
      await userApi.updateStatus(user._id, newStatus);

      toast.success(
        newStatus === "blocked"
          ? "Đã khóa tài khoản."
          : "Đã mở khóa tài khoản.",
      );

      await loadUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái.",
      );
    }
  };

  return (
    <div className="users-page">
      <div className="users-page-header">
        <div>
          <p className="users-breadcrumb">Dashboard / Người dùng</p>

          <h1>Quản lý người dùng</h1>

          <p>Quản lý tài khoản, vai trò và trạng thái truy cập hệ thống.</p>
        </div>

        <div className="users-header-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={loadUsers}
          >
            <RefreshCw size={18} />
            Làm mới
          </button>

          <button
            className="primary-button"
            type="button"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Thêm người dùng
          </button>
        </div>
      </div>

      <div className="user-stat-grid">
        <article>
          <Users />
          <div>
            <strong>{statistics.total}</strong>
            <span>Tổng tài khoản</span>
          </div>
        </article>

        <article>
          <UserRound />
          <div>
            <strong>{statistics.active}</strong>
            <span>Đang hoạt động</span>
          </div>
        </article>

        <article>
          <ShieldCheck />
          <div>
            <strong>{statistics.employees}</strong>
            <span>Tài khoản nội bộ</span>
          </div>
        </article>

        <article>
          <Lock />
          <div>
            <strong>{statistics.blocked}</strong>
            <span>Đã khóa</span>
          </div>
        </article>
      </div>

      <section className="users-card">
        <div className="users-filter-bar">
          <label className="users-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại..."
              maxLength={100}
            />
          </label>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="">Tất cả vai trò</option>

            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">Tất cả trạng thái</option>

            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="users-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty">
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-information">
                        <div className="user-avatar">
                          {user.fullName?.charAt(0).toUpperCase() || "U"}
                        </div>

                        <div>
                          <strong>{user.fullName}</strong>

                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{user.phone || "—"}</td>

                    <td>
                      <span
                        className={`role-badge ${String(
                          user.role,
                        ).toLowerCase()}`}
                      >
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge ${user.status}`}>
                        {STATUS_LABELS[user.status] || user.status}
                      </span>
                    </td>

                    <td>
                      {user.createdAt
                        ? new Intl.DateTimeFormat("vi-VN").format(
                            new Date(user.createdAt),
                          )
                        : "—"}
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          title="Chỉnh sửa"
                          onClick={() => openEditModal(user)}
                        >
                          <Edit3 size={17} />
                        </button>

                        <button
                          type="button"
                          title={
                            user.status === "blocked"
                              ? "Mở khóa"
                              : "Khóa tài khoản"
                          }
                          className={
                            user.status === "blocked" ? "unlock" : "lock"
                          }
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.status === "blocked" ? (
                            <Unlock size={17} />
                          ) : (
                            <Lock size={17} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div
          className="user-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="user-modal">
            <div className="user-modal-header">
              <div>
                <h2>
                  {editingUser ? "Cập nhật người dùng" : "Thêm người dùng"}
                </h2>

                <p>
                  {editingUser
                    ? "Cập nhật thông tin và quyền truy cập."
                    : "Tạo tài khoản mới trong hệ thống."}
                </p>
              </div>

              <button type="button" onClick={closeModal}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="user-form-grid">
                <label>
                  <span>
                    Họ và tên <b>*</b>
                  </span>

                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="Nguyễn Văn A"
                  />

                  {formErrors.fullName && <small>{formErrors.fullName}</small>}
                </label>

                <label>
                  <span>
                    Email <b>*</b>
                  </span>

                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    maxLength={150}
                    placeholder="example@email.com"
                  />

                  {formErrors.email && <small>{formErrors.email}</small>}
                </label>

                {!editingUser && (
                  <label>
                    <span>
                      Mật khẩu <b>*</b>
                    </span>

                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="Tối thiểu 6 ký tự"
                    />

                    {formErrors.password && (
                      <small>{formErrors.password}</small>
                    )}
                  </label>
                )}

                <label>
                  <span>Số điện thoại</span>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength={15}
                    placeholder="0901234567"
                  />

                  {formErrors.phone && <small>{formErrors.phone}</small>}
                </label>

                <label>
                  <span>
                    Vai trò <b>*</b>
                  </span>

                  <select name="role" value={form.role} onChange={handleChange}>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Trạng thái</span>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="user-modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editingUser
                      ? "Lưu thay đổi"
                      : "Tạo người dùng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
