const express = require("express");

const {
  getEventTypes,
  getEventTypeById,
  createEventType,
  updateEventType,
} = require("../controllers/eventType.controller");

const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getEventTypes);
router.get("/:id", getEventTypeById);

router.post("/", protect, createEventType);
router.put("/:id", protect, updateEventType);

module.exports = router;