const User = require("../models/User");
const Employee = require("../models/Employee");
const EventType = require("../models/EventType");
const EventRequest = require("../models/EventRequest");
const Event = require("../models/Event");
const Task = require("../models/Task");

// GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    // Chỉ ADMIN được xem dashboard quản trị
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Admin can access dashboard statistics",
      });
    }

    const now = new Date();

    const [
      totalUsers,
      totalEmployees,
      totalEventTypes,
      totalEvents,

      pendingRequests,
      consultingRequests,

      completedEvents,
      activeEvents,

      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      cancelledTasks,
      overdueTasks,

      recentRequests,
      recentEvents,

      eventStatusStats,
      requestStatusStats,
      taskStatusStats,
    ] = await Promise.all([
      // USERS
      User.countDocuments(),

      // EMPLOYEES
      Employee.countDocuments(),

      // EVENT TYPES
      EventType.countDocuments({
        status: "active",
      }),

      // EVENTS
      Event.countDocuments(),

      // EVENT REQUESTS
      EventRequest.countDocuments({
        status: "PENDING",
      }),

      EventRequest.countDocuments({
        status: "CONSULTING",
      }),

      // COMPLETED EVENTS
      Event.countDocuments({
        status: "COMPLETED",
      }),

      // ACTIVE EVENTS
      Event.countDocuments({
        status: {
          $in: ["PENDING", "PLANNING", "IN_PROGRESS"],
        },
      }),

      // TASKS
      Task.countDocuments(),

      Task.countDocuments({
        status: "TODO",
      }),

      Task.countDocuments({
        status: "IN_PROGRESS",
      }),

      Task.countDocuments({
        status: "DONE",
      }),

      Task.countDocuments({
        status: "CANCELLED",
      }),

      // TASKS QUÁ HẠN
      Task.countDocuments({
        deadline: {
          $lt: now,
        },

        status: {
          $nin: ["DONE", "CANCELLED"],
        },
      }),

      // 5 EVENT REQUEST GẦN NHẤT
      EventRequest.find()
        .populate("customer", "fullName email phone")
        .populate("eventType", "name")
        .sort({
          createdAt: -1,
        })
        .limit(5),

      // 5 EVENT GẦN NHẤT
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
        .sort({
          createdAt: -1,
        })
        .limit(5),

      // THỐNG KÊ EVENT THEO STATUS
      Event.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },

        {
          $project: {
            _id: 0,
            status: "$_id",
            count: 1,
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]),

      // THỐNG KÊ REQUEST THEO STATUS
      EventRequest.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },

        {
          $project: {
            _id: 0,
            status: "$_id",
            count: 1,
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]),

      // THỐNG KÊ TASK THEO STATUS
      Task.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },

        {
          $project: {
            _id: 0,
            status: "$_id",
            count: 1,
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]),
    ]);

    const taskCompletionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const eventCompletionRate =
      totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

    return res.status(200).json({
      success: true,

      data: {
        overview: {
          // USER / EMPLOYEE
          totalUsers,
          totalEmployees,

          // EVENT TYPE
          totalEventTypes,

          // EVENT
          totalEvents,
          activeEvents,
          completedEvents,
          eventCompletionRate,

          // REQUEST
          pendingRequests,
          consultingRequests,

          // TASK
          totalTasks,
          todoTasks,
          inProgressTasks,
          completedTasks,
          cancelledTasks,
          overdueTasks,
          taskCompletionRate,
        },

        charts: {
          eventStatus: eventStatusStats,
          requestStatus: requestStatusStats,
          taskStatus: taskStatusStats,
        },

        recentRequests,
        recentEvents,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
