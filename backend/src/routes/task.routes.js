const express = require("express");

const {
  getAllTasks,
  getMyTasks,
  getTasksByEvent,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");

const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// Tất cả route task đều cần đăng nhập
router.use(protect);

// Static paths trước :id
router.get("/", getAllTasks);
router.get("/my", getMyTasks);
router.get("/event/:eventId", getTasksByEvent);

router.post("/", createTask);

router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;