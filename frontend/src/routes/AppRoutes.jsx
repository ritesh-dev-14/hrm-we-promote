import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Pages
import Login from "../auth/login";

import AdminHomePage from "../pages/Admin/AdminHomePage";
import AdminTaskCreation from "../pages/Admin/AdminTaskCreation";

import TaskDescription from "../components/taskCreation/TaskDescription.jsx";

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
 * ✅ CENTRAL ROUTE CONFIG
 */
const ROUTES = [
  {
    path: "/dashboard",
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    component: {
      ADMIN: <AdminHomePage />,
      HR: <HrHomePage />,
      MANAGER: <ManagerHomePage />,
      EMPLOYEE: <EmployeHomePage />,
    },
  },
  {
    path: "/tasks",
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    component: {
      ADMIN: <AdminTaskCreation />,
      HR: <HrTaskCreation />,
      MANAGER: <ManagerTaskPage />,
      EMPLOYEE: <EmployeeTaskPage />,
    },
  },

  {
    path: "/task/description/:id",
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    component: {
      ADMIN: <TaskDescription />,
      HR: <TaskDescription />,
      MANAGER: <TaskDescription />,
      EMPLOYEE: <TaskDescription />,
    },
  },

  {
    path: "/manager/tasks/:id",
    roles: ["MANAGER"],
    component: {
      MANAGER: <ManagerTaskDetailsPage />,
    },
  },
  {
    path: "/employee/tasks/:id",
    roles: ["EMPLOYEE"],
    component: {
      EMPLOYEE: <EmployeeTaskDetailsPage />,
    },
  },
  {
    path: "/attendance",
    roles: ["EMPLOYEE", "MANAGER", "HR"],
    component: {
      EMPLOYEE: <EmployeeAttendence />,
      MANAGER: <ManagerAttendence />,
      HR: <HrAttendance />,
    },
  },
  {
    path: "/leave",
    roles: ["EMPLOYEE", "MANAGER", "HR"],
    component: {
      EMPLOYEE: <EmployeeLeave />,
      MANAGER: <ManagerLeave />,
      HR: <HrLeaves />,
    },
  },

  {
    path: "/payslips",
    roles: ["EMPLOYEE", "MANAGER", "HR"],
    component: {
      EMPLOYEE: <EmployeePayslips />,
      MANAGER: <ManagerPayslips />,
      HR: <HrPayslips />,
    },
  },
  {
    path: "/hr/employees-attendance",

    roles: ["HR"],

    component: {
      HR: <HrAllEmployeeAttendence />,
    },
  },
  {
    path: "/hr/team/:id",
    roles: ["HR"],
    component: {
      HR: <EmployeeDetails />,
    },
  },
  {
    path: "/hr/employees-leaves",

    roles: ["HR"],

    component: {
      HR: <HrLeaveManagement />,
    },
  },
  {
    path: "/settings",
    roles: ["EMPLOYEE", "MANAGER", "HR"],
    component: {
      EMPLOYEE: <EmployeeSettings />,
      MANAGER: <ManagerSettings />,
      HR: <HrSettings />,
    },
  },
  {
    path: "/hr/team",
    roles: ["HR"],
    component: {
      HR: <HrTeamPage />,
    },
  },
  {
    path: "/admin/settings",
    roles: ["ADMIN"],
    component: {
      ADMIN: <AdminHomePage />,
    },
  },
];

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
          {ROUTES.map((route) => {
            if (!route.roles.includes(role)) return null;

            return (
              <Route
                key={route.path}
                path={route.path}
                element={route.component[role]}
              />
            );
          })}

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
