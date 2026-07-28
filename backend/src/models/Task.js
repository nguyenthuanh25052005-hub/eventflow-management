const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề công việc là bắt buộc"],
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Sự kiện là bắt buộc"],
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"],
      default: "TODO",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },

    deadline: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.pre("save", function (next) {
  if (this.status === "DONE" && !this.completedAt) {
    this.completedAt = new Date();
  }

  if (this.status !== "DONE") {
    this.completedAt = null;
  }

  next();
});

module.exports = mongoose.model("Task", taskSchema);
