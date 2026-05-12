import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link2,
  ClipboardList,
  UserPlus,
  X,
  Check,
  Users,
  Search,
} from "lucide-react";

const TaskDetailPage = ({
  initialData = null,
  apiEndpoint = null,
}) => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [task, setTask] =
    useState(initialData || null);

  const [loading, setLoading] =
    useState(!initialData);

  const [error, setError] =
    useState(null);

  const [assignModal, setAssignModal] =
    useState(false);

  const [employees, setEmployees] =
    useState([]);

  const [managers, setManagers] =
    useState([]);

  const [selectedEmployees, setSelectedEmployees] =
    useState([]);

  const [assignLoading, setAssignLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const token =
    localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}",
  );

  const role = (
    user?.role ||
    user?.data?.role ||
    user?.user?.role ||
    ""
  )
    .trim()
    .toUpperCase();

  const isHrOrAdmin =
    role === "HR" ||
    role === "ADMIN";

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const statusStyles = {
    DRAFT:
      "bg-amber-50 text-amber-700 border-amber-200",

    COMPLETED:
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    IN_PROGRESS:
      "bg-blue-50 text-blue-700 border-blue-200",

    PENDING:
      "bg-orange-50 text-orange-700 border-orange-200",

    ASSIGNED:
      "bg-violet-50 text-violet-700 border-violet-200",
  };

  // LOAD TASK
  useEffect(() => {
    if (initialData) {
      setTask(initialData);

      setLoading(false);

      return;
    }

    const loadTask = async () => {
      try {
        setLoading(true);

        const endpoint =
          apiEndpoint ||
          `/api/manager/tasks/${id}`;

        const res = await API.get(
          `http://localhost:8000${endpoint}`,
          { headers },
        );

        setTask(res.data?.data);
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data
            ?.message ||
            "Failed to load task",
        );
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

  // LOAD USERS
  const loadAssignableUsers =
    async () => {
      try {
        if (!isHrOrAdmin)
          return;

        const [
          empRes,
          mgrRes,
        ] = await Promise.all([
          API.get(
            "http://localhost:8000/api/hr/employees",
            { headers },
          ),

          API.get(
            "http://localhost:8000/api/hr/managers",
            { headers },
          ),
        ]);

        setEmployees(
          empRes.data?.data || [],
        );

        setManagers(
          mgrRes.data?.data || [],
        );
      } catch (err) {
        console.error(err);
      }
    };

  // OPEN MODAL
  const openAssignModal =
    async () => {
      setAssignModal(true);

      await loadAssignableUsers();
    };

  // ASSIGN SELF
  const assignSelf = () => {
    if (!user?.employeeId)
      return;

    const alreadySelected =
      selectedEmployees.includes(
        user.employeeId,
      );

    if (alreadySelected)
      return;

    setSelectedEmployees(
      (prev) => [
        ...prev,
        user.employeeId,
      ],
    );
  };

  // TOGGLE USER
  const toggleEmployee = (
    employeeId,
  ) => {
    setSelectedEmployees(
      (prev) => {
        if (
          prev.includes(
            employeeId,
          )
        ) {
          return prev.filter(
            (id) =>
              id !== employeeId,
          );
        }

        return [
          ...prev,
          employeeId,
        ];
      },
    );
  };

  // ASSIGN TASK
  const handleAssign =
    async () => {
      try {
        if (
          selectedEmployees.length ===
          0
        ) {
          return alert(
            "Select at least one user",
          );
        }

        setAssignLoading(true);

        const payload = {
          assignments:
            selectedEmployees.map(
              (
                employeeId,
              ) => ({
                employeeId,
              }),
            ),
        };

        await API.post(
          `http://localhost:8000/api/task-items/${task?.id}/assign`,
          payload,
          { headers },
        );

        alert(
          "Task assigned successfully",
        );

        setAssignModal(false);

        setSelectedEmployees(
          [],
        );
      } catch (err) {
        console.error(err);

        alert(
          err?.response?.data
            ?.message ||
            "Assignment failed",
        );
      } finally {
        setAssignLoading(false);
      }
    };

  // USERS
  const allUsers =
    useMemo(() => {
      const combined = [
        ...managers,
        ...employees,
      ];

      return combined.filter(
        (person) =>
          person?.name
            ?.toLowerCase()
            .includes(
              search.toLowerCase(),
            ) ||
          person?.email
            ?.toLowerCase()
            .includes(
              search.toLowerCase(),
            ) ||
          person?.employeeId
            ?.toLowerCase()
            .includes(
              search.toLowerCase(),
            ),
      );
    }, [
      employees,
      managers,
      search,
    ]);

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-6">
          {error}
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* BACK */}
        <button
          onClick={() =>
            navigate(-1)
          }
          className="flex items-center gap-2 mb-6 text-slate-700 hover:text-black font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* MAIN CARD */}
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
          {/* TOP */}
          <div className="p-8 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                {/* BADGES */}
                <div className="flex flex-wrap gap-3 mb-5">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                      statusStyles[
                        task?.status
                      ] ||
                      "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {task?.status}
                  </span>

                  {task?.setupType && (
                    <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                      {
                        task.setupType
                      }
                    </span>
                  )}
                </div>

                {/* TITLE */}
                <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
                  {task?.title}
                </h1>

                {/* DESC */}
                <p className="text-slate-600 text-lg leading-relaxed max-w-4xl">
                  {
                    task?.description
                  }
                </p>
              </div>

              {/* ACTION */}
              {isHrOrAdmin && (
                <button
                  onClick={
                    openAssignModal
                  }
                  className="h-14 px-6 rounded-2xl bg-black text-white font-semibold flex items-center gap-3 hover:scale-[1.02] transition"
                >
                  <UserPlus size={20} />
                  Assign Work
                </button>
              )}
            </div>
          </div>

          {/* DETAILS */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {/* DATE */}
              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-3">
                  <Calendar size={18} />

                  <span className="text-sm font-medium">
                    Due Date
                  </span>
                </div>

                <p className="font-bold text-slate-900">
                  {task?.date
                    ? new Date(
                        task.date,
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              {/* LOCATION */}
              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-3">
                  <MapPin size={18} />

                  <span className="text-sm font-medium">
                    Location
                  </span>
                </div>

                <p className="font-bold text-slate-900 break-all">
                  {task?.location ||
                    "N/A"}
                </p>
              </div>

              {/* CREATED */}
              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-3">
                  <ClipboardList
                    size={18}
                  />

                  <span className="text-sm font-medium">
                    Created
                  </span>
                </div>

                <p className="font-bold text-slate-900">
                  {task?.createdAt
                    ? new Date(
                        task.createdAt,
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              {/* TYPE */}
              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-3">
                  <Users size={18} />

                  <span className="text-sm font-medium">
                    Task Type
                  </span>
                </div>

                <p className="font-bold text-slate-900">
                  {task?.isGroupTask
                    ? "Group"
                    : "Single"}
                </p>
              </div>
            </div>

            {/* INSTRUCTIONS */}
            {task?.instructions && (
              <div className="mt-10">
                <h2 className="text-2xl font-black text-slate-900 mb-4">
                  Instructions
                </h2>

                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <p className="text-slate-700 leading-8">
                    {
                      task.instructions
                    }
                  </p>
                </div>
              </div>
            )}

            {/* REFERENCE */}
            {task?.referenceLink && (
              <div className="mt-10">
                <h2 className="text-2xl font-black text-slate-900 mb-4">
                  Reference Link
                </h2>

                <a
                  href={
                    task.referenceLink
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-indigo-600 font-semibold hover:underline break-all"
                >
                  <Link2 size={18} />

                  {
                    task.referenceLink
                  }
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {assignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Assign Task
                </h2>

                <p className="text-slate-500 mt-1">
                  Assign task to
                  employees or
                  managers
                </p>
              </div>

              <button
                onClick={() =>
                  setAssignModal(
                    false,
                  )
                }
                className="h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* SEARCH */}
            <div className="p-6 border-b border-slate-100">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value,
                    )
                  }
                  className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={assignSelf}
                className="mt-4 w-full h-14 rounded-2xl bg-black text-white font-semibold hover:opacity-90 transition"
              >
                Assign To Myself
              </button>
            </div>

            {/* USERS */}
            <div className="p-6 max-h-[450px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allUsers.map(
                  (person) => {
                    const selected =
                      selectedEmployees.includes(
                        person.employeeId,
                      );

                    return (
                      <div
                        key={
                          person.id
                        }
                        onClick={() =>
                          toggleEmployee(
                            person.employeeId,
                          )
                        }
                        className={`rounded-3xl border p-5 cursor-pointer transition-all ${
                          selected
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-black text-slate-900 text-lg">
                              {
                                person.name
                              }
                            </h3>

                            <p className="text-slate-500 text-sm mt-1">
                              {
                                person.email
                              }
                            </p>

                            <div className="flex flex-wrap gap-2 mt-4">
                              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                                {
                                  person.role
                                }
                              </span>

                              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                                {
                                  person.employeeId
                                }
                              </span>
                            </div>
                          </div>

                          {selected && (
                            <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                              <Check
                                size={18}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Selected:{" "}
                <span className="font-bold text-slate-900">
                  {
                    selectedEmployees.length
                  }
                </span>
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setAssignModal(
                      false,
                    )
                  }
                  className="h-12 px-6 rounded-2xl border border-slate-200 font-semibold"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleAssign
                  }
                  disabled={
                    assignLoading
                  }
                  className="h-12 px-7 rounded-2xl bg-black text-white font-semibold disabled:opacity-50"
                >
                  {assignLoading
                    ? "Assigning..."
                    : "Assign Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailPage;