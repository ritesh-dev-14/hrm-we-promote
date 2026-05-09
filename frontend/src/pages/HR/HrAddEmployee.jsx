import { useState, useEffect } from "react";
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
  error = "",
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
        className={`w-full h-12 sm:h-13 bg-[#F8FAFC] border rounded-2xl px-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ${
          error ? "border-red-500" : "border-slate-200"
        }`}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
import { ChevronDown } from "lucide-react";

function SelectField({ label, value, onChange, children, disabled = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="
            appearance-none
            w-full
            h-12 sm:h-13
            bg-white
            border
            border-slate-200
            rounded-2xl
            px-4
            pr-12
            text-sm
            font-semibold
            text-slate-700
            outline-none
            transition-all
            duration-200
            hover:border-slate-300
            focus:border-black
            focus:ring-4
            focus:ring-black/5
            disabled:opacity-50
            cursor-pointer
            shadow-[0_1px_2px_rgba(0,0,0,0.02)]
          "
        >
          {children}
        </select>

        {/* ICON */}
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <ChevronDown size={18} className="text-slate-400" />
        </div>
      </div>
    </div>
  );
}

export default function HrAddEmployee({
  isOpen,
  onClose,
  onSave,
  initialData,
}) {
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
  const [error, setError] = useState("");

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (error) setError("");
  };

  useEffect(() => {
    if (isOpen) {
      fetchManagers();

      if (initialData) {
        setForm(initialData);
      } else {
        setForm({
          name: "",
          email: "",
          password: "",
          department: "Engineering",
          position: "",
          managerId: "",
        });
      }

      setError("");
    }
  }, [isOpen, initialData]);

  const fetchManagers = async () => {
    try {
      setFetchingManagers(true);

      const res = await API.get("/api/hr/managers");

      setManagers(res.data.data || []);
    } catch (err) {
      console.error(err);

      notifyError("Could not load managers list.");
    } finally {
      setFetchingManagers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "EMPLOYEE",
        department: form.department,
        position: form.position,
        ...(form.managerId && { managerId: form.managerId }),
      };

      const res = await API.post("/api/hr/employee", payload);

      notifySuccess("Employee added successfully!");

      setForm({
        name: "",
        email: "",
        password: "",
        department: "Engineering",
        position: "",
        managerId: "",
      });

      onClose();

      if (onSave) onSave(res.data.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to add employee";

      setError(errorMsg);

      notifyError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-md p-0 sm:p-4">
      <div className="w-full sm:max-w-2xl bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-screen overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100 px-5 sm:px-8 py-5 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Add Employee</h2>

            <p className="text-sm text-slate-500 mt-1">
              Create and manage employee account access.
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
            onChange={(v) => updateForm("name", v)}
            placeholder="John Doe"
            required
          />

          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => updateForm("email", v)}
            placeholder="john@company.com"
            required
          />

          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => updateForm("password", v)}
            placeholder="••••••••"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SelectField
              label="Department"
              value={form.department}
              onChange={(e) => updateForm("department", e.target.value)}
            >
              <option>Engineering</option>
              <option>Sales</option>
              <option>Marketing</option>
              <option>HR</option>
              <option>Production</option>
            </SelectField>

            <Field
              label="Position"
              value={form.position}
              onChange={(v) => updateForm("position", v)}
              placeholder="Frontend Developer"
              required
            />
          </div>

          <SelectField
            label="Assign Manager"
            value={form.managerId}
            onChange={(e) => updateForm("managerId", e.target.value)}
            disabled={fetchingManagers}
          >
            <option value="">
              {fetchingManagers ? "Loading managers..." : "-- No Manager --"}
            </option>

            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name} ({manager.department})
              </option>
            ))}
          </SelectField>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

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
              className="w-full sm:flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all"
            >
              {loading ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
