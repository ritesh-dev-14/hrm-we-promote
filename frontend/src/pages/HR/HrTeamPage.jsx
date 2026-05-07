import { useState, useEffect } from "react";
import {
  Search,
  Edit3,
  Trash2,
  Plus,
  ShieldCheck,
  User,
  ShieldPlus,
  Users,
} from "lucide-react";
import HrAddEmployee from "./HrAddEmployee";
import HrAddManager from "./HrAddManager";
import API from "../../services/api";

export default function HrTeamPage() {
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

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both concurrently
      const [empRes, mgrRes] = await Promise.all([
        API.get("/api/hr/employees"),
        API.get("/api/hr/managers"),
      ]);

      setEmployees(empRes.data.data || []);
      setManagers(mgrRes.data.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch team data:", err);
      setError("Failed to load team directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const handleSave = () => {
    fetchTeamData();
  };

  // Combine both arrays for the grid
  const allStaff = [
    ...managers.map((m) => ({ ...m, role: "MANAGER" })),
    ...employees,
  ];

  // Search across names, departments, and roles - with null safety
  const filtered = allStaff.filter((person) => {
    const searchTerm = search.toLowerCase();
    const name = (person.name || "").toLowerCase();
    const department = (person.department || "").toLowerCase();
    const role = (person.role || "").toLowerCase();

    return (
      name.includes(searchTerm) ||
      department.includes(searchTerm) ||
      role.includes(searchTerm)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-[#1E293B]">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100">
              <Users size={24} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Team Directory
            </h1>
          </div>
          <p className="text-[#64748B] text-sm font-medium">
            Manage organization members, roles, and reporting lines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsManagerModalOpen(true)}
            className="flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#1E293B] px-5 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <ShieldPlus size={18} className="text-[#6366F1]" />
            <span className="hidden sm:inline">Add Manager</span>
          </button>

          <button
            onClick={() =>
              setEmployeeModal({ isOpen: true, mode: "add", data: null })
            }
            className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-3 rounded-xl font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-10 group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#6366F1] transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by name, role, or department..."
          className="w-full bg-white border border-[#E2E8F0] rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-[#6366F1] transition-all font-medium shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TEAM CARDS GRID */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((person) => (
            <div
              key={person.id}
              className="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
            >
              {/* Hover Actions */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                <button
                  onClick={() =>
                    setEmployeeModal({
                      isOpen: true,
                      mode: "edit",
                      data: person,
                    })
                  }
                  className="p-2 bg-white hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-100 shadow-sm transition-colors"
                >
                  <Edit3 size={16} />
                </button>
                <button className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-100 shadow-sm transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex flex-col items-center">
                {/* Department Tag */}
                <span className="self-start text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-lg mb-6 border border-slate-100">
                  {person.department}
                </span>

                {/* Profile Avatar */}
                <div className="relative mb-4">
                  <div
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center font-black text-2xl border-2 border-white shadow-inner ${
                      person.role === "MANAGER"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {person.name}
                </h3>
                <p className="text-slate-500 font-medium text-sm mt-0.5">
                  {person.position ||
                    (person.role === "MANAGER" ? "Team Lead" : "Staff")}
                </p>

                {/* Badges Container */}
                <div className="mt-6 w-full space-y-2">
                  {/* Reporting Info (for Employees) */}
                  {person.manager && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                      <User size={14} className="text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-600 truncate">
                        Reports to:{" "}
                        <span className="text-slate-900">
                          {person.manager.name}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Role Badge */}
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                      person.role === "MANAGER"
                        ? "bg-amber-50 border-amber-100 text-amber-700"
                        : "bg-indigo-50 border-indigo-100 text-indigo-700"
                    }`}
                  >
                    <ShieldCheck size={14} />
                    <span className="text-[11px] font-black uppercase tracking-wider">
                      {person.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-32 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600"></div>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
            Syncing Team...
          </p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="text-center py-32 bg-white rounded-4xl border border-dashed border-slate-200 mx-auto max-w-2xl">
          <p className="text-rose-500 font-bold mb-4">{error}</p>
          <button
            onClick={fetchTeamData}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-32">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Search size={32} />
          </div>
          <h3 className="text-slate-900 font-bold text-lg">No members found</h3>
          <p className="text-slate-500 text-sm">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* MODALS */}
      <HrAddEmployee
        isOpen={employeeModal.isOpen}
        mode={employeeModal.mode}
        initialData={employeeModal.data}
        onClose={() => setEmployeeModal({ ...employeeModal, isOpen: false })}
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
