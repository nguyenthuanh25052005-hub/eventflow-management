const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EventFlow API is running",
  });
});

app.use("/api/auth", authRoutes);

module.exports = app;