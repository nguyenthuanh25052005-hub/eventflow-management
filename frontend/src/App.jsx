import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import EventRequests from "./pages/EventRequests";
import EventRequestDetail from "./pages/EventRequestDetail";
import CreateEvent from "./pages/CreateEvent";
import TaskDashboard from "./pages/TaskDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected admin routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/event-requests" element={<EventRequests />} />

          <Route path="/event-requests/:id" element={<EventRequestDetail />} />

          <Route
            path="/event-requests/:id/create-event"
            element={<CreateEvent />}
          />

          <Route path="/tasks" element={<TaskDashboard />} />

          <Route path="/events" element={<Events />} />

          <Route path="/events/:id" element={<EventDetail />} />
        </Route>
      </Route>

      {/* Redirect routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
