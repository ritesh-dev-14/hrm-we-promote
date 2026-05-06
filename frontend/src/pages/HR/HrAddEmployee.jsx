import { useState, useEffect } from "react";
console.log("DEBUG: HrAddEmployee.jsx loaded at", new Date().toLocaleTimeString());
import { X, AlertCircle, CheckCircle } from "lucide-react";
import API from "../../services/api";

function Field({ label, type = "text", value, onChange, placeholder, required = false, error = "" }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type={type}
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-[#F8FAFC] border rounded-2xl px-4 py-3 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-indigo-500/10 transition-all ${error ? "border-red-500" : "border-[#E2E8F0]"}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function HrAddEmployee({ isOpen, onClose, onSave, mode, initialData }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "Engineering",
    position: "",
    managerId: "",
  });

  const [managers, setManagers] = useState([]);
  const [fetchingManagers, setFetchingManagers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (error) setError(""); // Clear error when user types
  };

  // Fetch managers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchManagers();
      if (initialData) setForm(initialData);
      else setForm({ name: "", email: "", password: "", department: "Engineering", position: "", managerId: "" });
      setSuccessMessage("");
      setError("");
    }
  }, [isOpen, initialData]);

  const fetchManagers = async () => {
    try {
      setFetchingManagers(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError('Authentication token not found. Please log in.');
        return;
      }
      
      const res = await API.get("/api/hr/managers");
      setManagers(res.data.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch managers:", err.response?.data || err.message);
      setManagers([]);
      setError(`Failed to load managers: ${err.response?.data?.message || err.message}`);
    } finally {
      setFetchingManagers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "EMPLOYEE",
        department: form.department,
        position: form.position,
        ...(form.managerId && { managerId: form.managerId })
      };

      console.log("Submitting payload:", payload);
      const res = await API.post("/api/hr/employee", payload);
      
      setSuccessMessage("Employee added successfully!");
      setForm({ name: "", email: "", password: "", department: "Engineering", position: "", managerId: "" });
      
      setTimeout(() => {
        onClose();
        if (onSave) onSave(res.data.data);
      }, 1500);
    } catch (err) {
      console.error("❌ Form submission failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#F1F5F9] flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#1E293B]">Add Employee</h2>
            <p className="text-[#64748B] font-medium text-sm">Create a new employee account</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F1F5F9] rounded-full text-slate-400"><X size={24} /></button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="px-8 pt-6 pb-0">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
              <CheckCircle size={20} className="text-green-600" />
              <p className="text-sm text-green-700 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="px-8 pt-6 pb-0">
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <AlertCircle size={20} className="text-red-600" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <Field label="Full Name" value={form.name} onChange={(v)=>updateForm("name", v)} placeholder="John Doe" required />
          <Field label="Email" type="email" value={form.email} onChange={(v)=>updateForm("email", v)} placeholder="name@company.com" required />
          <Field label="Password" type="password" value={form.password} onChange={(v)=>updateForm("password", v)} placeholder="••••••••" required />

          {/* Designation & Position */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">Department</label>
              <select 
                value={form.department} 
                onChange={(e)=>updateForm("department", e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 outline-none focus:border-[#6366F1] cursor-pointer"
              >
                <option>Engineering</option>
                <option>Sales</option>
                <option>Marketing</option>
                <option>HR</option>
                <option>Shoot</option>
              </select>
            </div>
            <Field label="Position" value={form.position} onChange={(v)=>updateForm("position", v)} placeholder="Cameraman" required />
          </div>

          {/* Manager Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">
              Assign Manager (Optional)
            </label>
            <select 
              value={form.managerId} 
              onChange={(e)=>updateForm("managerId", e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 outline-none focus:border-[#6366F1] cursor-pointer disabled:opacity-50"
              disabled={fetchingManagers}
            >
              <option value="">{fetchingManagers ? "Loading managers..." : "-- No Manager --"}</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.department})
                </option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-[#6366F1] hover:bg-[#4F46E5] disabled:bg-slate-400 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              {loading ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}