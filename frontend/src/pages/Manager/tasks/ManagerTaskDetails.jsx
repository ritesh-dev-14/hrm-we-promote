import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link2,
  ClipboardList,
  Plus,
  Users,
  CheckCircle2,
} from "lucide-react";

import {
  fetchTaskById,
  createTaskItem,
  assignTaskItem,
  fetchTaskItems,
} from "./taskDetails";

const statusStyles = {
  DRAFT:
    "bg-neutral-100 text-neutral-700 border-neutral-200",

  COMPLETED:
    "bg-black text-white border-black",

  IN_PROGRESS:
    "bg-neutral-900 text-white border-neutral-900",

  PENDING:
    "bg-neutral-200 text-neutral-800 border-neutral-300",
};

const ManagerTaskDetailPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [task, setTask] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [subtasks, setSubtasks] =
    useState([]);

  const [creatingSubtask, setCreatingSubtask] =
    useState(false);

  const [employeeInputs, setEmployeeInputs] =
    useState({});

  const [assigningIds, setAssigningIds] =
    useState({});

  const [subtaskForm, setSubtaskForm] =
    useState({
      title: "",
      description: "",
      theme: "",
      instructions: "",
      referenceLink: "",
    });

  // LOAD SUBTASKS
  const loadSubtasks = async () => {
    try {
      const data =
        await fetchTaskItems(id);

      setSubtasks(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // LOAD TASK
  useEffect(() => {
    if (!id) return;

    const loadTask = async () => {
      try {
        setLoading(true);

        const data =
          await fetchTaskById(id);

        setTask(data);

        await loadSubtasks();
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data
            ?.message ||
            "Failed to load task"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

  // CREATE SUBTASK
  const handleCreateSubtask =
    async () => {
      try {
        if (
          !subtaskForm.title ||
          !subtaskForm.description
        ) {
          return alert(
            "Title & description required"
          );
        }

        setCreatingSubtask(true);

        await createTaskItem(
          task.id,
          subtaskForm
        );

        await loadSubtasks();

        setSubtaskForm({
          title: "",
          description: "",
          theme: "",
          instructions: "",
          referenceLink: "",
        });
      } catch (error) {
        console.error(error);

        alert(
          error?.response?.data
            ?.message ||
            "Failed to create subtask"
        );
      } finally {
        setCreatingSubtask(false);
      }
    };

  // ASSIGN USERS
  const handleAssignEmployees =
    async (subtaskId) => {
      try {
        const rawInput =
          employeeInputs[subtaskId] ||
          "";

        const employeeIds =
          rawInput
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);

        if (!employeeIds.length) {
          return alert(
            "Enter employee IDs"
          );
        }

        setAssigningIds((prev) => ({
          ...prev,
          [subtaskId]: true,
        }));

        await assignTaskItem(
          subtaskId,
          employeeIds
        );

        await loadSubtasks();

        setEmployeeInputs((prev) => ({
          ...prev,
          [subtaskId]: "",
        }));

        alert(
          "Employees assigned"
        );
      } catch (error) {
        console.error(error);

        alert(
          error?.response?.data
            ?.message ||
            "Assignment failed"
        );
      } finally {
        setAssigningIds((prev) => ({
          ...prev,
          [subtaskId]: false,
        }));
      }
    };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-neutral-500">
            Loading task...
          </p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-red-500">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // NO TASK
  if (!task) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-neutral-500">
            Task not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-6">

      <div className="max-w-6xl mx-auto">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-black mb-5"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* TASK CARD */}
        <div className="bg-white border border-neutral-200 rounded-4xl p-6 md:p-8 shadow-sm mb-6">

          {/* TAGS */}
          <div className="flex flex-wrap gap-3 mb-5">

            {task.status && (
              <span
                className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                  statusStyles[
                    task.status
                  ]
                }`}
              >
                {task.status.replace(
                  "_",
                  " "
                )}
              </span>
            )}

            {task.setupType && (
              <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                {task.setupType}
              </span>
            )}

          </div>

          {/* TITLE */}
          <h1 className="text-4xl font-bold text-black mb-4">
            {task.title}
          </h1>

          {/* DESCRIPTION */}
          <p className="text-neutral-600 leading-relaxed text-lg mb-8">
            {task.description}
          </p>

          {/* INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

            <div className="border border-neutral-200 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} />

                <p className="text-sm font-medium">
                  Date
                </p>
              </div>

              <p className="text-sm text-neutral-600">
                {task.date
                  ? new Date(
                      task.date
                    ).toDateString()
                  : "N/A"}
              </p>
            </div>

            <div className="border border-neutral-200 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} />

                <p className="text-sm font-medium">
                  Location
                </p>
              </div>

              <p className="text-sm text-neutral-600">
                {task.location ||
                  "N/A"}
              </p>
            </div>

            <div className="border border-neutral-200 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} />

                <p className="text-sm font-medium">
                  Assigned Role
                </p>
              </div>

              <p className="text-sm text-neutral-600">
                {task.assignedToRole}
              </p>
            </div>

          </div>

          {/* INSTRUCTIONS */}
          {task.instructions && (
            <div className="mb-8">
              <h2 className="font-bold text-xl mb-3">
                Instructions
              </h2>

              <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-5">
                <p className="text-neutral-700 leading-relaxed">
                  {task.instructions}
                </p>
              </div>
            </div>
          )}

          {/* LINK */}
          {task.referenceLink && (
            <a
              href={task.referenceLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-black hover:underline"
            >
              <Link2 size={16} />
              Open Reference Link
            </a>
          )}

        </div>

        {/* SUBTASKS */}
        <div className="bg-white border border-neutral-200 rounded-4xl p-6 md:p-8 shadow-sm">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">

            <div>
              <h2 className="text-3xl font-bold text-black">
                Sub Tasks
              </h2>

              <p className="text-sm text-neutral-500 mt-1">
                Create and assign subtasks
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
              <Plus size={20} />
            </div>

          </div>

          {/* FORM */}
          <div className="space-y-4 mb-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                type="text"
                placeholder="Subtask title"
                value={
                  subtaskForm.title
                }
                onChange={(e) =>
                  setSubtaskForm({
                    ...subtaskForm,
                    title:
                      e.target.value,
                  })
                }
                className="h-12 rounded-2xl border border-neutral-200 px-4 outline-none focus:border-black"
              />

              <input
                type="text"
                placeholder="Theme"
                value={
                  subtaskForm.theme
                }
                onChange={(e) =>
                  setSubtaskForm({
                    ...subtaskForm,
                    theme:
                      e.target.value,
                  })
                }
                className="h-12 rounded-2xl border border-neutral-200 px-4 outline-none focus:border-black"
              />

            </div>

            <textarea
              placeholder="Description"
              value={
                subtaskForm.description
              }
              onChange={(e) =>
                setSubtaskForm({
                  ...subtaskForm,
                  description:
                    e.target.value,
                })
              }
              className="w-full min-h-30 rounded-3xl border border-neutral-200 p-4 outline-none focus:border-black"
            />

            <textarea
              placeholder="Instructions"
              value={
                subtaskForm.instructions
              }
              onChange={(e) =>
                setSubtaskForm({
                  ...subtaskForm,
                  instructions:
                    e.target.value,
                })
              }
              className="w-full min-h-30 rounded-3xl border border-neutral-200 p-4 outline-none focus:border-black"
            />

            <input
              type="text"
              placeholder="Reference link"
              value={
                subtaskForm.referenceLink
              }
              onChange={(e) =>
                setSubtaskForm({
                  ...subtaskForm,
                  referenceLink:
                    e.target.value,
                })
              }
              className="h-12 rounded-2xl border border-neutral-200 px-4 outline-none focus:border-black w-full"
            />

            <button
              onClick={
                handleCreateSubtask
              }
              disabled={
                creatingSubtask
              }
              className="h-12 px-6 rounded-2xl bg-black text-white font-semibold hover:opacity-90 transition"
            >
              {creatingSubtask
                ? "Creating..."
                : "Create Sub Task"}
            </button>

          </div>

          {/* LIST */}
          <div className="space-y-5">

            {subtasks.map((item) => (
              <div
                key={item.id}
                className="border border-neutral-200 rounded-[28px] p-5"
              >

                {/* TOP */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">

                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">
                      {item.title}
                    </h3>

                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold w-fit">
                    {item.status}
                  </span>

                </div>

                {/* ASSIGNMENTS */}
                <div className="flex items-center gap-2 mb-4">

                  <CheckCircle2
                    size={16}
                    className="text-neutral-400"
                  />

                  <p className="text-sm text-neutral-500">
                    Assigned Employees:
                    {" "}
                    <span className="font-semibold text-black">
                      {item
                        .assignments
                        ?.length || 0}
                    </span>
                  </p>

                </div>

                {/* ASSIGN INPUT */}
                <div className="flex flex-col lg:flex-row gap-3">

                  <input
                    type="text"
                    placeholder="EMP-001, EMP-002"
                    value={
                      employeeInputs[
                        item.id
                      ] || ""
                    }
                    onChange={(e) =>
                      setEmployeeInputs(
                        (prev) => ({
                          ...prev,
                          [item.id]:
                            e.target
                              .value,
                        })
                      )
                    }
                    className="flex-1 h-12 rounded-2xl border border-neutral-200 px-4 outline-none focus:border-black"
                  />

                  <button
                    onClick={() =>
                      handleAssignEmployees(
                        item.id
                      )
                    }
                    disabled={
                      assigningIds[
                        item.id
                      ]
                    }
                    className="h-12 px-6 rounded-2xl bg-black text-white font-semibold hover:opacity-90 transition"
                  >
                    {assigningIds[
                      item.id
                    ]
                      ? "Assigning..."
                      : "Assign Users"}
                  </button>

                </div>

              </div>
            ))}

            {!subtasks.length && (
              <div className="border border-dashed border-neutral-300 rounded-[28px] p-10 text-center">

                <ClipboardList
                  size={40}
                  className="mx-auto text-neutral-300 mb-4"
                />

                <h3 className="text-lg font-bold text-black mb-2">
                  No Sub Tasks
                </h3>

                <p className="text-sm text-neutral-500">
                  Create your first sub task
                </p>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default ManagerTaskDetailPage;