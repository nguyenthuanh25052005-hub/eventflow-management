import { Navigate, Outlet } from "react-router-dom";

function RoleRoute({ allowedRoles = [] }) {
  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("eventflow_user"),
    );
  } catch {
    user = null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/events" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;