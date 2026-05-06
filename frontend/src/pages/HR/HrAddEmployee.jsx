import { useState, useEffect } from "react";
import { X} from "lucide-react";

export default function HrAddEmployee({ isOpen, onClose, onSave, mode, initialData }) {
  const [form, setForm] = useState({
    name: "",
    workEmail: "",
    password: "",
    department: "Engineering",
    position: "",
    role: "EMPLOYEE" // Default role
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({ name: "", workEmail: "", password: "", department: "Engineering", position: "", role: "EMPLOYEE" });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#F1F5F9] flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#1E293B]">{mode === 'edit' ? 'Edit Employee' : 'Add Employee'}</h2>
            <p className="text-[#64748B] font-medium text-sm">Configure account and role permissions</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F1F5F9] rounded-full text-slate-400"><X size={24} /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(form); onClose(); }} className="p-8 space-y-5">
          <Field label="Full Name" value={form.name} onChange={(v)=>setForm({...form, name: v})} placeholder="John Doe" />
          <Field label="Work Email" type="email" value={form.workEmail} onChange={(v)=>setForm({...form, workEmail: v})} placeholder="name@company.com" />
          <Field label="Password" type="password" value={form.password} onChange={(v)=>setForm({...form, password: v})} placeholder="••••••••" />

          {/* Designation & Position */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">Designation</label>
              <select 
                value={form.department} 
                onChange={(e)=>setForm({...form, department: e.target.value})}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 outline-none focus:border-[#6366F1] cursor-pointer"
              >
                <option>Engineering</option>
                <option>Sales</option>
                <option>Marketing</option>
                <option>HR</option>
              </select>
            </div>
            <Field label="Position" value={form.position} onChange={(v)=>setForm({...form, position: v})} placeholder="Senior Developer" />
          </div>

          {/* System Role Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">System Role</label>
            <div className="grid grid-cols-2 gap-2">
              {['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({...form, role})}
                  className={`py-3 rounded-xl text-[11px] font-bold border transition-all ${
                    form.role === role 
                    ? 'bg-indigo-50 border-[#6366F1] text-[#6366F1]' 
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]">
              {mode === 'edit' ? 'Update Member' : 'Create Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, onChange, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">{label}</label>
      <input 
        {...props} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 outline-none focus:border-[#6366F1] transition-all font-medium text-[#1E293B]" 
      />
    </div>
  );
}