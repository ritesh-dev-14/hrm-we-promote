import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Pages
import Login from "../auth/login";

import AdminHomePage from "../pages/Admin/AdminHomePage";
import AdminTaskCreation from "../pages/Admin/AdminTaskCreation";

// Shared Task Detail
import TaskDetailPage from "../components/taskCreation/TaskDetailPage.jsx";

import HrHomePage from "../pages/HR/HrHomePage";
import HrTeamPage from "../pages/HR/HrTeamPage";
import HrLeaveManagement from "../pages/HR/HrEmployeeLeaves";
import HrPayslips from "../pages/HR/HrPaySlips";
import HrSettings from "../pages/HR/HrSettigns";
import HrAttendance from "../pages/HR/HrAttendance.jsx";
import HrLeaves from "../pages/HR/HrLeaves.jsx";
import HrAllEmployeeAttendence from "../pages/HR/HrAllEmployeeAttendence.jsx";
import EmployeeDetails from "../pages/HR/employeeDetailsHr/EmployeeDetails.jsx";
import HrTaskCreation from "../pages/HR/HrTaskCreation";

import EmployeHomePage from "../pages/Employee/EmployeeHomePage";
import EmployeeAttendence from "../pages/Employee/EmployeeAttendence";
import EmployeeLeave from "../pages/Employee/EmployeeLeave";
import EmployeePayslips from "../pages/Employee/EmployeePayslips";
import EmployeeSettings from "../pages/Employee/EmployeeSettings";
import EmployeeTaskPage from "../pages/Employee/EmployeeTaskPage.jsx";
import EmployeeTaskDetailsPage from "../pages/Employee/tasks/EmployeeTaskDetailsPage.jsx";

import ManagerHomePage from "../pages/Manager/ManagerHomePage";
import ManagerAttendence from "../pages/Manager/ManagerAttendence";
import ManagerLeave from "../pages/Manager/ManagerLeave";
import ManagerPayslips from "../pages/Manager/ManagerPayslips";
import ManagerSettings from "../pages/Manager/ManagerSettings";
import ManagerTaskPage from "../pages/Manager/ManagerTasksPage.jsx";
import ManagerTaskDetailsPage from "../pages/Manager/tasks/ManagerTaskDetails.jsx";
/* NEW — COORDINATOR */
import CoordinatorHomePage from "../pages/Coordinator/CoordinatorHomePage.jsx";
import CoordinatorPriorityActions from "../pages/Coordinator/CoordinatorPriorityActions.jsx";

/* NEW — EMPLOYEE ACTIONS */
import AssignedActionsPage from "../pages/Employee/AssignedActionsPage.jsx";

export const AppRoutes = () => {
  const { role, user, token, isLoading } = useAuth();

  const isAuthenticated = user && token;

  // LOADER
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4"></div>

          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* AUTH ROUTES */}
      {isAuthenticated && role && (
        <>
          {/* HOME */}
          <Route
            path="/dashboard"
            element={
              role === "ADMIN" ? (
                <AdminHomePage />
              ) : role === "HR" ? (
                <HrHomePage />
              ) : role === "MANAGER" ? (
                <ManagerHomePage />
              ) : role === "COORDINATOR" ? (
                <CoordinatorHomePage />
              ) : (
                <EmployeHomePage />
              )
            }
          />

          {/* TASKS */}
          <Route
            path="/tasks"
            element={
              role === "ADMIN" ? (
                <AdminTaskCreation />
              ) : role === "HR" ? (
                <HrTaskCreation />
              ) : role === "MANAGER" ? (
                <ManagerTaskPage />
              ) : role === "COORDINATOR" ? (
                <EmployeeTaskPage />
              ) : (
                <EmployeeTaskPage />
              )
            }
          />

          <Route
            path="/priority-actions"
            element={
              role === "COORDINATOR" ? (
                <CoordinatorPriorityActions />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route
  path="/assigned-actions"
  element={
    ["EMPLOYEE", "MANAGER", "HR"].includes(role) ? (
      <AssignedActionsPage />
    ) : (
      <Navigate to="/dashboard" replace />
    )
  }
/>

          {/* DYNAMIC TASK DETAILS */}
          <Route
            path="/:role/tasks/:id"
            element={
              role === "MANAGER" ? (
                <ManagerTaskDetailsPage />
              ) : role === "EMPLOYEE" ? (
                <EmployeeTaskDetailsPage />
              ) : (
                <TaskDetailPage />
              )
            }
          />

          {/* ATTENDANCE */}
          <Route
            path="/attendance"
            element={
              role === "EMPLOYEE" ? (
                <EmployeeAttendence />
              ) : role === "MANAGER" ? (
                <ManagerAttendence />
              ) : role === "HR" ? (
                <HrAttendance />
              ) : role === "COORDINATOR" ? (
                <EmployeeAttendence />
              ) : null
            }
          />

          {/* LEAVE */}
          <Route
            path="/leave"
            element={
              role === "EMPLOYEE" ? (
                <EmployeeLeave />
              ) : role === "MANAGER" ? (
                <ManagerLeave />
              ) : role === "HR" ? (
                <HrLeaves />
              ) : role === "COORDINATOR" ? (
                <EmployeeLeave />
              ) : null
            }
          />

          {/* PAYSLIPS */}
          <Route
            path="/payslips"
            element={
              role === "EMPLOYEE" ? (
                <EmployeePayslips />
              ) : role === "MANAGER" ? (
                <ManagerPayslips />
              ) : role === "HR" ? (
                <HrPayslips />
              ) : role === "COORDINATOR" ? (
                <EmployeePayslips />
              ) : null
            }
          />

          {/* SETTINGS */}
          <Route
            path="/settings"
            element={
              role === "EMPLOYEE" ? (
                <EmployeeSettings />
              ) : role === "MANAGER" ? (
                <ManagerSettings />
              ) : role === "HR" ? (
                <HrSettings />
              ) : role === "COORDINATOR" ? (
                <EmployeeSettings />
              ) : null
            }
          />

          {/* HR */}
          {role === "HR" && (
            <>
              <Route
                path="/hr/employees-attendance"
                element={<HrAllEmployeeAttendence />}
              />

              <Route path="/hr/team/:id" element={<EmployeeDetails />} />

              <Route
                path="/hr/employees-leaves"
                element={<HrLeaveManagement />}
              />

              <Route path="/hr/team" element={<HrTeamPage />} />
            </>
          )}

          {/* ADMIN */}
          {role === "ADMIN" && (
            <Route path="/admin/settings" element={<AdminHomePage />} />
          )}

          {/* ROOT */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      )}

      {/* UNAUTH */}
      {!isAuthenticated && (
        <>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
};

export default AppRoutes;
