import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Calendar,
  Users,
  X,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  UserPlus,
  XCircle,
  AlertCircle,
} from "lucide-react";

import API from "../../../services/api";

import { fetchTaskById, assignMainTaskToMe } from "./taskDetails";

import { notifySuccess, notifyError, notifyInfo } from "../../../utils/toast";

const statusStyles = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDING: "bg-orange-100 text-orange-700 border-orange-200",
  SUBMITTED: "bg-violet-100 text-violet-700 border-violet-200",
  VERIFIED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

const priorityStyles = {
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HIGH: "bg-rose-50 text-rose-700 border-rose-200",
};

const ManagerTaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingSubtask, setCreatingSubtask] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [assigningToMe, setAssigningToMe] = useState(false);

  const [rejectModal, setRejectModal] = useState({
    open: false,
    subtaskId: null,
    reason: "",
  });

  const [subtaskForm, setSubtaskForm] = useState({
    title: "",
    description: "",
    employeeId: "",
    dueDate: "",
    priority: "MEDIUM",
    status: "DRAFT",
  });

  const loadPage = async () => {
    try {
      setLoading(true);

      const [taskData, employeeRes] = await Promise.all([
        fetchTaskById(id),
        API.get("/api/manager/my-employees"),
      ]);

      setTask(taskData);

      if (employeeRes?.data?.success) {
        setEmployees(employeeRes.data.data || []);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error(error);
      notifyError("Failed to synchronize component state tree data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, [id]);

  const handleAssignToMe = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.employeeId) {
        notifyError("Manager profile metadata block missing");
        return;
      }

      setAssigningToMe(true);
      notifyInfo("Linking tracking instances...");

      const response = await assignMainTaskToMe(task.id, storedUser.employeeId);
      notifySuccess(response?.data?.message || "Assigned successfully");
      loadPage();
    } catch (error) {
      console.error(error);
      notifyError(error?.response?.data?.message || "Failed to self-assign");
    } finally {
      setAssigningToMe(false);
    }
  };

  const handleCreateSubtask = async () => {
    try {
      if (!subtaskForm.title.trim()) {
        notifyError("Subtask title is required");
        return;
      }
      if (!subtaskForm.employeeId) {
        notifyError("An engineer must be assigned");
        return;
      }
      if (!subtaskForm.dueDate) {
        notifyError("Due date parameter must be specified");
        return;
      }

      setCreatingSubtask(true);
      notifyInfo("Injecting subtask entity matrix...");

      await API.post(`/api/task-items/${task.id}`, {
        title: subtaskForm.title,
        employeeId: subtaskForm.employeeId,
        dueDate: new Date(subtaskForm.dueDate).toISOString(),
        priority: subtaskForm.priority,
        description: subtaskForm.description,
        status: subtaskForm.status,
      });

      await loadPage();

      setSubtaskForm({
        title: "",
        description: "",
        employeeId: "",
        dueDate: "",
        priority: "MEDIUM",
        status: "DRAFT",
      });

      notifySuccess("Subtask committed successfully");
    } catch (error) {
      console.error(error);
      notifyError(
        error?.response?.data?.message || "Subtask generation rejected",
      );
    } finally {
      setCreatingSubtask(false);
    }
  };

  const handleOpenAssignModal = (subtask) => {
    setSelectedSubtask(subtask);
    setSelectedEmployees([]);
    setOpenAssignModal(true);
  };

  const toggleEmployee = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((item) => item !== employeeId)
        : [...prev, employeeId],
    );
  };

  const handleAssign = async () => {
    try {
      if (!selectedEmployees.length) {
        notifyError("Please pick at least one engineer");
        return;
      }

      setAssigning(true);
      notifyInfo("Re-syncing allocation nodes...");

      await API.patch(`/api/task-items/assign/${selectedSubtask.id}`, {
        employeeIds: selectedEmployees,
      });

      await loadPage();
      setOpenAssignModal(false);
      notifySuccess("Team allocation bindings updated");
    } catch (error) {
      console.error(error);
      notifyError(
        error?.response?.data?.message || "Assignment link layer failure",
      );
    } finally {
      setAssigning(false);
    }
  };

  // VERIFY SUBMISSION
// ONLY CHANGED FUNCTIONS RELATED TO VERIFY + REJECT APIs

// VERIFY SUBMISSION (UPDATED - CLEAN)
const handleApproveSubmission = async (assignmentId) => {
  try {
    setActionLoadingId(assignmentId);
    notifyInfo("Verifying submission...");

    // UPDATED API CALL (no unnecessary payload)
    await API.patch(`/api/task-item-submission/${assignmentId}/verify`);

    notifySuccess("Submission verified successfully");
    loadPage();
  } catch (error) {
    console.error(error);
    notifyError(error?.response?.data?.message || "Verification failed");
  } finally {
    setActionLoadingId(null);
  }
};


