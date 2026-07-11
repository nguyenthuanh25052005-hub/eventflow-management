import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api/axios";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "admin@example.com",
    password: "123456",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", form);
      const user = response.data.data;

      if (user.role !== "ADMIN") {
        toast.error("Tài khoản không có quyền truy cập Dashboard.");
        return;
      }

      localStorage.setItem("eventflow_token", user.token);
      localStorage.setItem("eventflow_user", JSON.stringify(user));

      toast.success("Đăng nhập thành công.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Đăng nhập không thành công."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="brand-logo">
          <span>EF</span>
          EventFlow
        </div>

        <div className="brand-content">
          <p className="brand-eyebrow">EVENT MANAGEMENT PLATFORM</p>
          <h1>Quản lý mọi sự kiện trong một hệ thống duy nhất.</h1>
          <p>
            Theo dõi yêu cầu, điều phối nhân sự, quản lý tiến độ và vận hành
            sự kiện hiệu quả.
          </p>
        </div>

        <div className="brand-footer">
          EventFlow Management System
        </div>
      </section>

      <section className="login-form-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-heading">
            <p>Chào mừng trở lại</p>
            <h2>Đăng nhập Dashboard</h2>
            <span>Nhập thông tin tài khoản quản trị của bạn.</span>
          </div>

          <label className="form-group">
            <span>Email</span>

            <div className="input-wrapper">
              <FiMail />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>
          </label>

          <label className="form-group">
            <span>Mật khẩu</span>

            <div className="input-wrapper">
              <FiLock />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label="Hiện hoặc ẩn mật khẩu"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="login-note">
            Chỉ Admin, Event Manager, Designer và Accountant được truy cập hệ
            thống nội bộ.
          </p>
        </form>
      </section>
    </main>
  );
}