const express = require("express");

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
} = require("../controllers/user.controller");

const { protect } = require("../middlewares/auth.middleware");

const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

// Tất cả API User Management phải đăng nhập
router.use(protect);

// Và phải là ADMIN
router.use(authorizeRoles("ADMIN"));

router.get("/", getUsers);
router.post("/", createUser);

router.put("/:id/status", updateUserStatus);

router.get("/:id", getUserById);
router.put("/:id", updateUser);

module.exports = router;
