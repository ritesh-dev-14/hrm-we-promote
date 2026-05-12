import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link2,
  ClipboardList,
  Plus,
  Users,
  X,
  Loader2,
} from "lucide-react";

import {
  fetchTaskById,
  createTaskItem,
  assignTaskItem,
  fetchTaskItems,
  fetchMyEmployees,
} from "./taskDetails";

const ManagerTaskDetailPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [task, setTask] = useState(null);

  const [loading, setLoading] = useState(true);

  const [subtasks, setSubtasks] = useState([]);

  const [employees, setEmployees] = useState([]);

  const [creatingSubtask, setCreatingSubtask] = useState(false);

  const [assigning, setAssigning] = useState(false);

  const [selectedSubtask, setSelectedSubtask] = useState(null);

  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const [openAssignModal, setOpenAssignModal] = useState(false);

  const [subtaskForm, setSubtaskForm] = useState({
    title: "",
    description: "",
    instructions: "",
  });

  const statusStyles = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",

    ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",

    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  // LOAD
  const loadPage = async () => {
    try {
      setLoading(true);

      const [taskData, subtaskData, employeeData] = await Promise.all([
        fetchTaskById(id, `/api/manager/tasks/${id}`),

        fetchTaskItems(id),

        fetchMyEmployees(),
      ]);

      setTask(taskData);

      setSubtasks(subtaskData || []);

      setEmployees(employeeData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, [id]);

  // CREATE SUBTASK
  const handleCreateSubtask = async () => {
    try {
      if (!subtaskForm.title) return alert("Title required");

      setCreatingSubtask(true);

      await createTaskItem(task.id, subtaskForm);

      const data = await fetchTaskItems(id);

      setSubtasks(data || []);

      setSubtaskForm({
        title: "",
        description: "",
        instructions: "",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingSubtask(false);
    }
  };

  // OPEN ASSIGN
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

  // ASSIGN
  const handleAssign = async () => {
    try {
      if (!selectedEmployees.length) {
        return alert("Select at least one employee");
      }

      setAssigning(true);

      await assignTaskItem(selectedSubtask.id, selectedEmployees);

      const updated = await fetchTaskItems(id);

      setSubtasks(updated || []);

      setOpenAssignModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setAssigning(false);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={34} />

          <p className="text-sm text-slate-500">Loading task...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-black transition mb-5"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* TASK CARD */}
        <div className="bg-white border border-slate-200 rounded-[30px] p-6 md:p-8 shadow-sm">
          {/* BADGES */}
          <div className="flex flex-wrap gap-3 mb-5">
            <span
              className={`px-4 py-1 rounded-full text-xs font-semibold border ${
                statusStyles[task.status]
              }`}
            >
              {task.status}
            </span>

            <span className="px-4 py-1 rounded-full bg-black text-white text-xs font-semibold">
              {task.setupType}
            </span>
          </div>

          {/* TITLE */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {task.title}
          </h1>

          {/* DESC */}
          <p className="text-slate-600 leading-relaxed mb-8 max-w-3xl">
            {task.description}
          </p>

          {/* INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm">
                <Calendar size={15} />
                Date
              </div>

              <p className="font-semibold text-slate-900">
                {new Date(task.date).toLocaleDateString()}
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm">
                <MapPin size={15} />
                Location
              </div>

              <p className="font-semibold text-slate-900">{task.location}</p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm">
                <Users size={15} />
                Assigned Role
              </div>

              <p className="font-semibold text-slate-900">
                {task.assignedToRole}
              </p>
            </div>
          </div>

          {/* INSTRUCTIONS */}
          {task.instructions && (
            <div className="mt-8">
              <h3 className="font-bold text-lg mb-2">Instructions</h3>

              <p className="text-slate-600 leading-relaxed">
                {task.instructions}
              </p>
            </div>
          )}

          {/* LINK */}
          {task.referenceLink && (
            <a
              href={task.referenceLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-black"
            >
              <Link2 size={15} />
              Open Reference Link
            </a>
          )}
        </div>

        {/* SUBTASKS */}
        <div className="bg-white border border-slate-200 rounded-[30px] p-6 md:p-8 shadow-sm mt-6">
          {/* TOP */}
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Sub Tasks</h2>

              <p className="text-sm text-slate-500 mt-1">
                Manage and assign subtasks
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
              <Plus size={18} />
            </div>
          </div>

          {/* CREATE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              className="input"
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
              className="input"
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
            className="textarea mb-4"
          />

          <button
            onClick={handleCreateSubtask}
            disabled={creatingSubtask}
            className="h-11 px-5 rounded-xl bg-black text-white text-sm font-semibold"
          >
            {creatingSubtask ? "Creating..." : "Create Subtask"}
          </button>

          {/* LIST */}
          <div className="space-y-4 mt-8">
            {subtasks.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-3xl p-5"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {item.description}
                    </p>

                    {item.instructions && (
                      <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                        {item.instructions}
                      </p>
                    )}
                  </div>

                  <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 w-fit">
                    {item.status}
                  </span>
                </div>

                {/* ASSIGNED */}
                {item.assignments?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {item.assignments.map((assignment, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-black text-white text-xs"
                      >
                        {assignment.employeeId}
                      </span>
                    ))}
                  </div>
                )}

                {/* BUTTON */}
                <button
                  onClick={() => handleOpenAssignModal(item)}
                  className="mt-5 h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold"
                >
                  Assign Users
                </button>
              </div>
            ))}

            {!subtasks.length && (
              <div className="border border-dashed border-slate-300 rounded-3xl p-12 text-center">
                <ClipboardList
                  size={36}
                  className="mx-auto text-slate-400 mb-4"
                />

                <h3 className="text-lg font-bold text-slate-900">
                  No Subtasks Yet
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Create your first subtask
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ASSIGN MODAL */}
      {openAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-[28px] shadow-2xl">
            {/* HEADER */}
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
                onClick={() => setOpenAssignModal(false)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* EMPLOYEES */}
            <div className="p-5 max-h-[400px] overflow-y-auto space-y-3">
              {employees.map((employee) => {
                const checked = selectedEmployees.includes(employee.employeeId);

                const alreadyAssigned = selectedSubtask?.assignments?.some(
                  (assignment) => assignment.employeeId === employee.employeeId,
                );

                // HIDE ALREADY ASSIGNED USERS
                if (alreadyAssigned) return null;

                return (
                  <label
                    key={employee.id}
                    className={`flex items-center gap-3 border rounded-2xl p-4 cursor-pointer transition ${
                      checked
                        ? "border-black bg-black text-white"
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

            {/* FOOTER */}
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setOpenAssignModal(false)}
                className="h-11 px-5 rounded-xl border border-slate-200 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleAssign}
                disabled={assigning}
                className="h-11 px-5 rounded-xl bg-black text-white text-sm font-semibold"
              >
                {assigning ? "Assigning..." : "Assign Users"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .input {
          width: 100%;
          height: 48px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 0 16px;
          outline: none;
          font-size: 14px;
          transition: 0.2s;
          background: white;
        }

        .textarea {
          width: 100%;
          min-height: 110px;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          padding: 14px 16px;
          outline: none;
          font-size: 14px;
          resize: none;
          transition: 0.2s;
          background: white;
        }

        .input:focus,
        .textarea:focus {
          border-color: black;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.04);
        }
      `}</style>
    </div>
  );
};

export default ManagerTaskDetailPage;
