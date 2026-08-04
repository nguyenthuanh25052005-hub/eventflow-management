const Task = require("../models/Task");
const Event = require("../models/Event");

/**
 * Tính tiến độ sự kiện từ task.
 * % = số task DONE / tổng task hợp lệ (không tính CANCELLED)
 */
async function calculateEventProgressFromTasks(eventId) {
  const tasks = await Task.find({ event: eventId }).select("status deadline");

  const now = new Date();

  let completed = 0;
  let inProgress = 0;
  let todo = 0;
  let cancelled = 0;
  let overdue = 0;

  for (const task of tasks) {
    if (task.status === "CANCELLED") {
      cancelled += 1;
      continue;
    }

    if (task.status === "DONE") {
      completed += 1;
    } else if (task.status === "IN_PROGRESS") {
      inProgress += 1;
    } else {
      todo += 1;
    }

    if (
      task.deadline &&
      task.deadline < now &&
      !["DONE", "CANCELLED"].includes(task.status)
    ) {
      overdue += 1;
    }
  }

  const totalValid = completed + inProgress + todo;
  const progressPercent =
    totalValid === 0 ? 0 : Math.round((completed / totalValid) * 100);

  return {
    totalValid,
    completed,
    inProgress,
    todo,
    cancelled,
    overdue,
    progressPercent,
  };
}

/** Tính lại và ghi vào Event.progress */
async function syncEventProgress(eventId) {
  const stats = await calculateEventProgressFromTasks(eventId);

  await Event.findByIdAndUpdate(eventId, {
    progress: stats.progressPercent,
  });

  return stats;
}

module.exports = {
  calculateEventProgressFromTasks,
  syncEventProgress,
};