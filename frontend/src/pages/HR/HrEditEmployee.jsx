import { useState, useEffect } from "react";
import { X, Save, Eye, EyeOff } from "lucide-react";
import API from "../../services/api";

export default function HrEditEmployee({ isOpen, employeeData, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    password: "",
  });

  useEffect(() => {
    if (employeeData && isOpen) {
      setForm({
        name: employeeData.name || "",
        email: employeeData.email || "",
        department: employeeData.department?.name || employeeData.department || "",
        position: employeeData.position || "",
        password: "",
      });
      setError(null);
      setShowPassword(false);
    }
  }, [employeeData, isOpen]);

  if (!isOpen || !employeeData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let endpoint = "";
      let payload = {};

      const rawId = employeeData.employeeId || employeeData.id || "";
      const cleanId = rawId.split(":")[0];

      if (employeeData.role === "MANAGER") {
        endpoint = `/api/hr/manager/${cleanId}`;
        payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          department: form.department.trim(),
          ...(form.password && { password: form.password }),
        };
      } else {
        endpoint = `/api/hr/employee/${cleanId}`;
        payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          department: form.department.trim(),
          position: form.position.trim(),
          ...(form.password && { password: form.password }),
        };
      }

      const res = await API.put(endpoint, payload);
      
      if (res?.data?.success || res?.status === 200) {
        onSave();
        onClose();
      } else {
        setError("Update failed to finalize correctly.");
      }
    } catch (err) {
      console.error("Sync error:", err);
      setError(err?.response?.data?.message || "Internal database update failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/20 backdrop-blur-xs">
      <div className="bg-white h-full w-full max-w-md shadow-xl flex flex-col justify-between border-l border-slate-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Edit Profile</h2>
            <p className="text-xs text-slate-500 mt-0.5">{employeeData.role} — ID: {employeeData.employeeId || employeeData.id?.slice(0, 8)}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* CLEAN FORM INPUT CONTENT */}
        <form onSubmit={handleSave} className="p-6 flex-1 space-y-4 overflow-y-auto bg-white">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none text-slate-800 focus:border-slate-900 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none text-slate-800 focus:border-slate-900 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Department</label>
            <input
              type="text"
              name="department"
              required
              value={form.department}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none text-slate-800 focus:border-slate-900 transition-colors"
            />
          </div>

          {employeeData.role !== "MANAGER" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Job Title / Position</label>
              <input
                type="text"
                name="position"
                required={employeeData.role !== "MANAGER"}
                value={form.position}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none text-slate-800 focus:border-slate-900 transition-colors"
              />
            </div>
          )}

          <div className="space-y-1 pt-1">
            <label className="text-xs font-medium text-slate-700">Reset Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep unchanged"
                className="w-full h-10 pl-3 pr-10 rounded-lg border border-slate-200 text-sm outline-none text-slate-800 focus:border-slate-900 transition-colors placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </form>

        {/* FOOTER CONTROLS */}
        <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="h-10 px-4 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={handleSave}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors disabled:bg-slate-300 cursor-pointer"
          >
            <Save size={14} />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}