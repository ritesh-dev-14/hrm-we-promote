import { useState, useEffect } from "react";
import { X, ChevronDown, Eye, EyeOff } from "lucide-react";

import API from "../../services/api";

import {
  notifySuccess,
  notifyError,
} from "../../utils/toast";

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
      <label className="text-xs font-medium text-slate-700">
        {label}{" "}
        {required && (
          <span className="text-red-500">*</span>
        )}
      </label>

      <div className="relative">
        <input
          type={isPasswordType && showPassword ? "text" : type}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          required={required}
          className={`w-full h-10 bg-white border rounded-xl px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors ${
            error ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-slate-900"
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

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
  disabled = false,
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-700">
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
            h-10
            bg-white
            border
            border-slate-200
            rounded-xl
            px-3
            pr-10
            text-sm
            text-slate-800
            outline-none
            transition-colors
            hover:border-slate-300
            focus:border-slate-900
            disabled:opacity-50
            cursor-pointer
          "
        >
          {children}
        </select>

        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <ChevronDown
            size={15}
            className="text-slate-400"
          />
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
    department: "",
    position: "",
    managerId: "",
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
        department: initialData.department?.name || "",
        position: initialData.position || "",
        managerId: initialData.managerId || "",
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        department: "",
        position: "",
        managerId: "",
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
        department: form.department,
        position: form.position,
        ...(form.managerId && {
          managerId: form.managerId,
        }),
      };

      const res = await API.post("/api/hr/employee", payload);

      notifySuccess("Employee added successfully!");
      
      setForm({
        name: "",
        email: "",
        password: "",
        department: "",
        position: "",
        managerId: "",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[90vh] border border-slate-100">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Add Employee
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create a new employee system access account profile.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* MODAL FORM BODY */}
        <form
          onSubmit={handleSubmit}
          className="p-6 flex-1 space-y-4 overflow-y-auto bg-white"
        >
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
              onChange={(e) => updateForm("department", e.target.value)}
              disabled={fetchingDepartments}
            >
              <option value="">
                {fetchingDepartments ? "Loading..." : "Select Department"}
              </option>

              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
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
            label="Assign Reporting Manager"
            value={form.managerId}
            onChange={(e) => updateForm("managerId", e.target.value)}
            disabled={fetchingManagers}
          >
            <option value="">
              {fetchingManagers ? "Loading..." : "-- No Reporting Manager --"}
            </option>

            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name}
              </option>
            ))}
          </SelectField>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600">
              {error}
            </div>
          )}
        </form>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
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
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors disabled:bg-slate-300 cursor-pointer"
          >
            {loading ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}