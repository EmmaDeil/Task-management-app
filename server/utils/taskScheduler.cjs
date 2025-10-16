const cron = require("node-cron");
const Task = require("../models/Task.cjs");
const Notification = require("../models/Notification.cjs");

/**
 * Check for overdue tasks and create notifications
 */
const checkOverdueTasks = async () => {
  try {
    console.log("🔍 Checking for overdue tasks...");

    const now = new Date();

    // Find tasks that are overdue and not completed
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $ne: "done" },
    }).populate("assignee organization project");

    console.log(`📋 Found ${overdueTasks.length} overdue tasks`);

    for (const task of overdueTasks) {
      // Check if notification already exists for this task
      const existingNotification = await Notification.findOne({
        relatedTask: task._id,
        type: "task_overdue",
        isRead: false,
      });

      // Only create notification if one doesn't exist
      if (!existingNotification) {
        const notification = new Notification({
          user: task.assignee?._id,
          organization: task.organization,
          type: "task_overdue",
          title: "⚠️ Overdue Task",
          message: `Task "${
            task.title
          }" is overdue! Due date was ${task.dueDate.toLocaleDateString()}`,
          link: `/projects/${task.project?._id || ""}?task=${task._id}`,
          relatedTask: task._id,
          isRead: false,
        });

        await notification.save();
        console.log(`✅ Created overdue notification for task: ${task.title}`);
      }
    }

    console.log("✨ Overdue task check completed");
  } catch (error) {
    console.error("❌ Error checking overdue tasks:", error);
  }
};

/**
 * Start the task scheduler
 * Runs every hour at the start of the hour (0 minutes)
 */
const startTaskScheduler = () => {
  // Run every hour: "0 * * * *"
  // For testing, you can use "*/5 * * * *" to run every 5 minutes
  cron.schedule("0 * * * *", () => {
    console.log("⏰ Scheduled task: Checking for overdue tasks");
    checkOverdueTasks();
  });

  console.log(
    "🚀 Task scheduler started - checking for overdue tasks every hour"
  );

  // Run once immediately on startup
  checkOverdueTasks();
};

module.exports = { startTaskScheduler, checkOverdueTasks };
