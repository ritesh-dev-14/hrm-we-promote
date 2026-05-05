import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import AdminHomePage from "../pages/Admin/AdminHomePage";
import HrHomePage from "../pages/HR/HrHomePage";
import ManagerHomePage from "../pages/Manager/ManagerHomePage";
import EmployeHomePage from "../pages/employee/EmployeHomePage";

export const AppRoutes = () => {
  const { role } = useAuth();

  return (
    <Routes>
      {role === "ADMIN" && <Route path="/admin" element={<AdminHomePage />} />}

      {role === "HR" && <Route path="/hr" element={<HrHomePage />} />}

      {role === "MANAGER" && (
        <Route path="/manager" element={<ManagerHomePage />} />
      )}

      {role === "EMPLOYEE" && (
        <Route path="/" element={<EmployeHomePage />} />
      )}

      {/* Role-based Redirect */}
      <Route
        path="/"
        element={
          <Navigate
            replace
            to={role === "ADMIN" ? "/admin" : role === "HR" ? "/hr" : "/home"}
          />
        }
      />

      <Route path="*" element={<div>404 - No Access</div>} />
    </Routes>
  );
};
