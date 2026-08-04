const express = require("express");

const {
  getEmployees,
  createEmployee,
  updateEmployee,
} = require("../controllers/employee.controller");

const { protect } = require("../middlewares/auth.middleware");

const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("ADMIN"));

router.get("/", getEmployees);
router.post("/", createEmployee);
router.put("/:id", updateEmployee);

module.exports = router;
