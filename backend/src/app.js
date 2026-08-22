const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error.middleware");
const attendanceRoutes = require("./modules/attendance/attendance.routes");
const { corsOptions } = require("./config/cors");
require("dotenv").config();

const app = express();
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running...");
});

// Register routes
app.use("/api/auth", require("./modules/auth/auth.routes"));
app.use("/api/hr", require("./modules/hr/hr.routes"));
app.use("/api/attendance", attendanceRoutes);
app.use("/api/manager/tasks", require("./modules/task/task.routes"));
app.use("/api/employee", require("./modules/employee/employee.routes"));
app.use("/api/manager", require("./modules/manager/manager.routes"));
app.use("/api/projects", require("./modules/project/project.routes"));
app.use("/api/project-reports", require("./modules/project-report/project-report.routes"));
app.use(
  "/api/projects/:projectId/monthly-sheets",
  require("./modules/project-monthly-sheet/project-monthly-sheet.routes")
);
app.use(
  "/api/task-items",
  require("./modules/task-item/task-item.routes")
);
app.use(
  "/api/task-item-submission",
  require(
    "./modules/task-item-submission/task-item-submission.routes"
  )
);
app.use(
  "/api/coordinator-assignments",
  require("./modules/coordinator-assignment/coordinator-assignment.routes")
);
app.use(
  "/api/employee-dashboard",
  require("./modules/employee-dashboard/employee-dashboard.routes")
);

app.use(
  "/api/task-groups",
  require("./modules/task-group/task-group.routes")
);

app.use(
  "/api/team",
  require("./modules/team/team.routes")
);

app.use(
  "/manager",
  require("./modules/project-tracker/project-tracker.routes")
);

// Backwards-compatible path for Postman / frontend
app.use(
  "/api/project-tracker",
  require("./modules/project-tracker/project-tracker.routes")
);

app.use(
  "/api/departments",
  require(
    "./modules/department/department.routes"
  )
);

app.use(
  "/api/shoot-workspaces",
  require("./modules/shoot-workspace/shoot-workspace.routes")
);

app.use(
  "/api/escalations",
  require("./modules/escalation/escalation.routes")
);

app.use(
  "/api/sidebar-unread",
  require("./modules/sidebar-unread/sidebar-unread.routes")
);

app.use(
  "/api/reports",
  require("./modules/report/report.routes")
);

app.use(
  "/api/payslips",
  require("./modules/payslip/payslip.routes")
);

app.use(
  "/api/uploads",
  require("./modules/uploads/uploads.routes")
);

app.use(
  "/api/seo-reports",
  require("./modules/seo-report/seo-report.routes")
);

app.use(
  "/api/seo-tasks",
  require("./modules/seo-task/seo-task.routes")
);

app.use(
  "/api/marketing-reports",
  require("./modules/marketing-report/marketing-report.routes")
);

app.use(
  "/api/whatsapp-messages",
  require("./modules/whatsapp-message/whatsapp-message.routes")
);

app.use(
  "/api/daily-report",
  require("./modules/daily-report/daily-report.routes")
);

// Error handling middleware

app.use(errorMiddleware);

module.exports = app;
