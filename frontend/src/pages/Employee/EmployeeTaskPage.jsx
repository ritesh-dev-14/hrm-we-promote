import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import {
  notifyError,
  notifyInfo,
  notifySuccess,
} from "../../utils/toast";

const statusStyles = {
  VERIFIED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",

  REJECTED:
    "bg-red-50 text-red-700 border border-red-200",

  SUBMITTED:
    "bg-blue-50 text-blue-700 border border-blue-200",

  ASSIGNED:
    "bg-slate-100 text-slate-700 border border-slate-200",

  PENDING:
    "bg-amber-50 text-amber-700 border border-amber-200",
};

const EmployeeTaskPage = () => {
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null);

  const [progressValue, setProgressValue] = useState(0);

  const [driveLink, setDriveLink] = useState("");

  const [remarks, setRemarks] = useState("");

  const [savingProgress, setSavingProgress] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        "/api/task-item-submission/my-items",
      );

      setTasks(response?.data?.data || []);
    } catch (error) {
      notifyError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleOpenTask = (task) => {
    setSelectedTask(task);

    setProgressValue(task.progress || 0);

    setDriveLink(task.submission?.driveLink || "");

    setRemarks(task.submission?.remarks || "");
  };

  const handleSaveProgress = async () => {
    try {
      setSavingProgress(true);

      await API.patch(
        `/api/task-item-submission/${selectedTask.assignmentId}/progress`,
        {
          progress: progressValue,
        },
      );

      notifySuccess("Progress updated");

      loadTasks();
    } catch (error) {
      notifyError("Failed to update progress");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleSubmitTask = async () => {
    try {
      if (!driveLink.trim()) {
        notifyInfo("Drive link is required");
        return;
      }

      setSubmitting(true);

      await API.post(
        `/api/task-item-submission/${selectedTask.assignmentId}/submit`,
        {
          driveLink,
          remarks,
        },
      );

      notifySuccess("Task submitted");

      setSelectedTask(null);

      loadTasks();
    } catch (error) {
      notifyError("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;

    const verified = tasks.filter(
      (task) => task.status === "VERIFIED",
    ).length;

    const pending = tasks.filter(
      (task) =>
        task.status === "PENDING" ||
        task.status === "SUBMITTED",
    ).length;

    const avg =
      total > 0
        ? Math.round(
            tasks.reduce(
              (sum, item) => sum + (item.progress || 0),
              0,
            ) / total,
          )
        : 0;

    return {
      total,
      verified,
      pending,
      avg,
    };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8 py-5 sm:py-7">
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-7">
          <div className="w-full">
            <p className="text-sm text-slate-500 mb-2">
              Employee Dashboard
            </p>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900">
              My Tasks
            </h1>

            <p className="text-sm sm:text-base text-slate-500 mt-3 max-w-2xl leading-6">
              Check assigned work, update progress and submit
              tasks easily.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[28px] p-5 sm:p-6 w-full xl:w-[340px] shrink-0">
            <p className="text-sm text-slate-500 mb-2">
              Overall Progress
            </p>

            <h2 className="text-4xl sm:text-5xl font-semibold text-slate-900">
              {stats.avg}%
            </h2>

            <div className="h-3 bg-slate-100 rounded-full overflow-hidden mt-5">
              <div
                style={{
                  width: `${stats.avg}%`,
                }}
                className="h-full bg-slate-900 rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatsCard
            title="Total Tasks"
            value={stats.total}
          />

          <StatsCard
            title="Pending"
            value={stats.pending}
          />

          <StatsCard
            title="Verified"
            value={stats.verified}
          />

          <StatsCard
            title="Average"
            value={`${stats.avg}%`}
          />
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-[28px] py-24 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[28px] p-10 sm:p-16 text-center">
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">
              No Tasks Available
            </h3>

            <p className="text-sm text-slate-500 mt-3">
              Tasks assigned by manager will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
            {tasks.map((item) => (
              <TaskCard
                key={item.assignmentId}
                item={item}
                onOpen={() => handleOpenTask(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-5xl h-[100vh] sm:h-auto sm:max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col">
            {/* HEADER */}
            <div className="border-b border-slate-100 px-5 sm:px-8 py-5 sm:py-6 flex items-start justify-between shrink-0">
              <div className="pr-4">
                <div
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                    statusStyles[selectedTask.status]
                  }`}
                >
                  {selectedTask.status}
                </div>

                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-tight">
                  {selectedTask.taskItem?.title}
                </h2>

                <p className="text-sm text-slate-500 mt-2 leading-6">
                  {selectedTask.taskItem?.description}
                </p>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-500 transition shrink-0"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 p-5 sm:p-8 overflow-y-auto">
              {/* LEFT */}
              <div className="space-y-5">
                <SimpleCard title="Instructions">
                  <p className="text-sm text-slate-600 leading-7 whitespace-pre-line">
                    {selectedTask.taskItem?.instructions ||
                      "No instructions added"}
                  </p>
                </SimpleCard>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoCard
                    title="Theme"
                    value={
                      selectedTask.taskItem?.theme || "-"
                    }
                  />

                  <InfoCard
                    title="Progress"
                    value={`${progressValue}%`}
                  />

                  <InfoCard
                    title="Manager"
                    value={
                      selectedTask.taskItem?.task?.createdBy
                        ?.name || "-"
                    }
                  />

                  <InfoCard
                    title="Main Task"
                    value={
                      selectedTask.taskItem?.task?.title ||
                      "-"
                    }
                  />
                </div>

                {selectedTask.taskItem?.task
                  ?.referenceLink && (
                  <SimpleCard title="Reference Link">
                    <a
                      href={
                        selectedTask.taskItem.task
                          .referenceLink
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-slate-900 underline break-all"
                    >
                      {
                        selectedTask.taskItem.task
                          .referenceLink
                      }
                    </a>
                  </SimpleCard>
                )}
              </div>

              {/* RIGHT */}
              <div className="space-y-5">
                {/* PROGRESS */}
                <div className="bg-slate-50 border border-slate-200 rounded-[28px] p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">
                        Update Progress
                      </p>

                      <h3 className="text-3xl sm:text-4xl font-semibold text-slate-900 mt-2">
                        {progressValue}%
                      </h3>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressValue}
                    onChange={(e) =>
                      setProgressValue(
                        parseInt(e.target.value),
                      )
                    }
                    className="w-full accent-slate-900"
                  />

                  <button
                    onClick={handleSaveProgress}
                    disabled={savingProgress}
                    className="h-12 w-full rounded-2xl bg-slate-900 text-white text-sm font-medium mt-6 hover:bg-slate-800 transition"
                  >
                    {savingProgress
                      ? "Saving..."
                      : "Save Progress"}
                  </button>
                </div>

                {/* SUBMISSION */}
                {selectedTask.submission ? (
                  <SimpleCard title="Submitted Work">
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs text-slate-400 mb-2">
                          Drive Link
                        </p>

                        <a
                          href={
                            selectedTask.submission
                              .driveLink
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-slate-900 underline break-all"
                        >
                          {
                            selectedTask.submission
                              .driveLink
                          }
                        </a>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 mb-2">
                          Remarks
                        </p>

                        <p className="text-sm text-slate-600 leading-7">
                          {selectedTask.submission
                            .remarks || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 mb-2">
                          Submitted On
                        </p>

                        <p className="text-sm text-slate-600 break-words">
                          {new Date(
                            selectedTask.submission.submittedAt,
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </SimpleCard>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-[28px] p-5 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-6">
                      Submit Work
                    </h3>

                    <div className="space-y-5">
                      <div>
                        <label className="text-sm text-slate-500 block mb-2">
                          Drive Link
                        </label>

                        <input
                          type="text"
                          value={driveLink}
                          onChange={(e) =>
                            setDriveLink(e.target.value)
                          }
                          placeholder="https://drive.google.com/"
                          className="w-full h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-slate-500 block mb-2">
                          Remarks
                        </label>

                        <textarea
                          rows={4}
                          value={remarks}
                          onChange={(e) =>
                            setRemarks(e.target.value)
                          }
                          placeholder="Write remarks..."
                          className="w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none resize-none focus:border-slate-400"
                        />
                      </div>

                      <button
                        onClick={handleSubmitTask}
                        disabled={submitting}
                        className="h-12 w-full rounded-2xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
                      >
                        {submitting
                          ? "Submitting..."
                          : "Submit Task"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* COMPONENTS */

const StatsCard = ({ title, value }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[28px] p-5 sm:p-6">
      <p className="text-sm text-slate-500 mb-3">
        {title}
      </p>

      <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900">
        {value}
      </h3>
    </div>
  );
};

const TaskCard = ({ item, onOpen }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[28px] p-5 sm:p-6 flex flex-col hover:border-slate-300 hover:shadow-sm transition-all duration-300">
      {/* STATUS */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusStyles[item.status]
          }`}
        >
          {item.status}
        </span>

        <span className="text-sm text-slate-500">
          {item.progress || 0}%
        </span>
      </div>

      {/* TITLE */}
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-snug">
        {item.taskItem?.title}
      </h2>

      {/* DESCRIPTION */}
      <p className="text-sm text-slate-500 leading-7 mt-4 line-clamp-3">
        {item.taskItem?.description}
      </p>

      {/* INFO */}
      <div className="space-y-3 mt-6">
        {item.taskItem?.theme && (
          <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">
              Theme
            </span>

            <span className="text-sm font-medium text-slate-900 text-right">
              {item.taskItem.theme}
            </span>
          </div>
        )}

        {item.taskItem?.task?.createdBy?.name && (
          <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">
              Manager
            </span>

            <span className="text-sm font-medium text-slate-900 text-right">
              {item.taskItem.task.createdBy.name}
            </span>
          </div>
        )}
      </div>

      {/* PROGRESS */}
      <div className="mt-6">
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            style={{
              width: `${item.progress || 0}%`,
            }}
            className="h-full bg-slate-900 rounded-full transition-all duration-500"
          />
        </div>
      </div>

      {/* BUTTON */}
      <button
        onClick={onOpen}
        className="h-12 mt-7 rounded-2xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
      >
        Open Task
      </button>
    </div>
  );
};

const SimpleCard = ({ title, children }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[28px] p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-5">
        {title}
      </h3>

      {children}
    </div>
  );
};

const InfoCard = ({ title, value }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[28px] p-5">
      <p className="text-sm text-slate-500 mb-2">
        {title}
      </p>

      <p className="text-sm font-semibold text-slate-900 break-words">
        {value}
      </p>
    </div>
  );
};

export default EmployeeTaskPage;