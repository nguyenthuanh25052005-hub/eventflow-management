const Event = require("../models/Event");
const EventRequest = require("../models/EventRequest");
const Employee = require("../models/Employee");
const {
  calculateEventProgressFromTasks,
} = require("../services/eventProgress.service");

const internalRoles = ["ADMIN", "EVENT_MANAGER"];

/** Allowed status transitions */
const STATUS_TRANSITIONS = {
  PENDING: ["PLANNING", "IN_PROGRESS", "CANCELLED"],
  PLANNING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

/** Fields that cannot be changed once event is COMPLETED */
const LOCKED_FIELDS_WHEN_COMPLETED = [
  "eventName",
  "eventDate",
  "endDate",
  "location",
  "guestCount",
  "estimatedBudget",
  "manager",
  "eventType",
  "customer",
  "description",
];

/**
 * Validate that a manager employee is active and has Event Manager role.
 */
async function validateActiveManager(managerId) {
  if (!managerId) {
    return { ok: true, employee: null };
  }

  const manager = await Employee.findById(managerId).populate(
    "user",
    "fullName email phone role status",
  );

  if (!manager) {
    return { ok: false, message: "Không tìm thấy nhân viên quản lý." };
  }

  if (!["ADMIN", "EVENT_MANAGER"].includes(manager.position)) {
    return {
      ok: false,
      message: "Người được chọn không phải Event Manager đang hoạt động.",
    };
  }

  if (!manager.user || manager.user.status !== "active") {
    return {
      ok: false,
      message: "Người quản lý phải là nhân viên đang hoạt động.",
    };
  }

  return { ok: true, employee: manager };
}

function isValidStatusTransition(from, to) {
  if (!from || from === to) return true;
  const allowed = STATUS_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

// GET /api/events
const getEvents = async (req, res) => {
  try {
    const { status, managerId, keyword, dateFrom, dateTo } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (managerId) filter.manager = managerId;

    if (keyword) {
      filter.$or = [
        { eventName: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
      ];
    }

    if (dateFrom || dateTo) {
      filter.eventDate = {};
      if (dateFrom) filter.eventDate.$gte = new Date(dateFrom);
      if (dateTo) filter.eventDate.$lte = new Date(dateTo);
    }

    if (req.user.role === "CUSTOMER") {
      filter.customer = req.user._id;
    }

    const events = await Event.find(filter)
      .populate("customer", "fullName email phone")
      .populate("eventType", "name description")
      .populate({
        path: "manager",
        populate: {
          path: "user",
          select: "fullName email phone role status",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/events/my
const getMyEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { customer: req.user._id };
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .populate("eventType", "name description")
      .populate({
        path: "manager",
        populate: {
          path: "user",
          select: "fullName email phone status",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("eventRequest")
      .populate("customer", "fullName email phone role")
      .populate("eventType", "name description")
      .populate({
        path: "manager",
        populate: {
          path: "user",
          select: "fullName email phone role status",
        },
      });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sự kiện.",
      });
    }

    const isOwner =
      event.customer &&
      event.customer._id.toString() === req.user._id.toString();

    if (!isOwner && !internalRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem sự kiện này.",
      });
    }

    const taskStats = await calculateEventProgressFromTasks(event._id);

    // Đồng bộ progress lưu trên Event với số liệu task thực tế
    if (event.progress !== taskStats.progressPercent) {
      event.progress = taskStats.progressPercent;
      await Event.findByIdAndUpdate(event._id, {
        progress: taskStats.progressPercent,
      });
    }

    res.status(200).json({
      success: true,
      data: event,
      taskStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/events/:id/progress
const getEventProgress = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select(
      "eventName status progress eventDate",
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sự kiện.",
      });
    }

    const taskStats = await calculateEventProgressFromTasks(event._id);

    if (event.progress !== taskStats.progressPercent) {
      await Event.findByIdAndUpdate(event._id, {
        progress: taskStats.progressPercent,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy tiến độ sự kiện thành công",
      data: {
        eventId: event._id,
        eventName: event.eventName,
        status: event.status,
        progress: taskStats.progressPercent,
        taskStats,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/events
const createEvent = async (req, res) => {
  try {
    if (!internalRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ Admin hoặc Event Manager mới được tạo sự kiện.",
      });
    }

    const {
      eventRequestId,
      managerId,
      eventName,
      description,
      eventDate,
      startDate,
      endDate,
      location,
      guestCount,
      estimatedBudget,
      notes,
    } = req.body;

    const resolvedName = (eventName || "").trim();
    if (!resolvedName && !eventRequestId) {
      return res.status(400).json({
        success: false,
        message: "Tên sự kiện là bắt buộc.",
      });
    }

    const resolvedStart = startDate || eventDate;
    const resolvedEnd = endDate || null;

    if (resolvedStart && resolvedEnd) {
      const start = new Date(resolvedStart);
      const end = new Date(resolvedEnd);
      if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        end < start
      ) {
        return res.status(400).json({
          success: false,
          message: "Ngày kết thúc không được trước ngày bắt đầu.",
        });
      }
    }

    if (!eventRequestId) {
      return res.status(400).json({
        success: false,
        message: "Event request ID là bắt buộc để tạo sự kiện.",
      });
    }

    const eventRequest = await EventRequest.findById(eventRequestId);

    if (!eventRequest) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu sự kiện.",
      });
    }

    if (eventRequest.status === "CONVERTED") {
      return res.status(400).json({
        success: false,
        message: "Yêu cầu này đã được chuyển thành sự kiện.",
      });
    }

    if (eventRequest.status === "REJECTED") {
      return res.status(400).json({
        success: false,
        message: "Không thể tạo sự kiện từ yêu cầu đã bị từ chối.",
      });
    }

    if (eventRequest.status !== "CONSULTING") {
      return res.status(400).json({
        success: false,
        message:
          "Chỉ được tạo sự kiện khi yêu cầu đang ở trạng thái Đang tư vấn (CONSULTING).",
      });
    }

    const existingEvent = await Event.findOne({
      eventRequest: eventRequestId,
    });

    if (existingEvent) {
      return res.status(400).json({
        success: false,
        message: "Sự kiện đã tồn tại cho yêu cầu này.",
      });
    }

    const managerCheck = await validateActiveManager(managerId);
    if (!managerCheck.ok) {
      return res.status(400).json({
        success: false,
        message: managerCheck.message,
      });
    }

    const finalEventName = resolvedName || eventRequest.title;
    if (!finalEventName || !String(finalEventName).trim()) {
      return res.status(400).json({
        success: false,
        message: "Tên sự kiện là bắt buộc.",
      });
    }

    const event = await Event.create({
      eventRequest: eventRequest._id,
      customer: eventRequest.customer,
      eventType: eventRequest.eventType,
      manager: managerId || null,
      eventName: String(finalEventName).trim(),
      description:
        description !== undefined ? description : eventRequest.description,
      eventDate: resolvedStart || eventRequest.expectedDate,
      endDate: resolvedEnd,
      location: location || eventRequest.location,
      guestCount:
        guestCount !== undefined ? guestCount : eventRequest.expectedGuests,
      estimatedBudget:
        estimatedBudget !== undefined
          ? estimatedBudget
          : eventRequest.budget,
      notes,
      status: "PENDING",
      progress: 0,
    });

    eventRequest.status = "CONVERTED";
    await eventRequest.save();

    const populatedEvent = await Event.findById(event._id)
      .populate("customer", "fullName email phone")
      .populate("eventType", "name description")
      .populate({
        path: "manager",
        populate: {
          path: "user",
          select: "fullName email phone role status",
        },
      });

    res.status(201).json({
      success: true,
      message: "Tạo sự kiện thành công.",
      data: populatedEvent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    if (!internalRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ Admin hoặc Event Manager mới được cập nhật sự kiện.",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sự kiện.",
      });
    }

    const body = req.body || {};

    if (body.progress !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Tiến độ sự kiện được tính tự động từ công việc và không thể chỉnh sửa thủ công.",
      });
    }

    if (event.status === "COMPLETED") {
      const attemptedLocked = LOCKED_FIELDS_WHEN_COMPLETED.filter(
        (field) => body[field] !== undefined,
      );

      if (attemptedLocked.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Sự kiện đã hoàn thành không được sửa các thông tin quan trọng (tên, ngày, địa điểm, ngân sách, người quản lý...).",
        });
      }

      if (body.status && body.status !== "COMPLETED") {
        return res.status(400).json({
          success: false,
          message: "Không thể chuyển trạng thái của sự kiện đã hoàn thành.",
        });
      }
    }

    if (event.status === "CANCELLED") {
      if (body.status && body.status !== "CANCELLED") {
        return res.status(400).json({
          success: false,
          message: "Không thể chuyển trạng thái của sự kiện đã hủy.",
        });
      }
    }

    if (body.status !== undefined && body.status !== event.status) {
      if (!isValidStatusTransition(event.status, body.status)) {
        return res.status(400).json({
          success: false,
          message: `Không được chuyển trạng thái từ ${event.status} sang ${body.status}. Luồng hợp lệ: PENDING → PLANNING → IN_PROGRESS → COMPLETED (hoặc CANCELLED).`,
        });
      }
    }

    if (body.eventName !== undefined) {
      const name = String(body.eventName || "").trim();
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Tên sự kiện là bắt buộc.",
        });
      }
      body.eventName = name;
    }

    const nextEventDate =
      body.eventDate !== undefined ? body.eventDate : event.eventDate;
    const nextStart = body.startDate !== undefined ? body.startDate : null;
    const nextEnd = body.endDate !== undefined ? body.endDate : event.endDate;
    const startCandidate = nextStart || nextEventDate;

    if (startCandidate && nextEnd) {
      const start = new Date(startCandidate);
      const end = new Date(nextEnd);
      if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        end < start
      ) {
        return res.status(400).json({
          success: false,
          message: "Ngày kết thúc không được trước ngày bắt đầu.",
        });
      }
    }

    if (body.manager !== undefined || body.managerId !== undefined) {
      const managerId = body.managerId || body.manager;
      const managerCheck = await validateActiveManager(managerId);
      if (!managerCheck.ok) {
        return res.status(400).json({
          success: false,
          message: managerCheck.message,
        });
      }
      body.manager = managerId || null;
      delete body.managerId;
    }

    const allowedFields = [
      "manager",
      "eventName",
      "description",
      "eventDate",
      "endDate",
      "location",
      "guestCount",
      "estimatedBudget",
      "status",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        event[field] = body[field];
      }
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate("customer", "fullName email phone")
      .populate("eventType", "name description")
      .populate({
        path: "manager",
        populate: {
          path: "user",
          select: "fullName email phone role status",
        },
      });

    res.status(200).json({
      success: true,
      message: "Cập nhật sự kiện thành công.",
      data: populatedEvent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEvents,
  getMyEvents,
  getEventById,
  getEventProgress,
  createEvent,
  updateEvent,
};