// OPEN REJECT MODAL (UNCHANGED)
const openRejectModal = (assignmentId) => {
  setRejectModal({
    open: true,
    assignmentId,
    reason: "",
  });
};


// REJECT SUBMISSION (UPDATED STRICTLY AS PER API CONTRACT)
const handleRejectSubmission = async () => {
  try {
    if (!rejectModal.reason.trim()) {
      notifyError("Rejection reason is required");
      return;
    }

    setActionLoadingId(rejectModal.assignmentId);
    notifyInfo("Rejecting submission...");

    // UPDATED API CALL
    await API.patch(
      `/api/task-item-submission/${rejectModal.assignmentId}/reject`,
      {
        rejectionReason: rejectModal.reason,
      }
    );

    notifySuccess("Submission rejected successfully");

    setRejectModal({
      open: false,
      assignmentId: null,
      reason: "",
    });

    loadPage();
  } catch (error) {
    console.error(error);
    notifyError(error?.response?.data?.message || "Rejection failed");
  } finally {
    setActionLoadingId(null);
  }
};

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-slate-800"
            size={36}
          />
          <p className="text-sm text-slate-500 font-medium">
            Parsing contextual data trees...
          </p>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const user = JSON.parse(localStorage.getItem("user"));
  const alreadyAssigned = task?.assignments?.some(
    (assignment) => assignment?.employee?.employeeId === user?.employeeId,
  );

  const targetSubtasks = task.items || [];

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6 text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* BACK NAV */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-black transition mb-6 outline-none"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* CORE PARENT TASK BLOCK */}
        <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-sm p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              className={`px-4 py-1.5 rounded-full border text-xs font-bold tracking-wide uppercase ${statusStyles[task.status] || statusStyles.DRAFT}`}
            >
              {task.status}
            </span>
            <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
              Progress: {task.progress || 0}%
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {task.projectName}
          </h1>

          <p className="text-slate-600 mt-4 text-sm md:text-base leading-relaxed max-w-4xl">
            {task.description}
          </p>

          <button
            onClick={handleAssignToMe}
            disabled={assigningToMe || alreadyAssigned}
            className={`h-11 px-5 rounded-xl mt-6 text-sm font-bold flex items-center gap-2 transition-all active:scale-[0.98] ${
              alreadyAssigned
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/5"
            }`}
          >
            <UserPlus size={16} />
            {alreadyAssigned
              ? "Already assigned"
              : assigningToMe
                ? "Linking Account..."
                : "Claim Assignment"}
          </button>
        </div>

        {/* SUBTASKS CONTAINER */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 md:p-8 mt-6">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Project Component Tree
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Manage transactional workflows & review pull milestones
            </p>
          </div>

          {/* APPEND SUBTASK BLOCK */}
          <div className="bg-slate-50 border border-slate-200 rounded-[24px] p-5 md:p-6">
            <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black block" />
              Append Subtask Node
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5 ml-0.5">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Subtask identifier name"
                  value={subtaskForm.title}
                  onChange={(e) =>
                    setSubtaskForm({ ...subtaskForm, title: e.target.value })
                  }
                  className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 outline-none focus:border-black focus:ring-4 focus:ring-black/5 text-sm transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5 ml-0.5">
                  Assign Engineer Pool *
                </label>
                <select
                  value={subtaskForm.employeeId}
                  onChange={(e) =>
                    setSubtaskForm({
                      ...subtaskForm,
                      employeeId: e.target.value,
                    })
                  }
                  className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 outline-none focus:border-black focus:ring-4 focus:ring-black/5 text-sm transition-all appearance-none"
                >
                  <option value="">Select Resource Asset</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.employeeId}>
                      {emp.name} ({emp.position || "Developer"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5 ml-0.5">
                  Due Date Parameters *
                </label>
                <input
                  type="date"
                  value={subtaskForm.dueDate}
                  onChange={(e) =>
                    setSubtaskForm({ ...subtaskForm, dueDate: e.target.value })
                  }
                  className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 outline-none focus:border-black focus:ring-4 focus:ring-black/5 text-sm transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5 ml-0.5">
                  Priority Flag
                </label>
                <select
                  value={subtaskForm.priority}
                  onChange={(e) =>
                    setSubtaskForm({ ...subtaskForm, priority: e.target.value })
                  }
                  className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 outline-none focus:border-black focus:ring-4 focus:ring-black/5 text-sm transition-all"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-slate-600 block mb-1.5 ml-0.5">
                Scope Description Summary
              </label>
              <textarea
                placeholder="Outline clear operational goals for the engineer to review..."
                value={subtaskForm.description}
                onChange={(e) =>
                  setSubtaskForm({
                    ...subtaskForm,
                    description: e.target.value,
                  })
                }
                className="w-full min-h-[80px] bg-white border border-slate-200 rounded-xl p-4 outline-none resize-none focus:border-black focus:ring-4 focus:ring-black/5 text-sm transition-all"
              />
            </div>

            <button
              onClick={handleCreateSubtask}
              disabled={creatingSubtask}
              className="h-11 px-6 rounded-xl bg-black text-white text-xs font-bold mt-5 w-full md:w-auto hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-md shadow-black/5"
            >
              {creatingSubtask
                ? "Injecting Subtask Structure..."
                : "Commit Subtask Target"}
            </button>
          </div>

          {/* SIMPLIFIED SUBTASK LOOPS ITERATION */}
          <div className="space-y-4 mt-8">
            {targetSubtasks.map((item) => {
              const isSubmitted = item.status === "SUBMITTED";
              const isVerified = item.status === "VERIFIED";
              const isRejected = item.status === "REJECTED";

              return (
                <div
                  key={item.id}
                  className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusStyles[item.status] || statusStyles.DRAFT}`}
                      >
                        {item.status}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${priorityStyles[item.priority] || priorityStyles.LOW}`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400 pt-0.5">
                      <span>
                        Due:{" "}
                        <strong className="text-slate-600">
                          {formatDateTime(item.dueDate)}
                        </strong>
                      </span>
                      {item.assignedTo && (
                        <span>
                          Owner:{" "}
                          <strong className="text-slate-600">
                            {item.assignedTo}
                          </strong>
                        </span>
                      )}
                    </div>

                    {/* REJECTION REASON CONTEXT SUMMARY BANNER */}
                    {isRejected && item.rejectionReason && (
                      <div className="mt-2 bg-red-50/60 border border-red-100 rounded-lg p-2.5 text-xs text-red-700 flex items-start gap-1.5">
                        <AlertCircle
                          size={14}
                          className="mt-0.5 text-red-500 shrink-0"
                        />
                        <div>
                          <span className="font-bold uppercase tracking-wider text-[9px] block text-red-500">
                            Rejection Feedback:
                          </span>
                          {item.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SIMPLIFIED MANAGER CONTROL LAYER MODULES */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {isSubmitted && (
                      <>
                        <button
                          onClick={() => handleApproveSubmission(item.id)}
                          disabled={actionLoadingId === item.id}
                          className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <ShieldCheck size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(item.id)}
                          disabled={actionLoadingId === item.id}
                          className="h-9 px-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </>
                    )}

                    {isVerified && (
                      <span className="h-8 px-3 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={13} /> Verified
                      </span>
                    )}

                    {!isSubmitted && !isVerified && (
                      <button
                        onClick={() => handleOpenAssignModal(item)}
                        className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-all shadow-sm"
                      >
                        Assign Resource
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {targetSubtasks.length === 0 && (
              <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/30">
                <Users size={20} className="mx-auto text-slate-300 mb-2" />
                <h4 className="font-bold text-slate-700 text-xs">
                  No Active Components Added
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Use the block interface above to populate operational
                  milestones.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RESOURCE ASSIGNMENT LAYER MODAL */}
      {openAssignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[80vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Allocate Resource Layer
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Link engineering tokens to task nodes
                </p>
              </div>
              <button
                onClick={() => setOpenAssignModal(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-2">
              {employees.map((employee) => {
                const checked = selectedEmployees.includes(employee.employeeId);
                return (
                  <label
                    key={employee.id}
                    className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-all ${checked ? "bg-black text-white border-black" : "border-slate-200 hover:bg-slate-50"}`}
                  >
                    <input
                      type="checkbox"
                      className="accent-black"
                      checked={checked}
                      onChange={() => toggleEmployee(employee.employeeId)}
                    />
                    <div className="text-xs">
                      <p className="font-bold">{employee.name}</p>
                      <p
                        className={`mt-0.5 font-mono ${checked ? "text-slate-300" : "text-slate-400"}`}
                      >
                        {employee.employeeId} •{" "}
                        {employee.position || "Developer"}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setOpenAssignModal(false)}
                className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={assigning}
                className="h-9 px-4 rounded-lg bg-black text-white text-xs font-bold shadow-sm disabled:opacity-50"
              >
                {assigning ? "Linking Threads..." : "Commit Bindings"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOUNCE LOG DIALOG MODAL REASON INPUT */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Flag Pipeline Defect
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Specify why this task submission configuration fails criteria
              </p>
            </div>

            <div className="p-5">
              <textarea
                placeholder="E.g., Video quality poor, incomplete functional testing..."
                value={rejectModal.reason}
                onChange={(e) =>
                  setRejectModal((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                className="w-full min-h-[90px] border border-slate-200 rounded-xl p-3 outline-none resize-none text-xs focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
              />
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() =>
                  setRejectModal({ open: false, subtaskId: null, reason: "" })
                }
                className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmission}
                disabled={actionLoadingId === rejectModal.subtaskId}
                className="h-9 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {actionLoadingId === rejectModal.subtaskId
                  ? "Bouncing Thread..."
                  : "Reject Submission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTaskDetailPage;
