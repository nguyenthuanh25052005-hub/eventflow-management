const express = require("express");

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
} = require("../controllers/user.controller");

const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", protect, getUsers);
router.post("/", protect, createUser);

router.put("/:id/status", protect, updateUserStatus);

router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);

module.exports = router;
