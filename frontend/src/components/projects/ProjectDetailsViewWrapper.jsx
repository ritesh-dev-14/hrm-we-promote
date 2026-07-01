import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

// ================= Manager Views =================
import SMMManagerView from "./managers/SMMManagerView";
import ITManagerView from "./managers/ITManagerView";
import SEOManagerView from "./managers/SEOManagerView";
import VideoEditorManagerView from "./managers/VideoEditorManagerView";
import PerformanceMarketingManagerView from "./managers/PerformanceMarketingManagerView";
import HRManagerView from "./managers/HRManagerView";
import SalesBusinessDevelopmentManagerView from "./managers/SalesBusinessDevelopmentManagerView";
import ContentCreativeManagerView from "./managers/ContentCreativeManagerView";

// ================= Employee Views =================
import ITEmployeeView from "./employees/ITEmployeeView";
import VideoEditorEmployeeView from "./employees/VideoEditorEmployeeView";
import ContentCreativeEmployeeView from "./employees/ContentCreativeEmployeeView";

const rolePages = {
  MANAGER: {
    "Web Development": ITManagerView,
    "Social Media": SMMManagerView,
    SEO: SEOManagerView,
    "Video Production": VideoEditorManagerView,
    "Performance Marketing": PerformanceMarketingManagerView,
    "Sales & Business Development": SalesBusinessDevelopmentManagerView,
    "Content & Creative": ContentCreativeManagerView,
  },

  EMPLOYEE: {
    "Web Development": ITEmployeeView,
    "Video Production": VideoEditorEmployeeView,
    "Content & Creative": ContentCreativeEmployeeView,
  },
};

const ProjectDetailsWrapper = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [departmentName, setDepartmentName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveDepartment = async () => {
      if (!user) return;

      // HR
      if (user.role === "HR") {
        setDepartmentName("HR");
        setLoading(false);
        return;
      }

      // department object
      if (user.department?.name) {
        setDepartmentName(user.department.name);
        setLoading(false);
        return;
      }

      // department string
      if (typeof user.department === "string") {
        setDepartmentName(user.department);
        setLoading(false);
        return;
      }

      // departmentId
      if (user.departmentId) {
        try {
          const res = await API.get("/api/departments");

          const dept = res.data.data.find((d) => d.id === user.departmentId);

          setDepartmentName(dept?.name || "");
        } catch (err) {
          console.error(err);
        }

        setLoading(false);
        return;
      }

      setLoading(false);
    };

    resolveDepartment();
  }, [user]);

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (user?.role === "HR") {
    return <HRManagerView projectId={id} />;
  }

  const Component = rolePages?.[user?.role]?.[departmentName];

  if (!Component) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">Department not found</h2>

        <pre className="mt-4 text-left bg-gray-100 p-4 rounded">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    );
  }

  return <Component projectId={id} />;
};

export default ProjectDetailsWrapper;
