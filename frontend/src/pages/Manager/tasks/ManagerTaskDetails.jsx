import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link2,
  Users,
  Plus,
  X,
  Loader2,
  ClipboardList,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  ExternalLink,
  UserPlus,
  XCircle,
} from "lucide-react";

import API from "../../../services/api";

import {
  fetchTaskById,
  createTaskItem,
  assignTaskItem,
  fetchTaskItems,
  fetchMyEmployees,
  assignMainTaskToMe,
} from "./taskDetails";

import {
  notifySuccess,
  notifyError,
  notifyInfo,
} from "../../../utils/toast";

const statusStyles = {
  DRAFT: "bg-slate-100 text-slate-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-orange-100 text-orange-700",
  SUBMITTED: "bg-violet-100 text-violet-700",
  VERIFIED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const ManagerTaskDetailPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [task, setTask] = useState(null);

  const [subtasks, setSubtasks] = useState([]);

  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);

  const [creatingSubtask, setCreatingSubtask] = useState(false);

  const [assigning, setAssigning] = useState(false);

  const [assigningToMe, setAssigningToMe] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [openAssignModal, setOpenAssignModal] = useState(false);

  const [selectedSubtask, setSelectedSubtask] = useState(null);

  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const [rejectModal, setRejectModal] = useState({
    open: false,
    submissionId: null,
    reason: "",
  });

  const [subtaskForm, setSubtaskForm] = useState({
    title: "",
    description: "",
    instructions: "",
  });

  const loadPage = async () => {
    try {
      setLoading(true);

      const [taskData, subtaskData, employeeData] = await Promise.all([
        fetchTaskById(id),
        fetchTaskItems(id),
        fetchMyEmployees(),
      ]);

      setTask(taskData);

      setSubtasks(subtaskData || []);

      setEmployees(employeeData || []);
    } catch (error) {
      console.error(error);

      notifyError("Failed to load task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, [id]);

  // ASSIGN MAIN TASK TO MANAGER
  const handleAssignToMe = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?.employeeId) {
        notifyError("Manager ID not found");
        return;
      }

      setAssigningToMe(true);

      notifyInfo("Assigning task to you...");

      const response = await assignMainTaskToMe(
        task.id,
        user.employeeId,
      );

      notifySuccess(
        response?.data?.message || "Task assigned successfully",
      );

      loadPage();
    } catch (error) {
      console.error(error);

      notifyError(
        error?.response?.data?.message ||
          "Failed to assign task",
      );
    } finally {
      setAssigningToMe(false);
    }
  };

  // CREATE SUBTASK
  const handleCreateSubtask = async () => {
    try {
      if (!subtaskForm.title.trim()) {
        notifyError("Title is required");
        return;
      }

      setCreatingSubtask(true);

      notifyInfo("Creating subtask...");

      await createTaskItem(task.id, subtaskForm);

      const updated = await fetchTaskItems(id);

      setSubtasks(updated || []);

      setSubtaskForm({
        title: "",
        description: "",
        instructions: "",
      });

      notifySuccess("Subtask created");
    } catch (error) {
      console.error(error);

      notifyError(
        error?.response?.data?.message ||
          "Failed to create subtask",
      );
    } finally {
      setCreatingSubtask(false);
    }
  };

  // OPEN ASSIGN MODAL
  const handleOpenAssignModal = (subtask) => {
    setSelectedSubtask(subtask);

    setSelectedEmployees([]);

    setOpenAssignModal(true);
  };

  // TOGGLE EMPLOYEE
  const toggleEmployee = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((item) => item !== employeeId)
        : [...prev, employeeId],
    );
  };

  // ASSIGN EMPLOYEE
  const handleAssign = async () => {
    try {
      if (!selectedEmployees.length) {
        notifyError("Select employees");
        return;
      }

      setAssigning(true);

      notifyInfo("Assigning employees...");

      await assignTaskItem(
        selectedSubtask.id,
        selectedEmployees,
      );

      const updated = await fetchTaskItems(id);

      setSubtasks(updated || []);

      setOpenAssignModal(false);

      notifySuccess("Employees assigned");
    } catch (error) {
      console.error(error);

      notifyError(
        error?.response?.data?.message ||
          "Assignment failed",
      );
    } finally {
      setAssigning(false);
    }
  };

  // APPROVE SUBMISSION
  const handleApproveSubmission = async (submissionId) => {
    try {
      setActionLoadingId(submissionId);

      notifyInfo("Approving submission...");

      await API.patch(
        `/api/task-item-submission/${submissionId}/verify`,
      );

      notifySuccess("Submission approved successfully");

      loadPage();
    } catch (error) {
      console.error(error);

      notifyError(
        error?.response?.data?.message ||
          "Approval failed",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // OPEN REJECT MODAL
  const openRejectModal = (submissionId) => {
    setRejectModal({
      open: true,
      submissionId,
      reason: "",
    });
  };

  // REJECT SUBMISSION
  const handleRejectSubmission = async () => {
    try {
      if (!rejectModal.reason.trim()) {
        notifyError("Rejection reason is required");
        return;
      }

      setActionLoadingId(rejectModal.submissionId);

      notifyInfo("Rejecting submission...");

      await API.patch(
        `/api/task-item-submission/${rejectModal.submissionId}/reject`,
        {
          rejectionReason: rejectModal.reason,
        },
      );

      notifySuccess("Submission rejected");

      setRejectModal({
        open: false,
        submissionId: null,
        reason: "",
      });

      loadPage();
    } catch (error) {
      console.error(error);

      notifyError(
        error?.response?.data?.message ||
          "Rejection failed",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-slate-700"
            size={36}
          />

          <p className="text-sm text-slate-500">
            Loading task...
          </p>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const user = JSON.parse(localStorage.getItem("user"));

  const alreadyAssigned = task?.assignments?.some(
    (assignment) =>
      assignment?.employeeId === user?.employeeId,
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-black transition mb-5"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* MAIN TASK */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm">
          <div className="flex flex-wrap gap-3 mb-5">
            <span
              className={`px-4 py-1 rounded-full text-xs font-bold ${
                statusStyles[task.status]
              }`}
            >
              {task.status}
            </span>

            <span className="px-4 py-1 rounded-full bg-black text-white text-xs font-bold">
              {task.setupType}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900">
            {task.title}
          </h1>

          <p className="text-slate-600 mt-5 leading-8 max-w-4xl">
            {task.description}
          </p>

          <button
            onClick={handleAssignToMe}
            disabled={assigningToMe || alreadyAssigned}
            className={`h-11 px-5 rounded-2xl text-sm font-bold mt-5 transition flex items-center gap-2 ${
              alreadyAssigned
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-black text-white hover:opacity-90"
            }`}
          >
            <UserPlus size={16} />

            {alreadyAssigned
              ? "Already Assigned"
              : assigningToMe
                ? "Assigning..."
                : "Assign To Me"}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Calendar size={16} />
                Due Date
              </div>

              <p className="font-bold text-slate-900">
                {new Date(task.date).toLocaleDateString()}
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <MapPin size={16} />
                Location
              </div>

              <p className="font-bold text-slate-900">
                {task.location}
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Users size={16} />
                Assigned Role
              </div>

              <p className="font-bold text-slate-900">
                {task.assignedToRole}
              </p>
            </div>
          </div>

          {task.instructions && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                Instructions
              </h2>

              <div className="border border-slate-200 rounded-2xl p-5 text-slate-700 leading-8">
                {task.instructions}
              </div>
            </div>
          )}

          {task.referenceLink && (
            <a
              href={task.referenceLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-blue-600"
            >
              <Link2 size={16} />
              Open Reference Link
            </a>
          )}
        </div>

        {/* SUBTASKS */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm mt-6">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                Sub Tasks
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Create and manage subtasks
              </p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
              <Plus size={18} />
            </div>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Subtask title"
              value={subtaskForm.title}
              onChange={(e) =>
                setSubtaskForm({
                  ...subtaskForm,
                  title: e.target.value,
                })
              }
              className="h-12 border border-slate-200 rounded-2xl px-4 outline-none focus:border-black"
            />

            <input
              type="text"
              placeholder="Description"
              value={subtaskForm.description}
              onChange={(e) =>
                setSubtaskForm({
                  ...subtaskForm,
                  description: e.target.value,
                })
              }
              className="h-12 border border-slate-200 rounded-2xl px-4 outline-none focus:border-black"
            />
          </div>

          <textarea
            placeholder="Instructions"
            value={subtaskForm.instructions}
            onChange={(e) =>
              setSubtaskForm({
                ...subtaskForm,
                instructions: e.target.value,
              })
            }
            className="w-full min-h-32 border border-slate-200 rounded-2xl p-4 outline-none mt-4 resize-none focus:border-black"
          />

          <button
            onClick={handleCreateSubtask}
            disabled={creatingSubtask}
            className="h-11 px-5 rounded-2xl bg-black text-white text-sm font-bold mt-4"
          >
            {creatingSubtask
              ? "Creating..."
              : "Create Subtask"}
          </button>

          {/* SUBTASKS */}
          <div className="space-y-6 mt-10">
            {subtasks.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-[30px] p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h3 className="text-2xl font-black text-slate-900">
                        {item.title}
                      </h3>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          statusStyles[item.status]
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-slate-600 leading-7">
                      {item.description}
                    </p>

                    {item.instructions && (
                      <div className="mt-5 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                        <p className="text-sm font-semibold text-slate-900 mb-2">
                          Instructions
                        </p>

                        <p className="text-sm text-slate-700 leading-7 whitespace-pre-line">
                          {item.instructions}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      handleOpenAssignModal(item)
                    }
                    className="h-11 px-5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold transition"
                  >
                    Assign Employees
                  </button>
                </div>

                {/* ASSIGNMENTS */}
                {item.assignments?.length > 0 && (
                  <div className="mt-8 space-y-5">
                    <h4 className="text-lg font-bold text-slate-900">
                      Assigned Employees
                    </h4>

                    {item.assignments.map((assignment) => {
                      const submission =
                        assignment?.submission;

                      return (
                        <div
                          key={assignment.id}
                          className="border border-slate-200 rounded-[26px] p-5 bg-slate-50"
                        >
                          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                            <div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <h5 className="text-lg font-bold text-slate-900">
                                  {
                                    assignment?.employee
                                      ?.name
                                  }
                                </h5>

                                <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-semibold">
                                  {
                                    assignment?.employee
                                      ?.employeeId
                                  }
                                </span>

                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    statusStyles[
                                      assignment?.status
                                    ]
                                  }`}
                                >
                                  {assignment?.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                                <Clock3 size={15} />

                                Assigned on{" "}
                                {new Date(
                                  assignment.createdAt,
                                ).toLocaleDateString()}
                              </div>
                            </div>

                            {/* ACTIONS */}
                            {assignment?.status ===
                              "SUBMITTED" &&
                              submission &&
                              !submission?.verifiedByManager &&
                              !submission?.rejectionReason && (
                                <div className="flex items-center gap-3 flex-wrap">
                                  <button
                                    onClick={() =>
                                      handleApproveSubmission(
                                        submission.id,
                                      )
                                    }
                                    disabled={
                                      actionLoadingId ===
                                      submission.id
                                    }
                                    className="h-11 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition flex items-center gap-2"
                                  >
                                    <ShieldCheck size={16} />

                                    {actionLoadingId ===
                                    submission.id
                                      ? "Processing..."
                                      : "Approve"}
                                  </button>

                                  <button
                                    onClick={() =>
                                      openRejectModal(
                                        submission.id,
                                      )
                                    }
                                    disabled={
                                      actionLoadingId ===
                                      submission.id
                                    }
                                    className="h-11 px-5 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition flex items-center gap-2"
                                  >
                                    <XCircle size={16} />
                                    Reject
                                  </button>
                                </div>
                              )}

                            {/* VERIFIED */}
                            {submission?.verifiedByManager && (
                              <div className="h-11 px-5 rounded-2xl bg-emerald-100 text-emerald-700 text-sm font-bold flex items-center gap-2">
                                <CheckCircle2 size={16} />
                                Verified
                              </div>
                            )}

                            {/* REJECTED */}
                            {submission?.rejectionReason && (
                              <div className="h-11 px-5 rounded-2xl bg-red-100 text-red-700 text-sm font-bold flex items-center gap-2 border border-red-200">
                                <XCircle size={16} />
                                Rejected
                              </div>
                            )}
                          </div>

                          {/* SUBMISSION */}
                          {submission ? (
                            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
                              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
                                  Drive Link
                                </p>

                                <a
                                  href={
                                    submission.driveLink
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-600 font-semibold break-all"
                                >
                                  <ExternalLink size={16} />

                                  {
                                    submission.driveLink
                                  }
                                </a>
                              </div>

                              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
                                  Submitted At
                                </p>

                                <p className="font-bold text-slate-900">
                                  {new Date(
                                    submission.submittedAt,
                                  ).toLocaleString()}
                                </p>
                              </div>

                              <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:col-span-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
                                  Employee Remarks
                                </p>

                                <p className="text-slate-700 leading-7">
                                  {submission.remarks ||
                                    "No remarks"}
                                </p>
                              </div>

                              {submission?.rejectionReason && (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 lg:col-span-2">
                                  <p className="text-xs font-semibold text-red-500 uppercase mb-3">
                                    Rejection Reason
                                  </p>

                                  <p className="text-red-700 leading-7">
                                    {
                                      submission.rejectionReason
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="mt-6 border border-dashed border-slate-300 rounded-2xl p-6 bg-white">
                              <p className="text-sm font-semibold text-slate-700">
                                Task not submitted yet
                              </p>

                              <p className="text-xs text-slate-500 mt-1">
                                Waiting for employee
                                submission
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!item.assignments?.length && (
                  <div className="mt-5 border border-dashed border-slate-300 rounded-2xl p-5 text-sm text-slate-500">
                    No employees assigned yet
                  </div>
                )}
              </div>
            ))}

            {!subtasks.length && (
              <div className="border border-dashed border-slate-300 rounded-[30px] p-14 text-center">
                <ClipboardList
                  size={40}
                  className="mx-auto text-slate-400 mb-4"
                />

                <h3 className="text-xl font-bold text-slate-900">
                  No Subtasks Yet
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                  Create your first subtask
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ASSIGN MODAL */}
      {openAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Assign Employees
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Select employees for this subtask
                </p>
              </div>

              <button
                onClick={() =>
                  setOpenAssignModal(false)
                }
                className="h-10 w-10 rounded-xl hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 max-h-[420px] overflow-y-auto space-y-3">
              {employees.map((employee) => {
                const checked =
                  selectedEmployees.includes(
                    employee.employeeId,
                  );

                const alreadyAssigned =
                  selectedSubtask?.assignments?.some(
                    (assignment) =>
                      assignment.employeeId ===
                      employee.employeeId,
                  );

                if (alreadyAssigned) return null;

                return (
                  <label
                    key={employee.id}
                    className={`flex items-center gap-4 border rounded-2xl p-4 cursor-pointer transition ${
                      checked
                        ? "bg-black text-white border-black"
                        : "border-slate-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleEmployee(
                          employee.employeeId,
                        )
                      }
                    />

                    <div>
                      <p className="font-semibold text-sm">
                        {employee.name}
                      </p>

                      <p className="text-xs opacity-70 mt-1">
                        {employee.employeeId}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() =>
                  setOpenAssignModal(false)
                }
                className="h-11 px-5 rounded-2xl border border-slate-200 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleAssign}
                disabled={assigning}
                className="h-11 px-5 rounded-2xl bg-black text-white text-sm font-bold"
              >
                {assigning
                  ? "Assigning..."
                  : "Assign Users"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Reject Submission
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Provide rejection reason
                </p>
              </div>

              <button
                onClick={() =>
                  setRejectModal({
                    open: false,
                    submissionId: null,
                    reason: "",
                  })
                }
                className="h-10 w-10 rounded-xl hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <textarea
                placeholder="Write rejection reason..."
                value={rejectModal.reason}
                onChange={(e) =>
                  setRejectModal((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                className="w-full min-h-32 border border-slate-200 rounded-2xl p-4 outline-none resize-none focus:border-red-500"
              />
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() =>
                  setRejectModal({
                    open: false,
                    submissionId: null,
                    reason: "",
                  })
                }
                className="h-11 px-5 rounded-2xl border border-slate-200 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleRejectSubmission}
                disabled={
                  actionLoadingId ===
                  rejectModal.submissionId
                }
                className="h-11 px-5 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold"
              >
                {actionLoadingId ===
                rejectModal.submissionId
                  ? "Rejecting..."
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