const mongoose = require("mongoose");

const Task = require("../models/Task");
const Event = require("../models/Event");
const Employee = require("../models/Employee");
const { syncEventProgress } = require("../services/eventProgress.service");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const MANAGER_ROLES = ["ADMIN", "EVENT_MANAGER"];

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (value) => {
  const d = new Date(value);
  d.setHours(23, 59, 59, 999);
  return d;
};

async function findEmployeeByUserId(userId) {
  return Employee.findOne({ user: userId }).populate(
    "user",
    "fullName email phone role status",
  );
}

async function validateActiveAssignee(assignedTo) {
  if (!assignedTo) {
    return { ok: true, employee: null };
  }

  if (!isValidObjectId(assignedTo)) {
    return { ok: false, message: "Employee ID không hợp lệ." };
  }

  const employee = await Employee.findById(assignedTo).populate(
    "user",
    "fullName email phone role status",
  );

  if (!employee) {
    return {
      ok: false,
      message: "Không tìm thấy nhân viên được phân công.",
    };
  }

  if (!employee.user || employee.user.status !== "active") {
    return {
      ok: false,
      message: "Người được giao phải tồn tại và đang hoạt động.",
    };
  }

  return { ok: true, employee };
}

function validateDeadlineAgainstEvent(deadline, event, { isCreate }) {
  if (!deadline) return { ok: true };

  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, message: "Deadline không hợp lệ." };
  }

  if (isCreate && parsed < startOfToday()) {
    return {
      ok: false,
      message: "Deadline không được trước ngày hiện tại khi tạo mới.",
    };
  }

  const eventDate = event.eventDate || event.endDate || event.startDate;
  if (eventDate) {
    const eventEnd = endOfDay(eventDate);
    if (parsed > eventEnd) {
      return {
        ok: false,
        message: "Deadline không nên sau ngày diễn ra sự kiện.",
      };
    }
  }

  return { ok: true, parsed };
}

const populateTaskQuery = (query) =>
  query
    .populate("event", "eventName status eventDate location progress")
    .populate({
      path: "assignedTo",
      populate: {
        path: "user",
        select: "fullName email phone role status",
      },
    });

// GET /api/tasks
const getAllTasks = async (req, res) => {
  try {
    const { status, priority, event, assignedTo, search, overdue } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (event) {
      if (!isValidObjectId(event)) {
        return res.status(400).json({
          success: false,
          message: "Event ID không hợp lệ.",
        });
      }
      filter.event = event;
    }

    if (assignedTo) {
      if (!isValidObjectId(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: "Employee ID không hợp lệ.",
        });
      }
      filter.assignedTo = assignedTo;
    }

    // Nhân viên thường chỉ xem task được giao
    if (req.user && !MANAGER_ROLES.includes(req.user.role)) {
      const me = await findEmployeeByUserId(req.user._id);
      if (!me) {
        return res.status(200).json({
          success: true,
          message: "Lấy danh sách công việc thành công",
          data: {
            tasks: [],
            summary: {
              total: 0,
              todo: 0,
              inProgress: 0,
              done: 0,
              overdue: 0,
            },
          },
        });
      }
      filter.assignedTo = me._id;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (overdue === "true") {
      filter.deadline = { $lt: new Date() };
      filter.status = { $nin: ["DONE", "CANCELLED"] };
    }

    const tasks = await populateTaskQuery(
      Task.find(filter).sort({ createdAt: -1 }),
    );

    const now = new Date();
    const summary = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "TODO").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      done: tasks.filter((t) => t.status === "DONE").length,
      overdue: tasks.filter(
        (t) =>
          t.deadline &&
          t.deadline < now &&
          !["DONE", "CANCELLED"].includes(t.status),
      ).length,
    };

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách công việc thành công",
      data: { tasks, summary },
    });
  } catch (error) {
    console.error("getAllTasks error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách công việc",
      error: error.message,
    });
  }
};

