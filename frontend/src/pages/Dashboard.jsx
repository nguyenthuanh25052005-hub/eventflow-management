import DashboardLayout from "../components/layout/DashboardLayout";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("eventflow_user") || "{}");

  return (
    <DashboardLayout>
      <section>
        <p
          style={{
            margin: 0,
            color: "#667085",
            fontWeight: 700,
          }}
        >
          Tổng quan hệ thống
        </p>

        <h1
          style={{
            margin: "8px 0 10px",
            color: "#172033",
            fontSize: "34px",
            letterSpacing: "-0.04em",
          }}
        >
          Xin chào, {user.fullName || "Admin"} 👋
        </h1>

        <p
          style={{
            margin: 0,
            color: "#7b8496",
          }}
        >
          Theo dõi hoạt động và tiến độ vận hành EventFlow.
        </p>
      </section>
    </DashboardLayout>
  );
}
