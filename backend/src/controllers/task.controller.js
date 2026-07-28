const mongoose = require("mongoose");

const Task = require("../models/Task");
const Event = require("../models/Event");
const Employee = require("../models/Employee");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getAllTasks = async (req, res) => {
  try {
    const { status, priority, event, assignedTo, search, overdue } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (event) {
      if (!isValidObjectId(event)) {
        return res.status(400).json({
          success: false,
          message: "Event ID không hợp lệ",
        });
      }

      filter.event = event;
    }

    if (assignedTo) {
      if (!isValidObjectId(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: "Employee ID không hợp lệ",
        });
      }

      filter.assignedTo = assignedTo;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (overdue === "true") {
      filter.deadline = {
        $lt: new Date(),
      };

      filter.status = {
        $nin: ["DONE", "CANCELLED"],
      };
    }

    const tasks = await Task.find(filter)
      .populate("event", "name title status startDate endDate")
      .populate("assignedTo", "fullName name email position")
      .sort({
        createdAt: -1,
      });

    const now = new Date();

    const summary = {
      total: tasks.length,
      todo: tasks.filter((task) => task.status === "TODO").length,
      inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      done: tasks.filter((task) => task.status === "DONE").length,
      overdue: tasks.filter(
        (task) =>
          task.deadline &&
          task.deadline < now &&
          !["DONE", "CANCELLED"].includes(task.status),
      ).length,
    };

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách công việc thành công",
      data: {
        tasks,
        summary,
      },
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

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Task ID không hợp lệ",
      });
    }

    const task = await Task.findById(id)
      .populate("event", "name title status startDate endDate")
      .populate("assignedTo", "fullName name email position");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công việc",
      });
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

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      event,
      assignedTo,
      status,
      priority,
      deadline,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề công việc là bắt buộc",
      });
    }

    if (!event || !isValidObjectId(event)) {
      return res.status(400).json({
        success: false,
        message: "Event ID không hợp lệ",
      });
    }

    const existingEvent = await Event.findById(event);

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sự kiện",
      });
    }

    if (["COMPLETED", "CANCELLED"].includes(existingEvent.status)) {
      return res.status(400).json({
        success: false,
        message: "Không thể tạo công việc cho sự kiện đã kết thúc hoặc bị hủy",
      });
    }

    if (assignedTo) {
      if (!isValidObjectId(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: "Employee ID không hợp lệ",
        });
      }

      const employee = await Employee.findById(assignedTo);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhân viên được phân công",
        });
      }
    }

    const parsedDeadline = deadline ? new Date(deadline) : null;

    if (parsedDeadline && Number.isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Deadline không hợp lệ",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      event,
      assignedTo: assignedTo || null,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      deadline: parsedDeadline,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("event", "name title status startDate endDate")
      .populate("assignedTo", "fullName name email position");

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

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Task ID không hợp lệ",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công việc",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "assignedTo",
      "status",
      "priority",
      "deadline",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    if (task.title) {
      task.title = task.title.trim();
    }

    if (task.description) {
      task.description = task.description.trim();
    }

    if (task.assignedTo) {
      if (!isValidObjectId(task.assignedTo)) {
        return res.status(400).json({
          success: false,
          message: "Employee ID không hợp lệ",
        });
      }

      const employee = await Employee.findById(task.assignedTo);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhân viên được phân công",
        });
      }
    }

    if (task.deadline) {
      const parsedDeadline = new Date(task.deadline);

      if (Number.isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Deadline không hợp lệ",
        });
      }

      task.deadline = parsedDeadline;
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("event", "name title status startDate endDate")
      .populate("assignedTo", "fullName name email position");

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

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Task ID không hợp lệ",
      });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công việc",
      });
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
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