// GET /api/tasks/my
const getMyTasks = async (req, res) => {
  try {
    const me = await findEmployeeByUserId(req.user._id);

    if (!me) {
      return res.status(200).json({
        success: true,
        message: "Bạn chưa được gắn hồ sơ nhân viên.",
        data: {
          tasks: [],
          summary: {
            total: 0,
            todo: 0,
            inProgress: 0,
            done: 0,
            overdue: 0,
          },
        },
      });
    }

    const { status, priority, search, overdue } = req.query;
    const filter = { assignedTo: me._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (overdue === "true") {
      filter.deadline = { $lt: new Date() };
      filter.status = { $nin: ["DONE", "CANCELLED"] };
    }

    const tasks = await populateTaskQuery(
      Task.find(filter).sort({ deadline: 1, createdAt: -1 }),
    );

    const now = new Date();
    const summary = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "TODO").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      done: tasks.filter((t) => t.status === "DONE").length,
      overdue: tasks.filter(
        (t) =>
          t.deadline &&
          t.deadline < now &&
          !["DONE", "CANCELLED"].includes(t.status),
      ).length,
    };

    return res.status(200).json({
      success: true,
      message: "Lấy công việc của tôi thành công",
      data: { tasks, summary },
    });
  } catch (error) {
    console.error("getMyTasks error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy công việc của tôi",
      error: error.message,
    });
  }
};

