const express = require("express");

const {
  getEventRequests,
  getMyEventRequests,
  getEventRequestById,
  createEventRequest,
  updateEventRequestStatus,
} = require("../controllers/eventRequest.controller");

const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", protect, getEventRequests);
router.post("/", protect, createEventRequest);
router.get("/my", protect, getMyEventRequests);
router.put("/:id/status", protect, updateEventRequestStatus);
router.get("/:id", protect, getEventRequestById);

module.exports = router;