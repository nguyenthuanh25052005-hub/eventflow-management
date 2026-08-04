import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  UserRoundCog,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import employeeApi from "../api/employeeApi";
import userApi from "../api/userApi";
import "./EmployeesPage.css";

const POSITION_LABELS = {
  EVENT_MANAGER: "Quản lý sự kiện",
  DESIGNER: "Thiết kế",
  ACCOUNTANT: "Kế toán",
};

const EMPTY_FORM = {
  userId: "",
  employeeCode: "",
  position: "EVENT_MANAGER",
  department: "",
  hireDate: "",
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);

      const [employeeResponse, userResponse] = await Promise.all([
        employeeApi.getAll(),
        userApi.getAll(),
      ]);

      setEmployees(employeeResponse.data?.data || []);
      setUsers(userResponse.data?.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể tải dữ liệu nhân viên.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const employeeUserIds = useMemo(() => {
    return new Set(
      employees.map((employee) => employee.user?._id).filter(Boolean),
    );
  }, [employees]);

  const availableUsers = useMemo(() => {
    return users.filter((user) => {
      return (
        user.role !== "ADMIN" &&
        user.status === "active" &&
        !employeeUserIds.has(user._id)
      );
    });
  }, [users, employeeUserIds]);

  const departments = useMemo(() => {
    return [
      ...new Set(
        employees.map((employee) => employee.department).filter(Boolean),
      ),
    ].sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const user = employee.user || {};

      const matchesSearch =
        !keyword ||
        employee.employeeCode?.toLowerCase().includes(keyword) ||
        employee.department?.toLowerCase().includes(keyword) ||
        user.fullName?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword);

      const matchesPosition =
        !positionFilter || employee.position === positionFilter;

      const matchesDepartment =
        !departmentFilter || employee.department === departmentFilter;

      return matchesSearch && matchesPosition && matchesDepartment;
    });
  }, [employees, search, positionFilter, departmentFilter]);

  const statistics = useMemo(() => {
    return {
      total: employees.length,

      managers: employees.filter(
        (employee) => employee.position === "EVENT_MANAGER",
      ).length,

      designers: employees.filter(
        (employee) => employee.position === "DESIGNER",
      ).length,

      accountants: employees.filter(
        (employee) => employee.position === "ACCOUNTANT",
      ).length,
    };
  }, [employees]);

  const openCreateModal = () => {
    setEditingEmployee(null);

    setForm({
      ...EMPTY_FORM,
      hireDate: new Date().toISOString().slice(0, 10),
    });

    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);

    setForm({
      userId: employee.user?._id || "",
      employeeCode: employee.employeeCode || "",
      position: employee.position || "EVENT_MANAGER",
      department: employee.department || "",
      hireDate: employee.hireDate
        ? new Date(employee.hireDate).toISOString().slice(0, 10)
        : "",
    });

    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingEmployee(null);
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

    if (!editingEmployee && !form.userId) {
      errors.userId = "Vui lòng chọn người dùng.";
    }

    if (!form.employeeCode.trim()) {
      errors.employeeCode = "Vui lòng nhập mã nhân viên.";
    }

    if (!POSITION_LABELS[form.position]) {
      errors.position = "Vị trí nhân viên không hợp lệ.";
    }

    if (form.department && form.department.trim().length > 100) {
      errors.department = "Phòng ban không được vượt quá 100 ký tự.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      if (editingEmployee) {
        await employeeApi.update(editingEmployee._id, {
          employeeCode: form.employeeCode.trim(),

          position: form.position,

          department: form.department.trim(),

          hireDate: form.hireDate || undefined,
        });

        toast.success("Cập nhật nhân viên thành công.");
      } else {
        await employeeApi.create({
          userId: form.userId,

          employeeCode: form.employeeCode.trim(),

          position: form.position,

          department: form.department.trim(),

          hireDate: form.hireDate || undefined,
        });

        toast.success("Tạo nhân viên thành công.");
      }

      closeModal();
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu nhân viên.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="employees-page">
      <div className="employees-page-header">
        <div>
          <p className="employees-breadcrumb">Dashboard / Nhân viên</p>

          <h1>Quản lý nhân viên</h1>

          <p>
            Quản lý hồ sơ nhân sự, vị trí và phòng ban trong hệ thống EventFlow.
          </p>
        </div>

        <div className="employees-header-actions">
          <button type="button" className="secondary-button" onClick={loadData}>
            <RefreshCw size={18} />
            Làm mới
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Thêm nhân viên
          </button>
        </div>
      </div>

      <section className="employee-stat-grid">
        <article>
          <Users />
          <div>
            <strong>{statistics.total}</strong>
            <span>Tổng nhân viên</span>
          </div>
        </article>

        <article>
          <UserRoundCog />
          <div>
            <strong>{statistics.managers}</strong>
            <span>Quản lý sự kiện</span>
          </div>
        </article>

        <article>
          <BriefcaseBusiness />
          <div>
            <strong>{statistics.designers}</strong>
            <span>Thiết kế</span>
          </div>
        </article>

        <article>
          <CalendarDays />
          <div>
            <strong>{statistics.accountants}</strong>
            <span>Kế toán</span>
          </div>
        </article>
      </section>

      <section className="employees-card">
        <div className="employees-filter-bar">
          <label className="employees-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên, email, mã nhân viên..."
            />
          </label>

          <select
            value={positionFilter}
            onChange={(event) => setPositionFilter(event.target.value)}
          >
            <option value="">Tất cả vị trí</option>

            {Object.entries(POSITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
          >
            <option value="">Tất cả phòng ban</option>

            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>

        <div className="employees-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Mã NV</th>
                <th>Vị trí</th>
                <th>Phòng ban</th>
                <th>Ngày vào làm</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty">
                    Không tìm thấy nhân viên phù hợp.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => {
                  const user = employee.user || {};

                  return (
                    <tr key={employee._id}>
                      <td>
                        <div className="employee-user-info">
                          <div className="employee-avatar">
                            {user.fullName?.charAt(0).toUpperCase() || "E"}
                          </div>

                          <div>
                            <strong>{user.fullName || "Không có tên"}</strong>

                            <span>{user.email || "—"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong>{employee.employeeCode}</strong>
                      </td>

                      <td>
                        <span
                          className={`employee-position ${String(
                            employee.position,
                          ).toLowerCase()}`}
                        >
                          {POSITION_LABELS[employee.position] ||
                            employee.position}
                        </span>
                      </td>

                      <td>{employee.department || "—"}</td>

                      <td>{formatDate(employee.hireDate)}</td>

                      <td>
                        <span
                          className={`employee-status ${
                            user.status || "inactive"
                          }`}
                        >
                          {user.status === "active"
                            ? "Hoạt động"
                            : user.status === "blocked"
                              ? "Đã khóa"
                              : "Ngừng hoạt động"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="employee-edit-button"
                          onClick={() => openEditModal(employee)}
                        >
                          <Edit3 size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div
          className="employee-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="employee-modal">
            <div className="employee-modal-header">
              <div>
                <h2>
                  {editingEmployee ? "Cập nhật nhân viên" : "Thêm nhân viên"}
                </h2>

                <p>
                  {editingEmployee
                    ? "Cập nhật thông tin nhân sự."
                    : "Liên kết tài khoản người dùng với hồ sơ nhân viên."}
                </p>
              </div>

              <button type="button" onClick={closeModal}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="employee-form-grid">
                {!editingEmployee && (
                  <label>
                    <span>
                      Người dùng <b>*</b>
                    </span>

                    <select
                      name="userId"
                      value={form.userId}
                      onChange={handleChange}
                    >
                      <option value="">Chọn tài khoản</option>

                      {availableUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.fullName} - {user.email}
                        </option>
                      ))}
                    </select>

                    {formErrors.userId && <small>{formErrors.userId}</small>}

                    {availableUsers.length === 0 && (
                      <small>
                        Không còn tài khoản phù hợp để tạo nhân viên.
                      </small>
                    )}
                  </label>
                )}

                {editingEmployee && (
                  <label>
                    <span>Tài khoản</span>

                    <input
                      value={`${editingEmployee.user?.fullName || ""} - ${
                        editingEmployee.user?.email || ""
                      }`}
                      disabled
                    />
                  </label>
                )}

                <label>
                  <span>
                    Mã nhân viên <b>*</b>
                  </span>

                  <input
                    name="employeeCode"
                    value={form.employeeCode}
                    onChange={handleChange}
                    maxLength={50}
                    placeholder="EMP001"
                  />

                  {formErrors.employeeCode && (
                    <small>{formErrors.employeeCode}</small>
                  )}
                </label>

                <label>
                  <span>
                    Vị trí <b>*</b>
                  </span>

                  <select
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                  >
                    {Object.entries(POSITION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  {formErrors.position && <small>{formErrors.position}</small>}
                </label>

                <label>
                  <span>Phòng ban</span>

                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="Vận hành sự kiện"
                  />

                  {formErrors.department && (
                    <small>{formErrors.department}</small>
                  )}
                </label>

                <label>
                  <span>Ngày vào làm</span>

                  <input
                    name="hireDate"
                    type="date"
                    value={form.hireDate}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="employee-modal-actions">
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
                    : editingEmployee
                      ? "Lưu thay đổi"
                      : "Tạo nhân viên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeesPage;
