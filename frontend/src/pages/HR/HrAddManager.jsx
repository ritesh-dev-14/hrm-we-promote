import { useState, useEffect } from "react";
import { X, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";
import API from "../../services/api";

function Field({ label, type = "text", value, onChange, placeholder, required = false }) {
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
        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-indigo-500/10 transition-all"
      />
    </div>
  );
}

export default function HrAddManager({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", department: "Engineering" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await API.post("/api/hr/manager", form);
      setMessage({ type: "success", text: "Manager account created successfully!" });
      
      setTimeout(() => {
        onClose();
        if (onSave) onSave(res.data.data);
        setForm({ name: "", email: "", password: "", department: "Engineering" });
      }, 1500);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to add manager" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-[#F1F5F9] flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <ShieldCheck size={20} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-[#1E293B]">Add Manager</h2>
                <p className="text-[#64748B] text-xs font-medium">Create administrative access</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors"><X size={20} /></button>
        </div>

        {message.text && (
          <div className="px-8 pt-6">
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <p className="text-sm font-bold">{message.text}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <Field label="Full Name" value={form.name} onChange={(v)=>setForm({...form, name: v})} placeholder="Jane Smith" required />
          <Field label="Email Address" type="email" value={form.email} onChange={(v)=>setForm({...form, email: v})} placeholder="jane.manager@company.com" required />
          <Field label="Password" type="password" value={form.password} onChange={(v)=>setForm({...form, password: v})} placeholder="••••••••" required />

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">Department</label>
            <select 
              value={form.department} 
              onChange={(e)=>setForm({...form, department: e.target.value})}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 outline-none focus:border-[#6366F1] cursor-pointer font-medium"
            >
              <option>Engineering</option>
              <option>Sales</option>
              <option>Marketing</option>
              <option>Production</option>
              <option>HR</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Discard</button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white py-3.5 rounded-2xl font-bold shadow-xl transition-all active:scale-[0.98]"
            >
              {loading ? "Authorizing..." : "Create Manager"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}