// EmployeeTaskPage.jsx

import { useEffect, useState } from "react";
import API from "../../services/api";

import {
  Calendar,
  MapPin,
  ChevronRight,
  ClipboardList,
  X,
  Link2,
  CheckCircle2,
  Clock3,
  Sparkles,
  Send,
} from "lucide-react";

const EmployeeTaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [showSubmitModel, setShowSubmitModal] = useState(true);

  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null);

  const [driveLink, setDriveLink] = useState("");

  const [remarks, setRemarks] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // LOAD TASKS
  const loadTasks = async () => {
    try {
      setLoading(true);

      const response = await API.get("/api/task-item-submission/my-items");

      setTasks(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // OPEN TASK
  const handleOpenTask = (task) => {
    setSelectedTask(task);

    setDriveLink("");

    setRemarks("");
  };

  // SUBMIT TASK
  const handleSubmitTask = async () => {
    try {
      if (!selectedTask?.id) {
        return alert("Task item id missing");
      }

      await API.post(`/api/task-item-submission/${selectedTask.id}/submit`, {
        driveLink,
        remarks,
      });

      alert("Task submitted successfully");

      setShowSubmitModal(false);

      loadTasks();
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Submission failed");
    }
  };

  // STATUS STYLES
  const statusStyles = {
    ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",

    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",

    PENDING: "bg-orange-100 text-orange-700 border-orange-200",

    IN_PROGRESS: "bg-violet-100 text-violet-700 border-violet-200",
  };

  // STATS
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED",
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status !== "COMPLETED",
  ).length;

  return (
    <>
      <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
                <ClipboardList size={22} />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                  My Tasks
                </h1>

                <p className="text-slate-500 mt-1">
                  Complete and submit assigned subtasks.
                </p>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-slate-500 mb-2">Total Tasks</p>

              <h2 className="text-4xl font-bold text-slate-900">
                {totalTasks}
              </h2>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-slate-500 mb-2">Completed</p>

              <h2 className="text-4xl font-bold text-emerald-600">
                {completedTasks}
              </h2>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-slate-500 mb-2">Pending</p>

              <h2 className="text-4xl font-bold text-orange-500">
                {pendingTasks}
              </h2>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />

              <p className="text-slate-500">Loading tasks...</p>
            </div>
          )}

          {/* EMPTY */}
          {!loading && !tasks.length && (
            <div className="bg-white rounded-[32px] border border-dashed border-slate-300 p-16 text-center">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                <ClipboardList size={34} className="text-slate-400" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                No Tasks Assigned
              </h3>

              <p className="text-slate-500">Your tasks will appear here.</p>
            </div>
          )}

          {/* TASK GRID */}
          {!loading && tasks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tasks.map((item) => {
                const subtask = item.taskItem;

                const task = item.taskItem?.task;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenTask(item)}
                    className="group bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    {/* STATUS */}
                    <div className="flex items-center justify-between mb-5">
                      <span
                        className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                          statusStyles[item.status]
                        }`}
                      >
                        {item.status}
                      </span>

                      <ChevronRight
                        size={18}
                        className="text-slate-400 group-hover:translate-x-1 transition"
                      />
                    </div>

                    {/* TITLE */}
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {subtask?.title}
                    </h2>

                    {/* DESC */}
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">
                      {subtask?.description}
                    </p>

                    {/* DATE */}
                    <div className="space-y-3">
                      {task?.date && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Calendar size={16} />
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">Due Date</p>

                            <p className="text-sm font-semibold text-slate-700">
                              {new Date(task.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {task?.location && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <MapPin size={16} />
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">Location</p>

                            <p className="text-sm font-semibold text-slate-700 truncate max-w-[220px]">
                              {task.location}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* FOOTER */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Main Task</p>

                        <p className="font-semibold text-slate-800 truncate max-w-[180px]">
                          {task?.title}
                        </p>
                      </div>

                      <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center">
                        <Sparkles size={18} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FULLSCREEN TASK MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 md:p-8">
            <div className="w-full max-w-5xl bg-white rounded-[40px] overflow-hidden shadow-2xl">
              {/* HEADER */}
              <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 md:px-8 py-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Task Details</p>

                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedTask?.taskItem?.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedTask(null)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 md:p-8">
                {/* BADGES */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <span
                    className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                      statusStyles[selectedTask.status]
                    }`}
                  >
                    {selectedTask.status}
                  </span>

                  <span className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold">
                    {selectedTask?.taskItem?.task?.setupType}
                  </span>
                </div>

                {/* INFO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                  <div className="border border-slate-200 rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar size={16} />

                      <p className="text-sm text-slate-500">Due Date</p>
                    </div>

                    <p className="font-bold text-slate-900">
                      {new Date(
                        selectedTask?.taskItem?.task?.date,
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={16} />

                      <p className="text-sm text-slate-500">Location</p>
                    </div>

                    <p className="font-bold text-slate-900 break-all">
                      {selectedTask?.taskItem?.task?.location}
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock3 size={16} />

                      <p className="text-sm text-slate-500">Assigned At</p>
                    </div>

                    <p className="font-bold text-slate-900">
                      {new Date(selectedTask.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Description
                  </h3>

                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                    <p className="text-slate-700 leading-relaxed">
                      {selectedTask?.taskItem?.description}
                    </p>
                  </div>
                </div>

                {/* INSTRUCTIONS */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Instructions
                  </h3>

                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                      {selectedTask?.taskItem?.instructions}
                    </p>
                  </div>
                </div>

                {/* REFERENCE LINK */}
                {selectedTask?.taskItem?.referenceLink && (
                  <div className="mb-8">
                    <a
                      href={selectedTask?.taskItem?.referenceLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 transition font-semibold text-slate-800"
                    >
                      <Link2 size={18} />
                      Open Reference Link
                    </a>
                  </div>
                )}

                {/* SUBMIT SECTION */}
                <div className="border-t border-slate-200 pt-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-5">
                    Submit Task
                  </h3>

                  <div className="space-y-5">
                    <input
                      type="text"
                      placeholder="Paste Google Drive link"
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      className="w-full h-14 rounded-2xl border border-slate-200 px-5 outline-none focus:border-black"
                    />

                    <textarea
                      placeholder="Remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full min-h-[140px] rounded-3xl border border-slate-200 p-5 outline-none focus:border-black resize-none"
                    />

                    <button
                      onClick={handleSubmitTask}
                      disabled={submitting}
                      className="h-14 px-8 rounded-2xl bg-black hover:opacity-90 text-white font-semibold flex items-center gap-3 transition"
                    >
                      <Send size={18} />

                      {submitting ? "Submitting..." : "Submit Task"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeTaskPage;