// GET /api/tasks/event/:eventId
const getTasksByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Event ID không hợp lệ.",
      });
    }

    const existingEvent = await Event.findById(eventId);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sự kiện.",
      });
    }

    const filter = { event: eventId };
    const { status, priority } = req.query;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (req.user && !MANAGER_ROLES.includes(req.user.role)) {
      const me = await findEmployeeByUserId(req.user._id);
      if (!me) {
        return res.status(200).json({
          success: true,
          data: { event: existingEvent, tasks: [] },
        });
      }
      filter.assignedTo = me._id;
    }

    const tasks = await populateTaskQuery(
      Task.find(filter).sort({ deadline: 1, createdAt: -1 }),
    );

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách công việc theo sự kiện thành công",
      data: {
        event: {
          _id: existingEvent._id,
          eventName: existingEvent.eventName,
          status: existingEvent.status,
          eventDate: existingEvent.eventDate,
        },
        tasks,
      },
    });
  } catch (error) {
    console.error("getTasksByEvent error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy công việc theo sự kiện",
      error: error.message,
    });
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Task ID không hợp lệ.",
      });
    }

    const task = await populateTaskQuery(Task.findById(id));

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công việc.",
      });
    }

    if (req.user && !MANAGER_ROLES.includes(req.user.role)) {
      const me = await findEmployeeByUserId(req.user._id);
      const assigneeId =
        task.assignedTo?._id?.toString() || task.assignedTo?.toString();
      if (!me || assigneeId !== me._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Bạn chỉ có thể xem công việc được giao cho mình.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("getTaskById error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy chi tiết công việc",
      error: error.message,
    });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    if (!MANAGER_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ Admin hoặc Event Manager mới được tạo công việc.",
      });
    }

    const {
      title,
      description,
      event,
      assignedTo,
      status,
      priority,
      deadline,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề task bắt buộc.",
      });
    }

    if (!event || !isValidObjectId(event)) {
      return res.status(400).json({
        success: false,
        message: "Task phải thuộc một sự kiện hợp lệ.",
      });
    }

    const existingEvent = await Event.findById(event);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sự kiện.",
      });
    }

    if (["COMPLETED", "CANCELLED"].includes(existingEvent.status)) {
      return res.status(400).json({
        success: false,
        message: "Không tạo task cho sự kiện đã hủy hoặc hoàn thành.",
      });
    }

    const assigneeCheck = await validateActiveAssignee(assignedTo);
    if (!assigneeCheck.ok) {
      return res.status(400).json({
        success: false,
        message: assigneeCheck.message,
      });
    }

    const deadlineCheck = validateDeadlineAgainstEvent(
      deadline,
      existingEvent,
      { isCreate: true },
    );
    if (!deadlineCheck.ok) {
      return res.status(400).json({
        success: false,
        message: deadlineCheck.message,
      });
    }

    const task = await Task.create({
      title: String(title).trim(),
      description: description?.trim() || "",
      event,
      assignedTo: assignedTo || null,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      deadline: deadlineCheck.parsed || null,
    });

    const populatedTask = await populateTaskQuery(Task.findById(task._id));

    // Đồng bộ tiến độ sự kiện theo task
    try {
      await syncEventProgress(event);
    } catch (syncErr) {
      console.error("syncEventProgress after create:", syncErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Tạo công việc thành công",
      data: populatedTask,
    });
  } catch (error) {
    console.error("createTask error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tạo công việc",
      error: error.message,
    });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Task ID không hợp lệ.",
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công việc.",
      });
    }

    const isManager = MANAGER_ROLES.includes(req.user.role);

    if (!isManager) {
      const me = await findEmployeeByUserId(req.user._id);
      const assigneeId = task.assignedTo?.toString();
      if (!me || !assigneeId || assigneeId !== me._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Nhân viên chỉ được cập nhật task được giao cho mình.",
        });
      }

      const staffAllowed = ["status"];
      const keys = Object.keys(req.body || {});
      const forbidden = keys.filter((k) => !staffAllowed.includes(k));
      if (forbidden.length > 0) {
        return res.status(403).json({
          success: false,
          message:
            "Bạn chỉ được cập nhật trạng thái của task được giao cho mình.",
        });
      }
    }

    if (req.body.title !== undefined) {
      const nextTitle = String(req.body.title || "").trim();
      if (!nextTitle) {
        return res.status(400).json({
          success: false,
          message: "Tiêu đề task bắt buộc.",
        });
      }
      task.title = nextTitle;
    }

    if (req.body.description !== undefined) {
      task.description = String(req.body.description || "").trim();
    }

    if (req.body.status !== undefined) {
      task.status = req.body.status;
    }

    if (req.body.priority !== undefined) {
      task.priority = req.body.priority;
    }

    if (req.body.assignedTo !== undefined) {
      const assigneeCheck = await validateActiveAssignee(req.body.assignedTo);
      if (!assigneeCheck.ok) {
        return res.status(400).json({
          success: false,
          message: assigneeCheck.message,
        });
      }
      task.assignedTo = req.body.assignedTo || null;
    }

    if (req.body.deadline !== undefined) {
      const eventDoc = await Event.findById(task.event);
      const deadlineCheck = validateDeadlineAgainstEvent(
        req.body.deadline,
        eventDoc || {},
        { isCreate: false },
      );
      if (!deadlineCheck.ok) {
        return res.status(400).json({
          success: false,
          message: deadlineCheck.message,
        });
      }
      task.deadline = req.body.deadline ? deadlineCheck.parsed : null;
    }

    await task.save();

    const populatedTask = await populateTaskQuery(Task.findById(task._id));

    // Đồng bộ tiến độ sự kiện theo task
    try {
      await syncEventProgress(task.event);
    } catch (syncErr) {
      console.error("syncEventProgress after update:", syncErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật công việc thành công",
      data: populatedTask,
    });
  } catch (error) {
    console.error("updateTask error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật công việc",
      error: error.message,
    });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    if (!MANAGER_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ Admin hoặc Event Manager mới được xóa công việc.",
      });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Task ID không hợp lệ.",
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công việc.",
      });
    }

    if (task.status === "DONE") {
      return res.status(400).json({
        success: false,
        message: "Không xóa task đã hoàn thành để lưu lịch sử.",
      });
    }

    const eventId = task.event;

    await task.deleteOne();

    // Đồng bộ tiến độ sự kiện sau khi xóa task
    try {
      await syncEventProgress(eventId);
    } catch (syncErr) {
      console.error("syncEventProgress after delete:", syncErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Xóa công việc thành công",
    });
  } catch (error) {
    console.error("deleteTask error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể xóa công việc",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTasks,
  getMyTasks,
  getTasksByEvent,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};