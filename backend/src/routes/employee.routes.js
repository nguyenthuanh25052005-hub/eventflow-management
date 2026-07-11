const express = require("express");

const {
  getEmployees,
  createEmployee,
  updateEmployee,
} = require("../controllers/employee.controller");

const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", protect, getEmployees);
router.post("/", protect, createEmployee);
router.put("/:id", protect, updateEmployee);

module.exports = router;