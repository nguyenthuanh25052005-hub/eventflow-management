const express = require("express");
const {
  getUsers,
  getUserById,
} = require("../controllers/user.controller");

const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);

module.exports = router;