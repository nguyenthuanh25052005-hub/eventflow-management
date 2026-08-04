const express = require("express");

const {
  getEvents,
  getMyEvents,
  getEventById,
  getEventProgress,
  createEvent,
  updateEvent,
} = require("../controllers/event.controller");
const { getTasksByEvent } = require("../controllers/task.controller");

const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", protect, getEvents);
router.post("/", protect, createEvent);

router.get("/my", protect, getMyEvents);

router.get("/:id/progress", protect, getEventProgress);
router.get("/:eventId/tasks", protect, getTasksByEvent);
router.get("/:id", protect, getEventById);
router.put("/:id", protect, updateEvent);

module.exports = router;
