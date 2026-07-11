const User = require("../models/User");
const Employee = require("../models/Employee");
const EventType = require("../models/EventType");
const EventRequest = require("../models/EventRequest");
const Event = require("../models/Event");

// GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Admin can access dashboard statistics",
      });
    }

    const [
      totalUsers,
      totalEmployees,
      totalEventTypes,
      totalEvents,
      pendingRequests,
      consultingRequests,
      completedEvents,
      activeEvents,
      recentRequests,
      recentEvents,
      eventStatusStats,
      requestStatusStats,
    ] = await Promise.all([
      User.countDocuments(),
      Employee.countDocuments(),
      EventType.countDocuments({ status: "active" }),
      Event.countDocuments(),

      EventRequest.countDocuments({ status: "PENDING" }),
      EventRequest.countDocuments({ status: "CONSULTING" }),

      Event.countDocuments({ status: "COMPLETED" }),

      Event.countDocuments({
        status: {
          $in: ["PENDING", "PLANNING", "IN_PROGRESS"],
        },
      }),

      EventRequest.find()
        .populate("customer", "fullName email phone")
        .populate("eventType", "name")
        .sort({ createdAt: -1 })
        .limit(5),

      Event.find()
        .populate("customer", "fullName email phone")
        .populate("eventType", "name")
        .populate({
          path: "manager",
          populate: {
            path: "user",
            select: "fullName email",
          },
        })
        .sort({ createdAt: -1 })
        .limit(5),

      Event.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            count: 1,
          },
        },
      ]),

      EventRequest.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            count: 1,
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalEmployees,
          totalEventTypes,
          totalEvents,
          pendingRequests,
          consultingRequests,
          activeEvents,
          completedEvents,
          monthlyRevenue: 0,
        },
        charts: {
          eventStatus: eventStatusStats,
          requestStatus: requestStatusStats,
        },
        recentRequests,
        recentEvents,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};