import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Edit3,
  Trash2,
  Plus,
  ShieldCheck,
  ShieldPlus,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import HrAddEmployee from "./HrAddEmployee";
import HrAddManager from "./HrAddManager";
import API from "../../services/api";

export default function HrTeamPage() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [employeeModal, setEmployeeModal] = useState({
    isOpen: false,
    mode: "add",
    data: null,
  });
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);

  // ---------------- FETCH DATA ----------------
  const fetchTeamData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [empRes, mgrRes] = await Promise.all([
        API.get("/api/hr/employees"),
        API.get("/api/hr/managers"),
      ]);

      setEmployees(empRes.data?.data || []);
      setManagers(mgrRes.data?.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch team data:", err);
      setError("Failed to load team directory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleSave = useCallback(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  // ---------------- COMBINE DATA (MEMOIZED) ----------------
  const allStaff = useMemo(() => {
    const mgr = managers.map((m) => ({ ...m, role: "MANAGER" }));
    return [...mgr, ...employees];
  }, [managers, employees]);

  // ---------------- SEARCH FILTER ----------------
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return allStaff;

    return allStaff.filter((person) => {
      return (
        (person.name || "").toLowerCase().includes(term) ||
        (person.department || "").toLowerCase().includes(term) ||
        (person.role || "").toLowerCase().includes(term)
      );
    });
  }, [search, allStaff]);

  // ---------------- HANDLERS ----------------
  const handleCardClick = useCallback(
    (person) => {
      // navigate(`/hr/team/${id}`);
      navigate(`/hr/team/${person.employeeId || person.id}`);
    },
    [navigate],
  );

  const handleEdit = useCallback((e, person) => {
    e.stopPropagation();
    setEmployeeModal({
      isOpen: true,
      mode: "edit",
      data: person,
    });
  }, []);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    // TODO: delete logic
  }, []);

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-[#1E293B]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100">
              <Users size={24} />
            </div>
            <h1 className="text-3xl font-extrabold">Team Directory</h1>
          </div>
          <p className="text-[#64748B] text-sm font-medium">
            Manage organization members, roles, and reporting lines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsManagerModalOpen(true)}
            className="flex items-center gap-2 bg-white border px-5 py-3 rounded-xl font-bold"
          >
            <ShieldPlus size={18} />
            Add Manager
          </button>

          <button
            onClick={() =>
              setEmployeeModal({ isOpen: true, mode: "add", data: null })
            }
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            <Plus size={20} />
            Add Employee
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, role, or department..."
          className="w-full bg-white border rounded-2xl py-4 pl-12 pr-4 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LOADING */}
      {loading && <div className="text-center py-20">Loading team...</div>}

      {/* ERROR */}
      {error && !loading && (
        <div className="text-center py-20 text-red-500">{error}</div>
      )}

      {/* GRID */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((person) => (
            <div
              key={person.id}
              onClick={() => handleCardClick(person)}
              className="bg-white border rounded-3xl p-6 shadow-sm hover:shadow-xl transition cursor-pointer relative group"
            >
              {/* actions */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => handleEdit(e, person)}
                  className="p-2 bg-white border rounded-xl"
                >
                  <Edit3 size={16} />
                </button>

                <button
                  onClick={handleDelete}
                  className="p-2 bg-white border rounded-xl"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* department */}
              <span className="text-xs font-bold uppercase text-gray-400">
                {person.department}
              </span>

              {/* avatar */}
              <div
                className={`w-20 h-20 flex items-center justify-center rounded-3xl font-bold mt-4 ${
                  person.role === "MANAGER"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                {(person.name || "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <h3 className="font-bold mt-4">{person.name}</h3>

              <p className="text-sm text-gray-500">
                {person.position ||
                  (person.role === "MANAGER" ? "Team Lead" : "Employee")}
              </p>

              {/* role */}
              <div className="mt-4 flex items-center gap-2 text-xs font-bold">
                <ShieldCheck size={14} />
                {person.role}
              </div>

              {/* manager */}
              {person.manager && (
                <div className="mt-2 text-xs text-gray-500">
                  Reports to: {person.manager.name}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-500">No members found</div>
      )}

      {/* MODALS */}
      <HrAddEmployee
        isOpen={employeeModal.isOpen}
        mode={employeeModal.mode}
        initialData={employeeModal.data}
        onClose={() => setEmployeeModal((p) => ({ ...p, isOpen: false }))}
        onSave={handleSave}
      />

      <HrAddManager
        isOpen={isManagerModalOpen}
        onClose={() => setIsManagerModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
