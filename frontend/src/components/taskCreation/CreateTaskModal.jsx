import { useEffect, useState } from "react";
import { X, Loader2, ClipboardList, CheckCircle2 } from "lucide-react";
import API from "../../services/api";

const INITIAL_STATE = {
  projectName: "",
  description: "",
  startDate: "",
  endDate: ""
};

const CreateTaskModal = ({ open, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Reset form states when modal opens
  useEffect(() => {
    if (open) {
      setFormData(INITIAL_STATE);
      setError("");
      setIsSuccess(false);
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Format regular HTML dates to the exact ISO format expected by your API (T00:00:00.000Z)
      const payload = {
        projectName: formData.projectName.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate ? `${formData.startDate}T00:00:00.000Z` : null,
        endDate: formData.endDate ? `${formData.endDate}T00:00:00.000Z` : null
      };

      const res = await API.post("/api/manager/tasks", payload);

      if (res.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onTaskCreated(res.data.data);
          onClose();
        }, 1500); // Brief pause to show success checkmark
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const today = new Date().toISOString().split("T")[0];

  // Reusable Tailwind classes to keep the component clean
  const labelClass = "block text-xs font-bold text-gray-700 ml-0.5";
  const inputClass = "w-full bg-gray-100 border-[1.5px] border-transparent rounded-[14px] px-3 py-2.5 text-sm text-gray-900 transition-all duration-200 outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5";
  const textareaClass = "w-full bg-gray-100 border-[1.5px] border-transparent rounded-[14px] px-3 py-2.5 text-sm text-gray-900 transition-all duration-200 outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 resize-none h-28";

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose} 
    >
      <div 
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} 
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/20">
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Create Project</h2>
              <p className="text-xs text-gray-500">Initialize a new project board</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* FORM BODY */}
        <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Project Created!</h3>
              <p className="text-gray-500">The project setup was successfully sent.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                
                {/* PROJECT NAME */}
                <div className="space-y-1.5">
                  <label className={labelClass}>Project Name</label>
                  <input
                    type="text"
                    name="projectName"
                    required
                    value={formData.projectName}
                    onChange={handleChange}
                    placeholder="e.g., Hr Project"
                    className={inputClass}
                  />
                </div>

                {/* DATE GRID */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      min={today}
                      value={formData.startDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      required
                      min={formData.startDate || today}
                      value={formData.endDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-1.5">
                  <label className={labelClass}>Description</label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Redesign the marketing website..."
                    className={textareaClass}
                  />
                </div>
              </div>

              {/* ERROR STATE */}
              {error && (
                <div className="text-red-600 text-xs bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-2xl bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none shadow-xl shadow-black/10"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;