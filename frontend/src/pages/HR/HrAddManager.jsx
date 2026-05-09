import { useState } from "react";
import { X } from "lucide-react";
import API from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full h-12 sm:h-13 bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full h-12 sm:h-13 bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
      >
        {children}
      </select>
    </div>
  );
}

export default function HrAddManager({
  isOpen,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "Engineering",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await API.post("/api/hr/manager", form);

      notifySuccess("Manager account created successfully!");

      if (onSave) onSave(res.data.data);

      setForm({
        name: "",
        email: "",
        password: "",
        department: "Engineering",
      });

      onClose();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to add manager";

      notifyError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-md p-0 sm:p-4">
      <div className="w-full sm:max-w-xl bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-screen overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100 px-5 sm:px-8 py-5 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Add Manager
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Create manager-level access and permissions.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-all"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* BODY */}
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-8 space-y-5 sm:space-y-6"
        >
          <Field
            label="Full Name"
            value={form.name}
            onChange={(v) =>
              setForm({ ...form, name: v })
            }
            placeholder="Jane Smith"
            required
          />

          <Field
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(v) =>
              setForm({ ...form, email: v })
            }
            placeholder="jane@company.com"
            required
          />

          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) =>
              setForm({ ...form, password: v })
            }
            placeholder="••••••••"
            required
          />

          <SelectField
            label="Department"
            value={form.department}
            onChange={(e) =>
              setForm({
                ...form,
                department: e.target.value,
              })
            }
          >
            <option>Engineering</option>
            <option>Sales</option>
            <option>Marketing</option>
            <option>Production</option>
            <option>HR</option>
          </SelectField>

          {/* FOOTER */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 h-12 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white font-bold shadow-xl transition-all"
            >
              {loading ? "Creating..." : "Create Manager"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}