import { useEffect, useState } from "react";
import API from "../../services/api";
import { notifySuccess, notifyError, notifyInfo } from "../../utils/toast";

import {
  Calendar,
  MapPin,
  ClipboardList,
  X,
  Link2,
  Clock3,
  Sparkles,
  Send,
  CheckCircle2,
} from "lucide-react";

const EmployeeTaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null);

  const [driveLink, setDriveLink] = useState("");
  const [remarks, setRemarks] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // LOAD TASKS
  const loadTasks = async () => {
    try {
      setLoading(true);

      const response = await API.get("/api/employee-dashboard/items");

      setTasks(response.data.data || []);
    } catch (error) {
      console.error(error);

      notifyError(
        error?.response?.data?.message || "Failed to load tasks",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // OPEN TASK MODAL
  const handleOpenTask = (task) => {
    setSelectedTask(task);

    setDriveLink("");
    setRemarks("");
  };

  // SUBMIT TASK
  const handleSubmitTask = async () => {
    try {
      if (!selectedTask?.id) {
        return notifyError("Assignment id missing");
      }

      if (!driveLink) {
        return notifyInfo("Please enter drive link");
      }

      setSubmitting(true);

      await API.post(
        `/api/task-item-submission/${selectedTask.id}/submit`,
        {
          driveLink,
          remarks,
        },
      );

      notifySuccess("Task submitted successfully");

      setSelectedTask(null);

      loadTasks();
    } catch (error) {
      console.error(error);

      notifyError(
        error?.response?.data?.message || "Submission failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // STATUS COLORS
  const statusStyles = {
    ASSIGNED:
      "bg-blue-100 text-blue-700 border-blue-200",

    COMPLETED:
      "bg-emerald-100 text-emerald-700 border-emerald-200",

    PENDING:
      "bg-orange-100 text-orange-700 border-orange-200",

    IN_PROGRESS:
      "bg-violet-100 text-violet-700 border-violet-200",
  };

  // STATS
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.submission,
  ).length;

  const pendingTasks = tasks.filter(
    (task) => !task.submission,
  ).length;

  return (
    <>
      <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="mb-8 flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-black text-white flex items-center justify-center shadow-lg">
              <ClipboardList size={24} />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Employee Tasks
              </h1>

              <p className="text-slate-500 mt-1">
                View and submit your assigned task items.
              </p>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-[30px] border border-slate-200 p-6 shadow-sm">
              <p className="text-slate-500 text-sm mb-2">
                Total Tasks
              </p>

              <h2 className="text-4xl font-black text-slate-900">
                {totalTasks}
              </h2>
            </div>

            <div className="bg-white rounded-[30px] border border-slate-200 p-6 shadow-sm">
              <p className="text-slate-500 text-sm mb-2">
                Submitted
              </p>

              <h2 className="text-4xl font-black text-emerald-600">
                {completedTasks}
              </h2>
            </div>

            <div className="bg-white rounded-[30px] border border-slate-200 p-6 shadow-sm">
              <p className="text-slate-500 text-sm mb-2">
                Pending
              </p>

              <h2 className="text-4xl font-black text-orange-500">
                {pendingTasks}
              </h2>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />

              <p className="text-slate-500">
                Loading tasks...
              </p>
            </div>
          )}

          {/* EMPTY */}
          {!loading && tasks.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-[36px] p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <ClipboardList
                  size={34}
                  className="text-slate-400"
                />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                No Tasks Assigned
              </h2>

              <p className="text-slate-500">
                Assigned tasks will appear here.
              </p>
            </div>
          )}

          {/* TASKS */}
          {!loading && tasks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tasks.map((item) => {
                const subtask = item.taskItem;
                const task = subtask?.task;

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300"
                  >
                    {/* TOP */}
                    <div className="p-6 border-b border-slate-100">
                      <div className="flex items-start justify-between mb-5">
                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-bold ${
                            statusStyles[item.status]
                          }`}
                        >
                          {item.status}
                        </span>

                        {item.submission ? (
                          <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                            <CheckCircle2 size={16} />
                            Submitted
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-orange-500 text-sm font-semibold">
                            <Clock3 size={16} />
                            Pending
                          </div>
                        )}
                      </div>

                      {/* TITLE */}
                      <h2 className="text-2xl font-black text-slate-900 leading-tight mb-3">
                        {subtask?.title}
                      </h2>

                      {/* DESCRIPTION */}
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                        {subtask?.description}
                      </p>
                    </div>

                    {/* BODY */}
                    <div className="p-6 space-y-5">
                      {/* MAIN TASK */}
                      <div>
                        <p className="text-xs text-slate-400 mb-1">
                          Main Task
                        </p>

                        <h3 className="font-bold text-slate-800">
                          {task?.title}
                        </h3>
                      </div>

                      {/* SETUP TYPE */}
                      <div>
                        <p className="text-xs text-slate-400 mb-2">
                          Setup Type
                        </p>

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-black text-white font-semibold text-sm">
                          <Sparkles size={15} />
                          {task?.setupType}
                        </div>
                      </div>

                      {/* DATE */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <Calendar size={17} />
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Due Date
                          </p>

                          <p className="font-semibold text-slate-700">
                            {new Date(
                              task?.date,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* LOCATION */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <MapPin size={17} />
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Location
                          </p>

                          <p className="font-semibold text-slate-700">
                            {task?.location}
                          </p>
                        </div>
                      </div>

                      {/* BUTTON */}
                      <button
                        onClick={() => handleOpenTask(item)}
                        className="w-full h-14 rounded-2xl bg-black hover:opacity-90 text-white font-bold transition-all duration-300"
                      >
                        View & Submit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 md:p-8">
            <div className="w-full max-w-4xl bg-white rounded-[40px] overflow-hidden shadow-2xl">
              {/* HEADER */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    Task Details
                  </p>

                  <h2 className="text-2xl font-black text-slate-900">
                    {selectedTask?.taskItem?.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedTask(null)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 md:p-8">
                {/* DESCRIPTION */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-3">
                    Description
                  </h3>

                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
                    <p className="text-slate-700 leading-relaxed">
                      {selectedTask?.taskItem?.description}
                    </p>
                  </div>
                </div>

                {/* INSTRUCTIONS */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-3">
                    Instructions
                  </h3>

                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
                    <p className="text-slate-700 whitespace-pre-line">
                      {selectedTask?.taskItem?.instructions}
                    </p>
                  </div>
                </div>

                {/* LINK */}
                {selectedTask?.taskItem?.referenceLink && (
                  <div className="mb-8">
                    <a
                      href={
                        selectedTask?.taskItem?.referenceLink
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 font-semibold"
                    >
                      <Link2 size={18} />
                      Open Reference Link
                    </a>
                  </div>
                )}

                {/* SUBMIT */}
                {!selectedTask?.submission && (
                  <div className="border-t border-slate-200 pt-8">
                    <h3 className="text-2xl font-black mb-5">
                      Submit Task
                    </h3>

                    <div className="space-y-5">
                      <input
                        type="text"
                        placeholder="Paste Google Drive Link"
                        value={driveLink}
                        onChange={(e) =>
                          setDriveLink(e.target.value)
                        }
                        className="w-full h-14 rounded-2xl border border-slate-200 px-5 outline-none focus:border-black"
                      />

                      <textarea
                        placeholder="Remarks"
                        value={remarks}
                        onChange={(e) =>
                          setRemarks(e.target.value)
                        }
                        className="w-full min-h-[140px] rounded-3xl border border-slate-200 p-5 outline-none focus:border-black resize-none"
                      />

                      <button
                        onClick={handleSubmitTask}
                        disabled={submitting}
                        className="h-14 px-8 rounded-2xl bg-black text-white font-bold flex items-center gap-3 hover:opacity-90"
                      >
                        <Send size={18} />

                        {submitting
                          ? "Submitting..."
                          : "Submit Task"}
                      </button>
                    </div>
                  </div>
                )}

                {/* ALREADY SUBMITTED */}
                {selectedTask?.submission && (
                  <div className="border border-emerald-200 bg-emerald-50 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle2
                        size={24}
                        className="text-emerald-600"
                      />

                      <h3 className="text-xl font-bold text-emerald-700">
                        Task Already Submitted
                      </h3>
                    </div>

                    <p className="text-slate-700 mb-4">
                      Your task submission has been recorded.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-500">
                          Drive Link
                        </p>

                        <a
                          href={
                            selectedTask?.submission
                              ?.driveLink
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-semibold break-all"
                        >
                          {
                            selectedTask?.submission
                              ?.driveLink
                          }
                        </a>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Remarks
                        </p>

                        <p className="font-medium text-slate-700">
                          {
                            selectedTask?.submission
                              ?.remarks
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeTaskPage;