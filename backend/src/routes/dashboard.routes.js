const express = require("express");

const {
  getDashboardStats,
} = require("../controllers/dashboard.controller");

const {
  protect,
} = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.get("/stats", protect, getDashboardStats);

module.exports = router;