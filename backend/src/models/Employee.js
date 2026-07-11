const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    position: {
      type: String,
      enum: ["ADMIN", "EVENT_MANAGER", "DESIGNER", "ACCOUNTANT"],
      required: true,
    },

    department: {
      type: String,
      default: "",
      trim: true,
    },

    hireDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;