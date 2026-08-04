const express = require("express");

const {
  getEvents,
  getMyEvents,
  getEventById,
  createEvent,
  updateEvent,
} = require("../controllers/event.controller");

const { protect } = require("../middlewares/auth.middleware");

const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

// Tất cả Event API đều yêu cầu đăng nhập
router.use(protect);

// ADMIN + EVENT_MANAGER xem toàn bộ event
router.get("/", authorizeRoles("ADMIN", "EVENT_MANAGER"), getEvents);

// ADMIN + EVENT_MANAGER tạo event
router.post("/", authorizeRoles("ADMIN", "EVENT_MANAGER"), createEvent);

// Người đang đăng nhập xem event liên quan tới mình
router.get("/my", getMyEvents);

// Xem chi tiết event
router.get("/:id", getEventById);

// ADMIN + EVENT_MANAGER cập nhật event
router.put("/:id", authorizeRoles("ADMIN", "EVENT_MANAGER"), updateEvent);

module.exports = router;
