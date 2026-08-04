import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import EventRequests from "./pages/EventRequests";
import EventRequestDetail from "./pages/EventRequestDetail";
import CreateEvent from "./pages/CreateEvent";
import TaskDashboard from "./pages/TaskDashboard";
import UsersPage from "./pages/UsersPage";
import EmployeesPage from "./pages/EmployeesPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import DashboardLayout from "./components/layout/DashboardLayout";

export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />

      {/* LOGIN REQUIRED */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* ADMIN ONLY */}
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/users" element={<UsersPage />} />

            <Route path="/employees" element={<EmployeesPage />} />
          </Route>

          {/* ADMIN + EVENT MANAGER */}
          <Route
            element={<RoleRoute allowedRoles={["ADMIN", "EVENT_MANAGER"]} />}
          >
            <Route path="/event-requests" element={<EventRequests />} />

            <Route
              path="/event-requests/:id"
              element={<EventRequestDetail />}
            />

            <Route
              path="/event-requests/:id/create-event"
              element={<CreateEvent />}
            />

            <Route path="/events" element={<Events />} />

            <Route path="/events/:id" element={<EventDetail />} />
          </Route>

          {/* EMPLOYEE TASKS */}
          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  "ADMIN",
                  "EVENT_MANAGER",
                  "DESIGNER",
                  "ACCOUNTANT",
                ]}
              />
            }
          >
            <Route path="/tasks" element={<TaskDashboard />} />
          </Route>
        </Route>
      </Route>

      {/* DEFAULT */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
