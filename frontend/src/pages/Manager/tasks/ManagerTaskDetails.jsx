import { useMemo } from "react";

import { useParams } from "react-router-dom";

import {
  CalendarDays,
  Users,
  CheckCircle2,
  Clock3,
  ArrowRight,
} from "lucide-react";

import { managerTasks } from "./managerTask";

const ManagerTaskDetailsPage = () => {
  const { id } = useParams();

  const task = useMemo(() => {
    return managerTasks.find((item) => item.id === id);
  }, [id]);

  if (!task) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          Task Not Found
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-4 lg:p-7">
      <div className="max-w-7xl mx-auto">
        {/* TOP SECTION */}
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 lg:p-8 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  {task.priority}
                </span>

                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                  {task.status.replace("_", " ")}
                </span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                {task.title}
              </h1>

              <p className="mt-4 text-slate-500 max-w-3xl leading-relaxed">
                {task.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={task.assignedManager.avatar}
                alt=""
                className="w-14 h-14 rounded-2xl object-cover"
              />

              <div>
                <p className="text-sm text-slate-400">
                  Assigned Manager
                </p>

                <h3 className="font-semibold text-slate-900">
                  {task.assignedManager.name}
                </h3>
              </div>
            </div>
          </div>

          {/* PROGRESS */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">
                Task Progress
              </span>

              <span className="text-sm font-semibold text-slate-800">
                {task.progress}%
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${task.progress}%`,
                }}
                className="h-full bg-slate-900 rounded-full"
              />
            </div>
          </div>

          {/* INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays
                  size={16}
                  className="text-slate-500"
                />

                <span className="text-sm text-slate-500">
                  Deadline
                </span>
              </div>

              <h3 className="font-semibold text-slate-900">
                {task.dueDate}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users
                  size={16}
                  className="text-slate-500"
                />

                <span className="text-sm text-slate-500">
                  Employees
                </span>
              </div>

              <h3 className="font-semibold text-slate-900">
                {task.employees.length} Members
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2
                  size={16}
                  className="text-slate-500"
                />

                <span className="text-sm text-slate-500">
                  Stage
                </span>
              </div>

              <h3 className="font-semibold text-slate-900 capitalize">
                {task.stage}
              </h3>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* EMPLOYEES */}
          <div className="xl:col-span-4">
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Team Members
                </h2>

                <span className="text-sm text-slate-500">
                  Available Staff
                </span>
              </div>

              <div className="space-y-4">
                {task.employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={employee.avatar}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover"
                      />

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {employee.name}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {employee.role}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        employee.status === "available"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SUBTASKS */}
          <div className="xl:col-span-8">
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Assigned Subtasks
                </h2>

                <button className="h-11 px-5 rounded-2xl bg-slate-900 text-white text-sm font-semibold">
                  Assign Task
                </button>
              </div>

              <div className="space-y-4">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="rounded-3xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                            {subtask.status}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">
                          {subtask.title}
                        </h3>

                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                          {subtask.description}
                        </p>
                      </div>

                      <ArrowRight className="text-slate-300 hidden lg:block" />
                    </div>

                    {/* BOTTOM */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-6 pt-5 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400">
                          Assigned Employee
                        </p>

                        <h4 className="font-semibold text-slate-900">
                          {subtask.assignedEmployee.name}
                        </h4>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Deadline
                        </p>

                        <h4 className="font-semibold text-slate-900">
                          {subtask.deadline}
                        </h4>
                      </div>

                      <div className="min-w-[180px]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-500">
                            Progress
                          </span>

                          <span className="text-xs font-semibold text-slate-700">
                            {subtask.progress}%
                          </span>
                        </div>

                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${subtask.progress}%`,
                            }}
                            className="h-full bg-slate-900 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerTaskDetailsPage;