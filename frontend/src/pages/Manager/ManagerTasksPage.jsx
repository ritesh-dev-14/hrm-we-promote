// ManagerTaskPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ClipboardList,
  Plus,
  ArrowRight,
  Loader2,
  CalendarDays,
  User2,
  Link2,
  CheckCircle2,
} from "lucide-react";

import TaskStats from "../../components/taskCreation/TaskStats";
import TaskGrid from "../../components/taskCreation/TaskGrid";
import CreateTaskButton from "../../components/taskCreation/CreateTaskButton";
import CreateTaskModal from "../../components/taskCreation/CreateTaskModal";

import { fetchAllTasks } from "../../components/taskCreation/tasks";

import API from "../../services/api";

const statusStyles = {
  DRAFT: "bg-slate-100 text-slate-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-orange-100 text-orange-700",
};

const ManagerTaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [createdTasks, assignedResponse] = await Promise.all([
        fetchAllTasks(),
        API.get("/api/manager/tasks/my-tasks"),
      ]);

      setTasks(createdTasks || []);

      setAssignedTasks(assignedResponse?.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTaskClick = (task) => {
    navigate(`/manager/tasks/${task.id}`);
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
              Manager Tasks
            </h1>

            <p className="text-slate-500 mt-2 text-sm md:text-base">
              Manage assigned workflow and employee tasks.
            </p>
          </div>

          <CreateTaskButton
            title="Create Task"
            onClick={() => setOpenModal(true)}
          />
        </div>

        {/* STATS */}
        <TaskStats tasks={tasks} />

        {/* ASSIGNED TASKS */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 size={22} />

            <div>
              <h2 className="text-xl font-bold">My Assigned Tasks</h2>

              <p className="text-sm text-gray-500">Tasks assigned to you</p>
            </div>
          </div>

          {assignedTasks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {assignedTasks.map((item) => {
                const task = item.task;

                return (
                  <div
                    key={item.assignmentId}
                    className="border border-gray-200 rounded-2xl p-5 bg-gray-50"
                  >
                    {/* TOP */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {task.title}
                        </h3>

                        <p className="text-sm text-gray-500 mt-2 leading-6">
                          {task.description}
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold whitespace-nowrap">
                        {item.status}
                      </span>
                    </div>

                    {/* MAIN INFO */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-white border rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Setup Type</p>

                        <p className="font-bold text-black">{task.setupType}</p>
                      </div>

                      <div className="bg-white border rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Location</p>

                        <p className="font-semibold text-gray-800">
                          {task.location}
                        </p>
                      </div>

                      <div className="bg-white border rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Due Date</p>

                        <p className="font-semibold text-gray-800">
                          {new Date(task.date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="bg-white border rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">
                          Task Status
                        </p>

                        <p className="font-semibold text-gray-800">
                          {task.status}
                        </p>
                      </div>
                    </div>

                    {/* INSTRUCTIONS */}
                    {task.instructions && (
                      <div className="mt-5 bg-white border rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-2">
                          Instructions
                        </p>

                        <p className="text-sm text-gray-700 leading-6">
                          {task.instructions}
                        </p>
                      </div>
                    )}

                    {/* CREATED BY */}
                    <div className="mt-5 flex items-center justify-between border-t pt-4">
                      <div>
                        <p className="text-xs text-gray-500">Assigned By</p>

                        <p className="font-semibold text-gray-900">
                          {task.createdBy?.name}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {task.createdBy?.employeeId}
                        </p>
                      </div>

                     
                    </div>

                    {/* LINK */}
                    {task.referenceLink && (
                      <a
                        href={task.referenceLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600"
                      >
                        <Link2 size={16} />
                        Open Reference Link
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed rounded-xl p-10 text-center">
              <ClipboardList size={34} className="mx-auto text-gray-400 mb-3" />

              <h3 className="font-semibold">No Assigned Tasks</h3>

              <p className="text-sm text-gray-500 mt-1">
                No tasks assigned yet
              </p>
            </div>
          )}
        </div>

        {/* CREATED TASKS */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Created By Me
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Tasks created for employees and teams
            </p>
          </div>

          <TaskGrid
            tasks={tasks}
            loading={isLoading}
            onTaskClick={handleTaskClick}
          />
        </div>

        {/* MODAL */}
        <CreateTaskModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      </div>
    </div>
  );
};

export default ManagerTaskPage;
