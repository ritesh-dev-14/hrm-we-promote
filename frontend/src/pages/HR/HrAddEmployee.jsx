import { useState, useEffect } from "react";
import { X, ChevronDown, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type={isPasswordType && showPassword ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full h-10 bg-white border rounded-xl px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
            error
              ? "border-red-500 focus:border-red-500 ring-2 ring-red-500/10"
              : "border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
          }`}
        />

        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
  disabled = false,
  multiple = false,
  placeholder = "",
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 tracking-wide">{label}</label>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          multiple={multiple}
          className={`
            appearance-none
            w-full
            bg-white
            border
            border-slate-200
            rounded-xl
            px-3
            text-sm
            text-slate-800
            outline-none
            transition-all
            hover:border-slate-300
            focus:border-slate-900
            disabled:opacity-50
            disabled:bg-slate-50
            cursor-pointer
            ${multiple ? "min-h-[110px] py-2.5 space-y-1 focus:ring-2 focus:ring-slate-900/5" : "h-10 pr-10"}
          `}
        >
          {children}
        </select>

        {!multiple && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <ChevronDown size={15} className="text-slate-400" />
          </div>
        )}
      </div>

      {placeholder && (
        <p className="text-[11px] text-slate-400 leading-normal mt-1 italic">{placeholder}</p>
      )}
    </div>
  );
}

export default function HrAddEmployee({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: [],
    position: "",
    managerIds: [],
  });

  const [departments, setDepartments] = useState([]);
  const [fetchingDepartments, setFetchingDepartments] = useState(false);
  const [managers, setManagers] = useState([]);
  const [fetchingManagers, setFetchingManagers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (error) setError("");
  };

  const fetchDepartments = async () => {
    try {
      setFetchingDepartments(true);
      const res = await API.get("/api/departments");
      setDepartments(res.data?.data || []);
    } catch (err) {
      console.error(err);
      notifyError("Failed to load departments");
    } finally {
      setFetchingDepartments(false);
    }
  };

  const fetchManagers = async () => {
    try {
      setFetchingManagers(true);
      const res = await API.get("/api/hr/managers");
      setManagers(res.data?.data || []);
    } catch (err) {
      console.error(err);
      notifyError("Could not load managers list.");
    } finally {
      setFetchingManagers(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchManagers();
    fetchDepartments();

    if (initialData) {
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        department: initialData.departments?.length
          ? initialData.departments.map((dept) => dept.id || dept)
          : initialData.department?.id
            ? [initialData.department.id]
            : [],
        position: initialData.position || "",
        managerIds: initialData.managers?.length
          ? initialData.managers.map((mgr) => mgr.id || mgr)
          : initialData.managerId
            ? [initialData.managerId]
            : [],
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        department: [],
        position: "",
        managerIds: [],
      });
    }

    setError("");
  }, [isOpen, initialData]);

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
        department: form.department, // Correctly forwards array of IDs now
        position: form.position,
        ...(form.managerIds.length > 0 && {
          managerIds: form.managerIds, // Forwards array of IDs now
        }),
      };

      const res = await API.post("/api/hr/employee", payload);
      notifySuccess("Employee added successfully!");

      setForm({
        name: "",
        email: "",
        password: "",
        department: [],
        position: "",
        managerIds: [],
      });

      onClose();

      if (onSave) {
        onSave(res.data.data);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Failed to add employee";
      setError(errorMsg);
      notifyError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-slate-100 architecture-container animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add New Employee</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create a new employee system access account profile.
            </p>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors cursor-pointer hover:bg-slate-50"
          >
            <X size={15} />
          </button>
        </div>

        {/* MODAL FORM WRAPPER */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* SCROLLABLE INJECT FORM FIELDS */}
          <div className="p-6 flex-1 space-y-4 overflow-y-auto bg-white custom-scrollbar">
            <Field
              label="Full Name"
              value={form.name}
              onChange={(v) => updateForm("name", v)}
              placeholder="John Doe"
              required
            />

            <Field
              label="Email Address"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Department"
                value={form.department}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  updateForm("department", selected);
                }}
                disabled={fetchingDepartments}
                multiple
                placeholder="Hold Ctrl/Cmd to choose multiple departments"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id} className="py-1 px-2 rounded-md text-slate-700 checked:bg-slate-900 checked:text-white">
                    {dept.name}
                  </option>
                ))}
              </SelectField>

              <Field
                label="Job Title / Position"
                value={form.position}
                onChange={(v) => updateForm("position", v)}
                placeholder="Frontend Developer"
                required
              />
            </div>

            <SelectField
              label="Assign Reporting Managers"
              value={form.managerIds}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                updateForm("managerIds", selected);
              }}
              disabled={fetchingManagers}
              multiple
              placeholder="Hold Ctrl/Cmd to choose multiple managers"
            >
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id} className="py-1 px-2 rounded-md text-slate-700 checked:bg-slate-900 checked:text-white">
                  {manager.name} ({manager.position})
                </option>
              ))}
            </SelectField>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600 animate-pulse">
                {error}
              </div>
            )}
          </div>

          {/* PERSISTENT ACTIONS FOOTER */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors disabled:bg-slate-300 cursor-pointer shadow-sm shadow-slate-900/10"
            >
              {loading ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}