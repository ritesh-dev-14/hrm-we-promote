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
  CheckCircle2,
  Clock3,
  ShieldCheck,
  ExternalLink,
  UserPlus,
  XCircle,
  FileText,
  BarChart3,
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

const ManagerTaskDetailPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [task, setTask] = useState(null);

  const [subtasks, setSubtasks] = useState([]);

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
    assignmentId: null,
    reason: "",
  });

  const [subtaskForm, setSubtaskForm] = useState({
    title: "",
    description: "",
    theme: "",
    instructions: "",
    referenceLink: "",
    order: "",
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

  // ASSIGN MAIN TASK
  const handleAssignToMe = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?.employeeId) {
        notifyError("Manager ID not found");
        return;
      }

      setAssigningToMe(true);

      notifyInfo("Assigning task to you...");

      const response = await assignMainTaskToMe(task.id, user.employeeId);

      notifySuccess(response?.data?.message || "Task assigned successfully");

      loadPage();
    } catch (error) {
      console.error(error);

      notifyError(error?.response?.data?.message || "Failed to assign task");
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
        theme: "",
        instructions: "",
        referenceLink: "",
        order: "",
      });

      notifySuccess("Subtask created");
    } catch (error) {
      console.error(error);

      notifyError(error?.response?.data?.message || "Failed to create subtask");
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

  // ASSIGN EMPLOYEES
  const handleAssign = async () => {
    try {
      if (!selectedEmployees.length) {
        notifyError("Select employees");
        return;
      }

      setAssigning(true);

      notifyInfo("Assigning employees...");

      await assignTaskItem(selectedSubtask.id, selectedEmployees);

      const updated = await fetchTaskItems(id);

      setSubtasks(updated || []);

      setOpenAssignModal(false);

      notifySuccess("Employees assigned");
    } catch (error) {
      console.error(error);

      notifyError(error?.response?.data?.message || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  // VERIFY
  const handleApproveSubmission = async (assignmentId) => {
    try {
      setActionLoadingId(assignmentId);

      notifyInfo("Approving submission...");

      await API.patch(`/api/task-item-submission/${assignmentId}/verify`, {
        status: "VERIFIED",
      });

      notifySuccess("Submission approved successfully");

      loadPage();
    } catch (error) {
      console.error(error);

      notifyError(error?.response?.data?.message || "Approval failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  // OPEN REJECT MODAL
  const openRejectModal = (assignmentId) => {
    setRejectModal({
      open: true,
      assignmentId,
      reason: "",
    });
  };

  // REJECT
  const handleRejectSubmission = async () => {
    try {
      if (!rejectModal.reason.trim()) {
        notifyError("Rejection reason is required");
        return;
      }

      setActionLoadingId(rejectModal.assignmentId);

      notifyInfo("Rejecting submission...");

      await API.patch(
        `/api/task-item-submission/${rejectModal.assignmentId}/reject`,
        {
          rejectionReason: rejectModal.reason,
        },
      );

      notifySuccess("Submission rejected");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-slate-700"
            size={36}
          />

          <p className="text-sm text-slate-500">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const user = JSON.parse(localStorage.getItem("user"));

  const alreadyAssigned = task?.assignments?.some(
    (assignment) => assignment?.employeeId === user?.employeeId,
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-black transition mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* MAIN TASK */}
        <div className="bg-white rounded-[34px] border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              className={`px-4 py-1.5 rounded-full border text-xs font-bold ${
                statusStyles[task.status]
              }`}
            >
              {task.status}
            </span>

            <span className="px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold">
              {task.setupType}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            {task.title}
          </h1>

          <p className="text-slate-600 mt-5 leading-8 max-w-4xl">
            {task.description}
          </p>

          <button
            onClick={handleAssignToMe}
            disabled={assigningToMe || alreadyAssigned}
            className={`h-11 px-5 rounded-2xl mt-6 text-sm font-bold flex items-center gap-2 transition ${
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
            <div className="border border-slate-200 rounded-3xl p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Calendar size={16} />
                Due Date
              </div>

              <p className="font-bold text-slate-900">
                {new Date(task.date).toLocaleDateString()}
              </p>
            </div>

            <div className="border border-slate-200 rounded-3xl p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <MapPin size={16} />
                Location
              </div>

              <p className="font-bold text-slate-900">{task.location}</p>
            </div>

            <div className="border border-slate-200 rounded-3xl p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Users size={16} />
                Assigned Role
              </div>

              <p className="font-bold text-slate-900">{task.assignedToRole}</p>
            </div>
          </div>

          {task.instructions && (
            <div className="mt-8">
              <h3 className="text-xl font-black text-slate-900 mb-3">
                Instructions
              </h3>

              <div className="border border-slate-200 rounded-3xl p-5 leading-8 text-slate-700 bg-slate-50">
                {task.instructions}
              </div>
            </div>
          )}

          {task.referenceLink && (
            <a
              href={task.referenceLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-blue-600 font-bold"
            >
              <Link2 size={16} />
              Open Reference Link
            </a>
          )}
        </div>

        {/* SUBTASKS */}
        <div className="bg-white rounded-[34px] border border-slate-200 shadow-sm p-6 md:p-8 mt-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900">Sub Tasks</h2>

              <p className="text-sm text-slate-500 mt-1">
                Manage subtasks & employee submissions
              </p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
              <Plus size={18} />
            </div>
          </div>

          {/* CREATE FORM */}
          <div className="bg-slate-50 border border-slate-200 rounded-[28px] p-4 md:p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TITLE */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Title
                </label>

                <input
                  type="text"
                  placeholder="Enter task title"
                  value={subtaskForm.title}
                  onChange={(e) =>
                    setSubtaskForm({
                      ...subtaskForm,
                      title: e.target.value,
                    })
                  }
                  className="w-full h-12 bg-white border border-slate-200 rounded-2xl px-4 outline-none focus:border-black text-sm"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Description
                </label>

                <input
                  type="text"
                  placeholder="Enter description"
                  value={subtaskForm.description}
                  onChange={(e) =>
                    setSubtaskForm({
                      ...subtaskForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full h-12 bg-white border border-slate-200 rounded-2xl px-4 outline-none focus:border-black text-sm"
                />
              </div>

              {/* THEME */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Theme
                </label>

                <input
                  type="text"
                  placeholder="Golden / Premium / etc"
                  value={subtaskForm.theme}
                  onChange={(e) =>
                    setSubtaskForm({
                      ...subtaskForm,
                      theme: e.target.value,
                    })
                  }
                  className="w-full h-12 bg-white border border-slate-200 rounded-2xl px-4 outline-none focus:border-black text-sm"
                />
              </div>

              {/* ORDER */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Order
                </label>

                <input
                  type="number"
                  placeholder="1"
                  value={subtaskForm.order}
                  onChange={(e) =>
                    setSubtaskForm({
                      ...subtaskForm,
                      order: e.target.value,
                    })
                  }
                  className="w-full h-12 bg-white border border-slate-200 rounded-2xl px-4 outline-none focus:border-black text-sm"
                />
              </div>
            </div>

            {/* REFERENCE LINK */}
            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Reference Link
              </label>

              <input
                type="text"
                placeholder="https://drive.google.com/test"
                value={subtaskForm.referenceLink}
                onChange={(e) =>
                  setSubtaskForm({
                    ...subtaskForm,
                    referenceLink: e.target.value,
                  })
                }
                className="w-full h-12 bg-white border border-slate-200 rounded-2xl px-4 outline-none focus:border-black text-sm"
              />
            </div>

            {/* INSTRUCTIONS */}
            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Instructions
              </label>

              <textarea
                placeholder="Write instructions..."
                value={subtaskForm.instructions}
                onChange={(e) =>
                  setSubtaskForm({
                    ...subtaskForm,
                    instructions: e.target.value,
                  })
                }
                className="w-full min-h-[120px] bg-white border border-slate-200 rounded-2xl p-4 outline-none resize-none focus:border-black text-sm"
              />
            </div>

            {/* BUTTON */}
            <button
              onClick={handleCreateSubtask}
              disabled={creatingSubtask}
              className="h-12 px-6 rounded-2xl bg-black text-white text-sm font-semibold mt-5 w-full md:w-auto"
            >
              {creatingSubtask ? "Creating..." : "Create Subtask"}
            </button>
          </div>

          {/* SUBTASK LIST */}
          <div className="space-y-7 mt-10">
            {subtasks.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-[30px] overflow-hidden"
              >
                {/* TOP */}
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-3 mb-4">
                        <h3 className="text-2xl font-black text-slate-900">
                          {item.title}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-bold ${
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
                        <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700">
                            <FileText size={16} />
                            Instructions
                          </div>

                          <p className="text-slate-600 leading-7 text-sm">
                            {item.instructions}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleOpenAssignModal(item)}
                        className="h-11 px-5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold transition"
                      >
                        Assign Employees
                      </button>

                      <div className="bg-white border border-slate-200 rounded-2xl p-4 min-w-[220px]">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                          <BarChart3 size={16} />
                          Task Stats
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Progress</span>

                            <span className="font-bold">
                              {item.progress || 0}%
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-500">Employees</span>

                            <span className="font-bold">
                              {item.totalEmployees || 0}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-500">Completed</span>

                            <span className="font-bold">
                              {item.completedAssignments || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EMPLOYEES */}
                <div className="p-6 bg-white">
                  {item.employees?.length > 0 ? (
                    <div className="space-y-5">
                      <h4 className="text-lg font-black text-slate-900">
                        Assigned Employees
                      </h4>

                      {item.employees.map((emp) => {
                        const isSubmitted = emp.status === "SUBMITTED";

                        const isVerified = emp.status === "VERIFIED";

                        const isRejected = emp.status === "REJECTED";

                        return (
                          <div
                            key={emp.assignmentId}
                            className="border border-slate-200 rounded-[28px] p-5 bg-slate-50"
                          >
                            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                              {/* LEFT */}
                              <div className="flex-1">
                                <div className="flex items-center flex-wrap gap-3">
                                  <h5 className="text-lg font-black text-slate-900">
                                    {emp.employee?.name}
                                  </h5>

                                  <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-bold">
                                    {emp.employee?.employeeId}
                                  </span>

                                  <span
                                    className={`px-3 py-1 rounded-full border text-xs font-bold ${
                                      statusStyles[emp.status]
                                    }`}
                                  >
                                    {emp.status}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                                    <p className="text-xs text-slate-500 font-semibold uppercase">
                                      Progress
                                    </p>

                                    <p className="text-lg font-black text-slate-900 mt-1">
                                      {emp.progress || 0}%
                                    </p>
                                  </div>

                                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                                    <p className="text-xs text-slate-500 font-semibold uppercase">
                                      Started At
                                    </p>

                                    <p className="text-sm font-semibold text-slate-900 mt-1">
                                      {emp.startedAt
                                        ? new Date(
                                            emp.startedAt,
                                          ).toLocaleString()
                                        : "-"}
                                    </p>
                                  </div>

                                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                                    <p className="text-xs text-slate-500 font-semibold uppercase">
                                      Submitted At
                                    </p>

                                    <p className="text-sm font-semibold text-slate-900 mt-1">
                                      {emp.submittedAt
                                        ? new Date(
                                            emp.submittedAt,
                                          ).toLocaleString()
                                        : "Not submitted"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* RIGHT */}
                              <div className="flex flex-col gap-3">
                                {isSubmitted && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleApproveSubmission(
                                          emp.assignmentId,
                                        )
                                      }
                                      disabled={
                                        actionLoadingId === emp.assignmentId
                                      }
                                      className="h-11 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                      <ShieldCheck size={16} />

                                      {actionLoadingId === emp.assignmentId
                                        ? "Processing..."
                                        : "Verify"}
                                    </button>

                                    <button
                                      onClick={() =>
                                        openRejectModal(emp.assignmentId)
                                      }
                                      disabled={
                                        actionLoadingId === emp.assignmentId
                                      }
                                      className="h-11 px-5 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                      <XCircle size={16} />
                                      Reject
                                    </button>
                                  </>
                                )}

                                {isVerified && (
                                  <div className="h-11 px-5 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm font-bold flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16} />
                                    Verified
                                  </div>
                                )}

                                {isRejected && (
                                  <div className="h-11 px-5 rounded-2xl bg-red-100 border border-red-200 text-red-700 text-sm font-bold flex items-center justify-center gap-2">
                                    <XCircle size={16} />
                                    Rejected
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* SUBMISSION DETAILS */}
                            {emp.submission && (
                              <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                                <h4 className="font-bold text-slate-900 text-sm">
                                  Submission Details
                                </h4>

                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                                    Drive Link
                                  </p>

                                  <a
                                    href={emp.submission.driveLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 text-sm font-semibold break-all"
                                  >
                                    {emp.submission.driveLink}
                                  </a>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                                    Remarks
                                  </p>

                                  <p className="text-sm text-slate-700">
                                    {emp.submission.remarks || "-"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                                    Submitted On
                                  </p>

                                  <p className="text-sm text-slate-700">
                                    {new Date(
                                      emp.submission.submittedAt,
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* COMPLETED */}
                            {emp.completedAt && (
                              <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                                <Clock3 size={15} />
                                Completed on{" "}
                                {new Date(emp.completedAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-300 rounded-3xl p-8 text-center">
                      <Users
                        size={32}
                        className="mx-auto text-slate-400 mb-3"
                      />

                      <h4 className="font-bold text-slate-900">
                        No Employees Assigned
                      </h4>

                      <p className="text-sm text-slate-500 mt-1">
                        Assign employees to start this subtask
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ASSIGN MODAL */}
      {openAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[34px] shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Assign Employees
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Select employees for this subtask
                </p>
              </div>

              <button
                onClick={() => setOpenAssignModal(false)}
                className="h-10 w-10 rounded-xl hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 max-h-[420px] overflow-y-auto space-y-3">
              {employees.map((employee) => {
                const checked = selectedEmployees.includes(employee.employeeId);

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
                      onChange={() => toggleEmployee(employee.employeeId)}
                    />

                    <div>
                      <p className="font-semibold text-sm">{employee.name}</p>

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
                onClick={() => setOpenAssignModal(false)}
                className="h-11 px-5 rounded-2xl border border-slate-200 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleAssign}
                disabled={assigning}
                className="h-11 px-5 rounded-2xl bg-black text-white text-sm font-bold"
              >
                {assigning ? "Assigning..." : "Assign Users"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[34px] shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
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
                    assignmentId: null,
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
                    assignmentId: null,
                    reason: "",
                  })
                }
                className="h-11 px-5 rounded-2xl border border-slate-200 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleRejectSubmission}
                disabled={actionLoadingId === rejectModal.assignmentId}
                className="h-11 px-5 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold"
              >
                {actionLoadingId === rejectModal.assignmentId
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
