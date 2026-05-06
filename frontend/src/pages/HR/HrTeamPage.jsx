import { useState, useEffect } from "react";
import { Search, Edit3, Trash2, Plus, ShieldCheck, User } from "lucide-react";
import HrAddEmployee from "./HrAddEmployee";
import API from "../../services/api";

export default function HrTeamPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ isOpen: false, mode: 'add', data: null });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/hr/employees");
      setEmployees(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch employees:", err);
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    fetchEmployees();
  };

  const filtered = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-[32px] font-bold text-[#0F172A]">Employees</h1>
          <p className="text-[#64748B] text-lg font-medium">Manage your team and permissions</p>
        </div>
        <button 
          onClick={() => setModal({ isOpen: true, mode: 'add', data: null })}
          className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <Plus size={20} /> Add Employee
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
        <input 
          type="text"
          placeholder="Search by name..."
          className="w-full bg-white border border-[#E2E8F0] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#6366F1] transition-all font-medium shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((emp) => (
          <div key={emp.id} className="group relative bg-white border border-[#F1F5F9] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300">
            {/* Actions revealed on hover */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setModal({ isOpen: true, mode: 'edit', data: emp })} className="p-2 bg-[#F8FAFC] hover:bg-indigo-50 text-[#64748B] rounded-xl border border-[#E2E8F0]">
                <Edit3 size={16} />
              </button>
              <button onClick={() => setEmployees(prev => prev.filter(e => e.id !== emp.id))} className="p-2 bg-[#F8FAFC] hover:bg-rose-50 text-[#64748B] rounded-xl border border-[#E2E8F0]">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex flex-col items-center">
              {/* Designation Badge */}
              <span className="self-start text-[10px] font-black uppercase text-[#64748B] bg-[#F1F5F9] px-3 py-1 rounded-lg mb-6">{emp.department}</span>
              
              {/* Initials Avatar */}
              <div className="w-20 h-20 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] font-black text-2xl mb-4">
                {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>

              <h3 className="text-xl font-bold text-[#1E293B]">{emp.name}</h3>
              <p className="text-[#64748B] font-medium text-sm mt-1">{emp.position}</p>

              {/* Manager Badge (If exists) */}
              {emp.manager && (
                <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                  <User size={12} className="text-[#64748B]" />
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Mgr: {emp.manager.name}</span>
                </div>
              )}

              {/* Role Badge */}
              <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full">
                <ShieldCheck size={12} className="text-[#6366F1]" />
                <span className="text-[10px] font-bold text-[#6366F1] uppercase">{emp.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366F1]"></div>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-20">
          <p className="text-red-500 font-bold">{error}</p>
          <button onClick={fetchEmployees} className="text-[#6366F1] mt-2 underline">Try again</button>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400 italic">
          No employees found matching your search.
        </div>
      )}

      <HrAddEmployee 
        isOpen={modal.isOpen} 
        mode={modal.mode} 
        initialData={modal.data}
        onClose={() => setModal({ ...modal, isOpen: false })} 
        onSave={handleSave}
      />
    </div>
  );
}