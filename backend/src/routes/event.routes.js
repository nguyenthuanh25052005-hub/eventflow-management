const express = require("express");

const {
  getEvents,
  getMyEvents,
  getEventById,
  createEvent,
  updateEvent,
} = require("../controllers/event.controller");

const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", protect, getEvents);
router.post("/", protect, createEvent);

router.get("/my", protect, getMyEvents);

router.get("/:id", protect, getEventById);
router.put("/:id", protect, updateEvent);

module.exports = router;