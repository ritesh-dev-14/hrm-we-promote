import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

import { notifyError, notifyInfo, notifySuccess } from "../../utils/toast";

import {
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  User2,
  Briefcase,
  AlertTriangle,
  CalendarDays,
  Loader2,
  X,
  AlertOctagon,
} from "lucide-react";

const statusStyles = {
  VERIFIED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border border-red-200",
  SUBMITTED: "bg-blue-50 text-blue-700 border border-blue-200",
  ASSIGNED: "bg-slate-100 text-slate-700 border border-slate-200",
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
};

const EmployeeTaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form Fields
  const [progressValue, setProgressValue] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [unableReason, setUnableReason] = useState("");

  // Action States
  const [savingProgress, setSavingProgress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportingIssue, setReportingIssue] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await API.get("/api/task-item-submission/my-items");
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
    setRemarks(task.submission?.remarks || "");
    setUnableReason(task.submission?.unableToSubmitReason || "");
  };

  const handleSaveProgress = async () => {
    try {
      setSavingProgress(true);
      await API.patch(
        `/api/task-item-submission/${selectedTask.assignmentId}/progress`,
        { progress: progressValue },
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
      setSubmitting(true);
      await API.post(
        `/api/task-item-submission/${selectedTask.assignmentId}/submit`,
        { remarks },
      );
      notifySuccess("Task submitted successfully");
      setSelectedTask(null);
      loadTasks();
    } catch (error) {
      notifyError("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnableToSubmit = async () => {
    try {
      if (!unableReason.trim()) {
        notifyInfo("Please provide a reason for tracking");
        return;
      }
      setReportingIssue(true);
      await API.post(
        `/api/task-item-submission/${selectedTask.assignmentId}/unable-to-submit`,
        { reason: unableReason },
      );
      notifySuccess("Issue context logged cleanly");
      setSelectedTask(null);
      loadTasks();
    } catch (error) {
      notifyError("Failed to record structural reason log");
    } finally {
      setReportingIssue(false);
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const verified = tasks.filter((t) => t.status === "VERIFIED").length;
    const rejected = tasks.filter((t) => t.status === "REJECTED").length;
    const pending = tasks.filter(
      (t) =>
        t.status === "PENDING" ||
        t.status === "SUBMITTED" ||
        t.status === "ASSIGNED",
    ).length;

    const avg =
      total > 0
        ? Math.round(
            tasks.reduce((sum, item) => sum + (item.progress || 0), 0) / total,
          )
        : 0;

    return { total, verified, rejected, pending, avg };
  }, [tasks]);

  const formatDate = (date) => {
    if (!date) return "--";
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-slate-400 mb-3">
              Employee Workspace
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              My Assignments
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-3 max-w-2xl leading-7">
              Track task progress, submit work blueprints, and log roadblock
              contexts.
            </p>
          </div>

          {/* OVERALL COMPLETE PROGRESS PROGRESSION */}
          <div className="w-full xl:w-[360px] bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Overall Completion</p>
                <h2 className="text-5xl font-black text-slate-900 mt-2">
                  {stats.avg}%
                </h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-slate-700" />
              </div>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden mt-6">
              <div
                style={{ width: `${stats.avg}%` }}
                className="h-full bg-slate-900 rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Tasks" value={stats.total} icon={FileText} />
          <StatsCard title="Pending" value={stats.pending} icon={Clock3} />
          <StatsCard
            title="Verified"
            value={stats.verified}
            icon={CheckCircle2}
          />
          <StatsCard
            title="Rejected"
            value={stats.rejected}
            icon={AlertTriangle}
          />
        </div>

        {/* LOADING CORE STREAMS */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-[32px] py-28 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-slate-700" />
            <p className="text-sm text-slate-500 mt-4">
              Loading operational node indices...
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[32px] p-14 text-center">
            <h3 className="text-2xl font-bold text-slate-900">
              No Assignments Found
            </h3>
            <p className="text-sm text-slate-500 mt-3">
              Active task units assigned from management will materialize here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
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

      {/* DETAIL DRAWER MODAL EXTENSION */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end lg:items-center justify-center p-0 lg:p-6">
          <div className="bg-[#f8fafc] w-full lg:max-w-7xl h-[100vh] lg:h-[92vh] rounded-t-[32px] lg:rounded-[32px] overflow-hidden flex flex-col">
            {/* MODAL HEADER */}
            <div className="bg-white border-b border-slate-200 px-5 lg:px-8 py-5 flex items-start justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <div
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold mb-4 ${statusStyles[selectedTask.status]}`}
                >
                  {selectedTask.status}
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                  {selectedTask.taskItem?.title}
                </h2>
                <p className="text-sm text-slate-500 mt-3 max-w-3xl leading-7">
                  {selectedTask.taskItem?.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="w-11 h-11 rounded-2xl hover:bg-slate-100 flex items-center justify-center shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL WORKSPACE BODY */}
            <div className="flex-1 overflow-y-auto p-5 lg:p-8">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* INNER WORKSPACE LEFT BLOCK */}
                <div className="xl:col-span-2 space-y-6">
                  {/* DIRECTIVE PROPERTY PROFILE CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoCard
                      title="Manager Node"
                      value={
                        selectedTask.taskItem?.task?.createdBy?.name || "--"
                      }
                      icon={User2}
                    />
                    <InfoCard
                      title="Role Scope"
                      value={
                        selectedTask.taskItem?.task?.createdBy?.role || "--"
                      }
                      icon={Briefcase}
                    />
                    <InfoCard
                      title="Metric Progress"
                      value={`${progressValue}%`}
                      icon={Clock3}
                    />
                    <InfoCard
                      title="Lifecycle Status"
                      value={selectedTask.status}
                      icon={CheckCircle2}
                    />
                  </div>

                  {/* CHRONO TIMELINE LOGS TRACKER */}
                  <SectionCard title="Lifecycle Timeline Metrics">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TimelineCard
                        label="Started At"
                        value={formatDate(selectedTask.startedAt)}
                      />
                      <TimelineCard
                        label="Submitted At"
                        value={formatDate(selectedTask.submittedAt)}
                      />
                      <TimelineCard
                        label="Completed At"
                        value={formatDate(selectedTask.completedAt)}
                      />
                      <TimelineCard
                        label="Verified At"
                        value={formatDate(selectedTask.verifiedAt)}
                      />
                      <TimelineCard
                        label="Rejected At"
                        value={formatDate(selectedTask.rejectedAt)}
                      />
                      <TimelineCard
                        label="Rejection Context"
                        value={selectedTask.rejectionReason || "--"}
                      />
                    </div>
                  </SectionCard>

                  {/* ACTIVE COMPLIANT LOGGED SUBMISSION AREA */}
                  {selectedTask.submission && (
                    <SectionCard title="Submitted Data">
                      <div className="space-y-4">
                        {selectedTask.submission.remarks && (
                          <div>
                            <p className="text-xs font-semibold text-slate-400 mb-2">
                              Remarks
                            </p>
                            <p className="text-sm text-slate-700">
                              {selectedTask.submission.remarks}
                            </p>
                          </div>
                        )}

                        {selectedTask.submission.unableToSubmitReason && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                            <p className="text-xs font-bold text-red-600 mb-1">
                              Unable to Submit Reason
                            </p>
                            <p className="text-sm text-red-700">
                              {selectedTask.submission.unableToSubmitReason}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-slate-500">
                          Verified:{" "}
                          {selectedTask.submission.verifiedByManager
                            ? "Yes"
                            : "No"}
                        </div>
                      </div>
                    </SectionCard>
                  )}
                </div>

                {/* INNER WORKSPACE RIGHT OPERATION BLOCK */}
                <div className="space-y-6">
                  {/* COMPONENT MODULE: DELTA PROGRESS MODIFICATION */}
                  <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-sm text-slate-500">
                          Modify Local Progress
                        </p>
                        <h3 className="text-4xl font-black text-slate-900 mt-2">
                          {progressValue}%
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Clock3 size={20} />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressValue}
                      onChange={(e) =>
                        setProgressValue(parseInt(e.target.value))
                      }
                      className="w-full accent-black"
                    />
                    <button
                      onClick={handleSaveProgress}
                      disabled={savingProgress}
                      className="w-full h-12 rounded-2xl bg-slate-900 text-white text-sm font-semibold mt-6 hover:bg-slate-800 transition disabled:opacity-50"
                    >
                      {savingProgress ? "Syncing..." : "Save Progress Matrix"}
                    </button>
                  </div>

                  {/* ACTIVE DISPATCH CONTEXT FORM TIERS */}
                  {!selectedTask.submission && (
                    <div className="space-y-6">
                      {/* ACTION SUBMODULE A: SUBMIT ROUTE DISPATCH */}
                      <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">
                          Commit Asset Deliverable
                        </h3>
                        <div className="space-y-5">
                          <div>
                            <label className="text-sm text-slate-500 block mb-2">
                              Drive Resource Destination URL
                            </label>
                          </div>
                          <div>
                            <label className="text-sm text-slate-500 block mb-2">
                              Scope Delivery Remarks
                            </label>
                            <textarea
                              rows={3}
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              placeholder="Describe deliverable status components..."
                              className="w-full rounded-2xl border border-slate-200 p-4 text-sm resize-none outline-none focus:border-black"
                            />
                          </div>
                          <button
                            onClick={handleSubmitTask}
                            disabled={submitting}
                            className="w-full h-12 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50"
                          >
                            {submitting
                              ? "Processing Dispatch..."
                              : "Commit Asset Submission"}
                          </button>
                        </div>
                      </div>

                      {/* ACTION SUBMODULE B: ROADBLOCK / EXCEPTION LOG ROUTE */}
                      <div className="bg-white border border-red-100 rounded-[32px] p-6 shadow-sm bg-red-50/20">
                        <h3 className="text-xl font-bold text-red-900 mb-2 flex items-center gap-2">
                          <AlertTriangle size={20} className="text-red-600" />{" "}
                          Log Blocking Roadblock
                        </h3>
                        <p className="text-xs text-slate-400 mb-4 leading-normal">
                          Report systematic failure points or immediate blocks
                          preventing task item lifecycle closing.
                        </p>
                        <div className="space-y-4">
                          <div>
                            <textarea
                              rows={3}
                              value={unableReason}
                              onChange={(e) => setUnableReason(e.target.value)}
                              placeholder="Provide explicit context regarding immediate processing limitations or block justifications..."
                              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm resize-none outline-none focus:border-red-500"
                            />
                          </div>
                          2{" "}
                          <button
                            onClick={handleUnableToSubmit}
                            disabled={reportingIssue}
                            className="w-full h-11 rounded-2xl bg-red-600 text-white text-xs font-bold tracking-wide uppercase hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {reportingIssue
                              ? "Filing Context..."
                              : "Broadcast Roadblock Exception"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* STATIC LAYOUT TILES Components */

const StatsCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[28px] p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-3">{title}</p>
          <h3 className="text-3xl font-black text-slate-900">{value}</h3>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Icon size={20} className="text-slate-700" />
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ item, onOpen }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-6 flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between gap-4 mb-5">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[item.status]}`}
        >
          {item.status}
        </span>
        <span className="text-sm font-semibold text-slate-500">
          {item.progress || 0}%
        </span>
      </div>

      <h2 className="text-2xl font-black text-slate-900 leading-tight truncate">
        {item.taskItem?.title}
      </h2>

      <p className="text-sm text-slate-500 leading-7 mt-4 line-clamp-2 min-h-[56px]">
        {item.taskItem?.description}
      </p>

      <div className="space-y-3 mt-6">
        <MiniInfo
          icon={User2}
          label="Manager Hub"
          value={item.taskItem?.task?.createdBy?.name || "--"}
        />
        <MiniInfo
          icon={Briefcase}
          label="Core Scope Role"
          value={item.taskItem?.task?.createdBy?.role || "--"}
        />
        <MiniInfo
          icon={CalendarDays}
          label="Submission Entry Stamp"
          value={
            item.submittedAt
              ? new Date(item.submittedAt).toLocaleDateString("en-IN")
              : "--"
          }
        />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Node Progress Delta
          </span>
          <span className="text-xs font-semibold text-slate-600">
            {item.progress || 0}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            style={{ width: `${item.progress || 0}%` }}
            className="h-full bg-slate-900 rounded-full transition-all duration-500"
          />
        </div>
      </div>

      <button
        onClick={onOpen}
        className="h-12 mt-7 rounded-2xl bg-slate-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition"
      >
        <Eye size={16} /> Open Workspace
      </button>
    </div>
  );
};

const SectionCard = ({ title, children }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-6">{title}</h3>
      {children}
    </div>
  );
};

const InfoCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[28px] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{title}</p>
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Icon size={18} className="text-slate-700" />
        </div>
      </div>
      <p className="text-sm font-bold text-slate-900 break-words">{value}</p>
    </div>
  );
};

const TimelineCard = ({ label, value }) => {
  return (
    <div className="bg-slate-50 rounded-2xl p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-700 break-words">
        {value}
      </p>
    </div>
  );
};

const MiniInfo = ({ icon: Icon, label, value }) => {
  return (
    <div className="bg-slate-50 rounded-2xl p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0 w-full">
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
          <Icon size={14} className="text-slate-700" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            {label}
          </p>
          <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTaskPage;
