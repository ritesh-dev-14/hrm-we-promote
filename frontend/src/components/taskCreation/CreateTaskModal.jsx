import { useEffect, useState } from "react";
import { X, Loader2, ClipboardList, CheckCircle2 } from "lucide-react";
import API from "../../services/api";

const INITIAL_STATE = {
  title: "",
  description: "",
  instructions: "",
  referenceLink: "",
  location: "",
  date: "",
  setupType: "PREMIUM"
};

const CreateTaskModal = ({ open, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

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
      // Clean data
      const payload = Object.keys(formData).reduce((acc, key) => {
        acc[key] = typeof formData[key] === "string" ? formData[key].trim() : formData[key];
        return acc;
      }, {});

      const res = await API.post("/api/manager/tasks", payload);

      if (res.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onTaskCreated(res.data.data);
          onClose();
        }, 1500); // Brief pause to show success state
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose} // Close on backdrop click
    >
      <div 
        className="w-full max-w-md bg-white rounded-4xl shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200"
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
              <h2 className="text-lg font-bold text-gray-900">Create Task</h2>
              <p className="text-xs text-gray-500">Assign new duties to the team</p>
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
        <div className="overflow-y-auto p-6 custom-scrollbar">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Task Created!</h3>
              <p className="text-gray-500">The task has been successfully assigned.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* TITLE */}
                <div className="space-y-1.5">
                  <label className="label">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., New Store Setup"
                    className="input"
                  />
                </div>

                {/* DATE & LOCATION GRID */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="label">Date</label>
                    <input
                      type="date"
                      name="date"
                      required
                      min={today}
                      value={formData.date}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label">Location</label>
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City/Store"
                      className="input"
                    />
                  </div>
                </div>

                {/* DROPDOWNS */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="label">Setup Type</label>
                    <select name="setupType" value={formData.setupType} onChange={handleChange} className="input">
                      <option value="PREMIUM">Premium</option>
                      <option value="VERY_PREMIUM">Very Premium</option>
                      <option value="PHONE">Phone</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    {/* <label className="label">Assign Role</label>
                    <select name="assignedToRole" value={formData.assignedToRole} onChange={handleChange} className="input">
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                    </select> */}
                  </div>
                </div>

                {/* REFERENCE LINK */}
                <div className="space-y-1.5">
                  <label className="label">Reference Link (Optional)</label>
                  <input
                    type="url"
                    name="referenceLink"
                    value={formData.referenceLink}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/..."
                    className="input"
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-1.5">
                  <label className="label">Description</label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the overall goal..."
                    className="textarea h-24"
                  />
                </div>

                {/* INSTRUCTIONS */}
                <div className="space-y-1.5">
                  <label className="label">Step-by-Step Instructions</label>
                  <textarea
                    name="instructions"
                    required
                    value={formData.instructions}
                    onChange={handleChange}
                    placeholder="1. Check inventory..."
                    className="textarea h-24"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-xs bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              {/* FOOTER BUTTON */}
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
                    "Create Task"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #374151;
          margin-left: 2px;
        }

        .input, .textarea {
          width: 100%;
          background: #f3f4f6;
          border: 1.5px solid transparent;
          border-radius: 14px;
          padding: 0.6rem 0.8rem;
          font-size: 0.875rem;
          color: #111827;
          transition: all 0.2s ease;
        }

        .input:focus, .textarea:focus {
          background: #ffffff;
          border-color: #000000;
          outline: none;
          box-shadow: 0 0 0 4px rgba(0,0,0,0.03);
        }

        .textarea {
          resize: none;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default CreateTaskModal;