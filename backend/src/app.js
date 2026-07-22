const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error.middleware");
const attendanceRoutes = require("./modules/attendance/attendance.routes");
require("dotenv").config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://hrm.wepromoteindia.com"
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
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

// Error handling middleware

app.use(errorMiddleware);

module.exports = app;
