const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const employeeRoutes = require("./routes/employee.routes");
const eventTypeRoutes = require("./routes/eventType.routes");
const eventRequestRoutes = require("./routes/eventRequest.routes");
const eventRoutes = require("./routes/event.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const taskRoutes = require("./routes/task.routes");
const swaggerSpec = require("./config/swagger");

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "EventFlow API Docs",
  }),
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/event-types", eventTypeRoutes);
app.use("/api/event-requests", eventRequestRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tasks", taskRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EventFlow API is running",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EventFlow API health check OK",
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;
