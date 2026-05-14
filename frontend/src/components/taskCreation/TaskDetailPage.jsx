import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

import { notifySuccess, notifyError, notifyInfo } from "../../utils/toast";

import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link2,
  UserPlus,
  X,
  Check,
  Search,
} from "lucide-react";

const TaskDetailPage = ({ initialData = null, apiEndpoint = null }) => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [task, setTask] = useState(initialData || null);

  const [loading, setLoading] = useState(!initialData);

  const [error, setError] = useState(null);

  const [assignModal, setAssignModal] = useState(false);

  const [employees, setEmployees] = useState([]);

  const [managers, setManagers] = useState([]);

  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const [assignLoading, setAssignLoading] = useState(false);

  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const role = (user?.role || user?.data?.role || "").trim().toUpperCase();

  const isHrOrAdmin = role === "HR" || role === "ADMIN";

  const headers = {
    Authorization: `Bearer ${token}`,
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

        const endpoint = `/api/manager/tasks/${id}`;

        const res = await API.get(endpoint, {
          headers,
        });

        setTask(res.data?.data);
      } catch (err) {
        console.error(err);

        const message = err?.response?.data?.message || "Failed to load task";

        setError(message);

        notifyError(message);
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

  // LOAD USERS
  const loadAssignableUsers = async () => {
    try {
      notifyInfo("Loading users...");

      const [mgrRes] = await Promise.all([
        // API.get("http://localhost:8000/api/hr/employees", {
        //   headers,
        // }),

        API.get("http://localhost:8000/api/hr/managers", {
          headers,
        }),
      ]);

      // setEmployees(empRes.data?.data || []);

      setManagers(mgrRes.data?.data || []);
    } catch (err) {
      console.error(err);

      notifyError("Failed to load users");
    }
  };

  // OPEN MODAL
  const openAssignModal = async () => {
    setAssignModal(true);

    await loadAssignableUsers();
  };

  // ASSIGN SELF
  const assignSelf = () => {
    if (!user?.employeeId) {
      notifyError("Employee ID not found");
      return;
    }

    const alreadySelected = selectedEmployees.includes(user.employeeId);

    if (alreadySelected) {
      notifyInfo("Already selected");
      return;
    }

    setSelectedEmployees((prev) => [...prev, user.employeeId]);

    notifySuccess("Added successfully");
  };

  // TOGGLE USER
  const toggleEmployee = (employeeId) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      }

      return [...prev, employeeId];
    });
  };

  // ASSIGN TASK
  const handleAssign = async () => {
    try {
      if (selectedEmployees.length === 0) {
        notifyError("Select at least one employee");
        return;
      }

      setAssignLoading(true);

      notifyInfo("Assigning task...");

      const payload = {
        assignments: selectedEmployees.map((employeeId) => ({
          employeeId,
        })),
      };

      await API.post(
        `http://localhost:8000/api/manager/tasks/${task?.id}/assign`,
        payload,
        { headers },
      );

      notifySuccess("Task assigned successfully");

      setAssignModal(false);

      setSelectedEmployees([]);
    } catch (err) {
      console.error(err);

      notifyError(err?.response?.data?.message || "Assignment failed");
    } finally {
      setAssignLoading(false);
    }
  };

  // USERS FILTER
  const allUsers = useMemo(() => {
    const combined = [...managers, ...employees];

    return combined.filter(
      (person) =>
        person?.name?.toLowerCase().includes(search.toLowerCase()) ||
        person?.email?.toLowerCase().includes(search.toLowerCase()) ||
        person?.employeeId?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [employees, managers, search]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-10 w-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm mb-5 text-gray-700"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* CARD */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {/* TOP */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            <div>
              <p className="text-sm text-gray-500 mb-2">{task?.status}</p>

              <h1 className="text-3xl font-bold text-gray-900">
                {task?.title}
              </h1>

              <p className="text-gray-600 mt-3 leading-7">
                {task?.description}
              </p>
            </div>

            {isHrOrAdmin && (
              <button
                onClick={openAssignModal}
                className="h-11 px-5 rounded-lg bg-black text-white flex items-center gap-2 text-sm"
              >
                <UserPlus size={18} />
                Assign
              </button>
            )}
          </div>

          {/* DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="border rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Calendar size={16} />
                Due Date
              </div>

              <p className="font-medium">
                {task?.date ? new Date(task.date).toLocaleDateString() : "N/A"}
              </p>
            </div>

            <div className="border rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <MapPin size={16} />
                Location
              </div>

              <p className="font-medium">{task?.location || "N/A"}</p>
            </div>

            <div className="border rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Calendar size={16} />
                Created
              </div>

              <p className="font-medium">
                {task?.createdAt
                  ? new Date(task.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* INSTRUCTIONS */}
          {task?.instructions && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-3">Instructions</h2>

              <div className="border rounded-xl p-4 text-gray-700 leading-7">
                {task.instructions}
              </div>
            </div>
          )}

          {/* LINK */}
          {task?.referenceLink && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-3">Reference Link</h2>

              <a
                href={task.referenceLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-blue-600 break-all"
              >
                <Link2 size={16} />
                {task.referenceLink}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ASSIGN MODAL */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-3xl rounded-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-xl font-semibold">Assign Task</h2>

                <p className="text-sm text-gray-500">
                  Select employees or managers
                </p>
              </div>

              <button
                onClick={() => setAssignModal(false)}
                className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* SEARCH */}
            <div className="p-5 border-b">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search user..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 border rounded-lg pl-10 pr-4 outline-none"
                />
              </div>

              <button
                onClick={assignSelf}
                className="mt-4 bg-black text-white px-4 h-10 rounded-lg text-sm"
              >
                Assign To Myself
              </button>
            </div>

            {/* USERS */}
            <div className="p-5 max-h-[400px] overflow-y-auto space-y-3">
              {allUsers.map((person) => {
                const selected = selectedEmployees.includes(person.employeeId);

                return (
                  <div
                    key={person.id}
                    onClick={() => toggleEmployee(person.employeeId)}
                    className={`border rounded-xl p-4 cursor-pointer transition ${
                      selected ? "border-black bg-gray-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{person.name}</h3>

                        <p className="text-sm text-gray-500">{person.email}</p>

                        <p className="text-xs text-gray-400 mt-1">
                          {person.role} • {person.employeeId}
                        </p>
                      </div>

                      {selected && (
                        <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FOOTER */}
            <div className="p-5 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Selected : {selectedEmployees.length}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setAssignModal(false)}
                  className="h-10 px-4 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAssign}
                  disabled={assignLoading}
                  className="h-10 px-5 bg-black text-white rounded-lg disabled:opacity-50"
                >
                  {assignLoading ? "Assigning..." : "Assign Task"}
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
