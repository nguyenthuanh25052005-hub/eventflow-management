const express = require("express");

const {
  getEventRequests,
  getMyEventRequests,
  getEventRequestById,
  createEventRequest,
  updateEventRequestStatus,
} = require("../controllers/eventRequest.controller");

const { protect } = require("../middlewares/auth.middleware");

const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

// =====================================
// TẤT CẢ API ĐỀU PHẢI ĐĂNG NHẬP
// =====================================
router.use(protect);

// =====================================
// ADMIN + EVENT MANAGER
// Xem toàn bộ yêu cầu
// =====================================
router.get("/", authorizeRoles("ADMIN", "EVENT_MANAGER"), getEventRequests);

// =====================================
// USER ĐANG ĐĂNG NHẬP
// Xem yêu cầu của chính mình
// =====================================
router.get("/my", getMyEventRequests);

// =====================================
// CUSTOMER
// Tạo yêu cầu tổ chức sự kiện
// =====================================
router.post("/", authorizeRoles("CUSTOMER"), createEventRequest);

// =====================================
// ADMIN + EVENT MANAGER
// Cập nhật trạng thái yêu cầu
// =====================================
router.put(
  "/:id/status",
  authorizeRoles("ADMIN", "EVENT_MANAGER"),
  updateEventRequestStatus,
);

// =====================================
// XEM CHI TIẾT
// Controller tự kiểm tra:
// - CUSTOMER phải là owner
// - ADMIN / EVENT_MANAGER được xem
// =====================================
router.get("/:id", getEventRequestById);

module.exports = router;
