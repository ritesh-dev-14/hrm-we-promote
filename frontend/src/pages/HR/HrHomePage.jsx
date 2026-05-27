import { useEffect, useState } from "react";
import {
  Users,
  Briefcase,
  ClipboardList,
  TrendingUp,
  Mail,
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  Loader2,
} from "lucide-react";

import { motion } from "framer-motion";

import API from "../../services/api";
import { notifyError } from "../../utils/toast";

import AttendanceCard from "../../components/attendece/AttendenceCard";

const statusStyles = {
  DRAFT: "bg-slate-100 text-slate-600",
  ASSIGNED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  SUBMITTED: "bg-violet-50 text-violet-700",
  VERIFIED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
};

const HrHomePage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedManager, setSelectedManager] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await API.get("/api/hr/dashboard/overview");

      if (response?.data?.success) {
        const data = response.data.data;

        setDashboardData(data);

        if (data.managerDetails?.length > 0) {
          setSelectedManager(data.managerDetails[0]);
        }
      }
    } catch (error) {
      console.log(error);
      notifyError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-700" size={30} />
      </div>
    );
  }

  if (!dashboardData) return null;

  const { globalStats, managerDetails } = dashboardData;

  const stats = [
    {
      title: "Managers",
      value: globalStats.totalManagers,
      icon: Users,
    },
    {
      title: "Employees",
      value: globalStats.totalEmployees,
      icon: Users,
    },
    {
      title: "Projects",
      value: globalStats.totalTasks,
      icon: Briefcase,
    },
    {
      title: "Tasks",
      value: globalStats.totalAssignments,
      icon: ClipboardList,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ATTENDANCE */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6">
          <AttendanceCard />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {item.title}
                  </p>

                  <h2 className="text-3xl font-bold text-slate-900 mt-2">
                    {item.value}
                  </h2>
                </div>

                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                  <item.icon size={20} className="text-slate-700" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 size={18} />
              <p className="text-sm font-medium">Completed</p>
            </div>

            <h2 className="text-3xl font-bold mt-3">
              {globalStats.completedAssignments}
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-amber-600">
              <Clock3 size={18} />
              <p className="text-sm font-medium">Submitted</p>
            </div>

            <h2 className="text-3xl font-bold mt-3">
              {globalStats.submittedAssignments}
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle size={18} />
              <p className="text-sm font-medium">Rejected</p>
            </div>

            <h2 className="text-3xl font-bold mt-3">
              {globalStats.rejectedAssignments}
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-blue-600">
              <TrendingUp size={18} />
              <p className="text-sm font-medium">Avg Progress</p>
            </div>

            <h2 className="text-3xl font-bold mt-3">
              {globalStats.globalAverageProgress}%
            </h2>
          </div>
        </div>

        {/* MANAGER FILTER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex flex-wrap gap-3">
            {managerDetails.map((managerNode) => (
              <button
                key={managerNode.manager.id}
                onClick={() => setSelectedManager(managerNode)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
                ${
                  selectedManager?.manager?.id === managerNode.manager.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {managerNode.manager.name}
              </button>
            ))}
          </div>
        </div>

        {/* MANAGER DETAILS */}
        {selectedManager && (
          <>
            {/* HEADER */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-slate-900">
                      {selectedManager.manager.name}
                    </h2>

                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      {selectedManager.manager.employeeId}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Mail size={15} />
                      {selectedManager.manager.email}
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} />
                      Joined{" "}
                      {new Date(
                        selectedManager.manager.createdAt
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl px-5 py-4">
                    <p className="text-xs text-slate-500">
                      Employees
                    </p>

                    <h3 className="text-2xl font-bold mt-1">
                      {selectedManager.stats.totalEmployees}
                    </h3>
                  </div>

                  <div className="bg-slate-50 rounded-xl px-5 py-4">
                    <p className="text-xs text-slate-500">
                      Progress
                    </p>

                    <h3 className="text-2xl font-bold mt-1">
                      {selectedManager.stats.averageProgress}%
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* EMPLOYEES */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">
                  Employees
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead className="bg-slate-50">
                    <tr className="text-left">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                        Employee
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                        Department
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                        Assigned
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                        Submitted
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                        Progress
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedManager.employees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-6 py-5">
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {emp.name}
                            </h4>

                            <p className="text-sm text-slate-500 mt-1">
                              {emp.email}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {emp.department?.name || "-"}
                        </td>

                        <td className="px-6 py-5 font-semibold">
                          {emp.assignedTasks}
                        </td>

                        <td className="px-6 py-5 font-semibold text-violet-700">
                          {emp.submittedTasks}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-28 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-slate-900 rounded-full"
                                style={{
                                  width: `${emp.averageProgress}%`,
                                }}
                              />
                            </div>

                            <span className="text-sm font-semibold">
                              {emp.averageProgress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PROJECTS */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">
                  Projects
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                        Project
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                        Description
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                        Created
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedManager.tasks.map((task) => (
                      <tr
                        key={task.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-6 py-5 font-semibold text-slate-900">
                          {task.projectName}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600 max-w-md">
                          {task.description}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[task.status]}`}
                          >
                            {task.status}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-500">
                          {new Date(
                            task.createdAt
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ASSIGNMENTS */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">
                  Tasks
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                        Employee
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                        Task
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                        Progress
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                        Submitted
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedManager.recentAssignments.map(
                      (assignment) => (
                        <tr
                          key={assignment.id}
                          className="border-t border-slate-100"
                        >
                          <td className="px-6 py-5">
                            <div>
                              <h4 className="font-semibold text-slate-900">
                                {assignment.employee?.name}
                              </h4>

                              <p className="text-sm text-slate-500 mt-1">
                                {assignment.employee?.email}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-5 font-medium text-slate-700">
                            {assignment.taskItem?.title}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[assignment.status]}`}
                            >
                              {assignment.status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-28 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-slate-900 rounded-full"
                                  style={{
                                    width: `${assignment.progress}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm font-semibold">
                                {assignment.progress}%
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-500">
                            {assignment.submittedAt
                              ? new Date(
                                  assignment.submittedAt
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HrHomePage;