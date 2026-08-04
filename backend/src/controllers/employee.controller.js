const Employee = require("../models/Employee");
const User = require("../models/User");

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("user", "fullName email phone role status avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { userId, employeeCode, position, department, hireDate } = req.body;

    if (!userId || !employeeCode || !position) {
      return res.status(400).json({
        success: false,
        message: "User, employee code and position are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.role === "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Không thể tạo hồ sơ nhân viên từ tài khoản quản trị viên.",
      });
    }

    const existingEmployee = await Employee.findOne({
      $or: [{ user: userId }, { employeeCode }],
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee already exists",
      });
    }
    const allowedPositions = ["EVENT_MANAGER", "DESIGNER", "ACCOUNTANT"];

    if (!allowedPositions.includes(position)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee position",
      });
    }

    const employee = await Employee.create({
      user: userId,
      employeeCode,
      position,
      department,
      hireDate,
    });

    user.role = position;
    await user.save();

    const populatedEmployee = await Employee.findById(employee._id).populate(
      "user",
      "fullName email phone role status avatar",
    );

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: populatedEmployee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { employeeCode, position, department, hireDate } = req.body;

    const employee = await Employee.findById(req.params.id);
    const allowedPositions = ["EVENT_MANAGER", "DESIGNER", "ACCOUNTANT"];

    if (position !== undefined && !allowedPositions.includes(position)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee position",
      });
    }
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    if (employeeCode && employeeCode !== employee.employeeCode) {
      const existingEmployee = await Employee.findOne({
        employeeCode,
        _id: { $ne: employee._id },
      });

      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Employee code already exists",
        });
      }
    }

    if (employeeCode !== undefined) employee.employeeCode = employeeCode;
    if (position !== undefined) employee.position = position;
    if (department !== undefined) employee.department = department;
    if (hireDate !== undefined) employee.hireDate = hireDate;

    await employee.save();

    if (position) {
      await User.findByIdAndUpdate(employee.user, { role: position });
    }

    const populatedEmployee = await Employee.findById(employee._id).populate(
      "user",
      "fullName email phone role status avatar",
    );

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: populatedEmployee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
};
