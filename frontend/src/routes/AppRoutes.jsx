import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Pages
import Login from "../auth/login";

import AdminHomePage from "../pages/Admin/AdminHomePage";

import HrHomePage from "../pages/HR/HrHomePage";
import HrTeamPage from "../pages/HR/HrTeamPage";
import HrLeaveManagement from "../pages/HR/HrLeaveManagement";
import HrPayslips from "../pages/HR/HrPaySlips";
import HrSettings from "../pages/HR/HrSettigns";

import EmployeHomePage from "../pages/Employee/EmployeeHomePage";
import EmployeeAttendence from "../pages/Employee/EmployeeAttendence";
import EmployeeLeave from "../pages/Employee/EmployeeLeave";
import EmployeePayslips from "../pages/Employee/EmployeePayslips";
import EmployeeSettings from "../pages/Employee/EmployeeSettings";

import ManagerHomePage from "../pages/Manager/ManagerHomePage";
import ManagerAttendence from "../pages/Manager/ManagerAttendence";
import ManagerLeave from "../pages/Manager/ManagerLeave";
import ManagerPayslips from "../pages/Manager/ManagerPayslips";
import ManagerSettings from "../pages/Manager/ManagerSettings";

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
    path: "/attendance",
    roles: ["EMPLOYEE", "MANAGER"],
    component: {
      EMPLOYEE: <EmployeeAttendence />,
      MANAGER: <ManagerAttendence />,
    },
  },
  {
    path: "/leave",
    roles: ["EMPLOYEE", "MANAGER", "HR"],
    component: {
      EMPLOYEE: <EmployeeLeave />,
      MANAGER: <ManagerLeave />,
      HR: <HrLeaveManagement />,
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

<<<<<<< HEAD
  return (
    <Routes>
      {/* Login Route - Always accessible */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes - Only if logged in */}
      {role && ROUTES.map((route) => {
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
      <Route 
        path="/" 
        element={role ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
      />

      {/* Fallback - Not logged in, redirect to login */}
      {!role && <Route path="*" element={<Navigate to="/login" replace />} />}

      {/* 404 */}
      {role && <Route path="*" element={<div>404 - Page not found</div>} />}
=======
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
>>>>>>> f937cc1c7304440d40a84a85d2dc05f3d734fa05
    </Routes>
  );
};
