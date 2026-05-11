import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Pages
import Login from "../auth/login";

import AdminHomePage from "../pages/Admin/AdminHomePage";
import AdminTaskCreation from "../pages/Admin/AdminTaskCreation";

// Unified Task Detail Component
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

/**
 * ✅ FINAL ROUTES
 */
export const AppRoutes = () => {
  const { role, user, token, isLoading } = useAuth();

  // Check if user is authenticated (has both user and token)
  const isAuthenticated = user && token;

  // Show loading screen while checking localStorage
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login route - accessible without authentication */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes - require authentication */}
      {isAuthenticated && role && (
        <>
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              role === "ADMIN" ? (
                <AdminHomePage />
              ) : role === "HR" ? (
                <HrHomePage />
              ) : role === "MANAGER" ? (
                <ManagerHomePage />
              ) : (
                <EmployeHomePage />
              )
            }
          />

          {/* Tasks */}
          <Route
            path="/tasks"
            element={
              role === "ADMIN" ? (
                <AdminTaskCreation />
              ) : role === "HR" ? (
                <HrTaskCreation />
              ) : role === "MANAGER" ? (
                <ManagerTaskPage />
              ) : (
                <EmployeeTaskPage />
              )
            }
          />

          {/* Task Description - All roles */}
          <Route path="/task/description/:id" element={<TaskDetailPage />} />

          {/* Manager Task Details */}
          {role === "MANAGER" && (
            <Route path="/manager/tasks/:id" element={<ManagerTaskDetailsPage />} />
          )}

          {/* HR Task Details */}
          {role === "HR" && (
            <Route path="/manager/tasks/:id" element={<TaskDetailPage />} />
          )}

          {/* Employee Task Details */}
          {role === "EMPLOYEE" && (
            <Route
              path="/employee/tasks/:id"
              element={<EmployeeTaskDetailsPage />}
            />
          )}

          {/* Attendance */}
          <Route
            path="/attendance"
            element={
              role === "EMPLOYEE" ? (
                <EmployeeAttendence />
              ) : role === "MANAGER" ? (
                <ManagerAttendence />
              ) : role === "HR" ? (
                <HrAttendance />
              ) : null
            }
          />

          {/* Leave */}
          <Route
            path="/leave"
            element={
              role === "EMPLOYEE" ? (
                <EmployeeLeave />
              ) : role === "MANAGER" ? (
                <ManagerLeave />
              ) : role === "HR" ? (
                <HrLeaves />
              ) : null
            }
          />

          {/* Payslips */}
          <Route
            path="/payslips"
            element={
              role === "EMPLOYEE" ? (
                <EmployeePayslips />
              ) : role === "MANAGER" ? (
                <ManagerPayslips />
              ) : role === "HR" ? (
                <HrPayslips />
              ) : null
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              role === "EMPLOYEE" ? (
                <EmployeeSettings />
              ) : role === "MANAGER" ? (
                <ManagerSettings />
              ) : role === "HR" ? (
                <HrSettings />
              ) : null
            }
          />

          {/* HR Routes */}
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

          {/* Admin Routes */}
          {role === "ADMIN" && (
            <Route path="/admin/settings" element={<AdminHomePage />} />
          )}

          {/* Catch-all Task Route for any role */}
          <Route path="/tasks/:id" element={<TaskDetailPage />} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </>
      )}

      {/* Redirect to login if not authenticated */}
      {!isAuthenticated && (
        <>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
};
