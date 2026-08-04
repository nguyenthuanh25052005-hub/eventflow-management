const express = require("express");

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");

const { protect } = require("../middlewares/auth.middleware");

const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

// Tất cả Task API đều yêu cầu đăng nhập
router.use(protect);

// Các role nội bộ được xem Task
router.get(
  "/",
  authorizeRoles("ADMIN", "EVENT_MANAGER", "DESIGNER", "ACCOUNTANT"),
  getAllTasks,
);

router.get(
  "/:id",
  authorizeRoles("ADMIN", "EVENT_MANAGER", "DESIGNER", "ACCOUNTANT"),
  getTaskById,
);

// Chỉ ADMIN / EVENT_MANAGER tạo Task
router.post("/", authorizeRoles("ADMIN", "EVENT_MANAGER"), createTask);

// ADMIN / EVENT_MANAGER / người thực thi nội bộ có thể cập nhật
router.put(
  "/:id",
  authorizeRoles("ADMIN", "EVENT_MANAGER", "DESIGNER", "ACCOUNTANT"),
  updateTask,
);

// Chỉ ADMIN / EVENT_MANAGER được xóa Task
router.delete("/:id", authorizeRoles("ADMIN", "EVENT_MANAGER"), deleteTask);

module.exports = router;
