import { useEffect, useState, useMemo } from "react";
import API from "../../services/api";
import { notifySuccess, notifyError, notifyInfo } from "../../utils/toast";
import {
  Calendar, MapPin, ClipboardList, X, Link2, Clock3, Sparkles,
  Send, CheckCircle2, TrendingUp, BarChart3, Save, ExternalLink,
  AlertCircle, ShieldCheck
} from "lucide-react";

/* ── Progress Ring ── */
const CircleProgress = ({ value = 0, size = 120, stroke = 10 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 100 ? "#10b981" : value >= 60 ? "#6366f1" : "#f59e0b";

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-500" />
    </svg>
  );
};

const EmployeeTaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form States
  const [progressValue, setProgressValue] = useState(0);
  const [driveLink, setDriveLink] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await API.get("/api/task-item-submission/my-items");
      setTasks(response.data.data || []);
    } catch (error) {
      notifyError("Failed to sync tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const handleOpenTask = (item) => {
    setSelectedTask(item);
    setProgressValue(item.progress || 0);
    setDriveLink(item.submission?.driveLink || "");
    setRemarks(item.submission?.remarks || "");
  };

  const handleSaveProgress = async () => {
    try {
      setSavingProgress(true);
      await API.patch(`/api/task-item-submission/${selectedTask.assignmentId}/progress`, { progress: progressValue });
      notifySuccess("Progress synchronized");
      loadTasks(); // Refresh to get latest state
    } catch (err) {
      notifyError("Update failed");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleSubmitTask = async () => {
    if (!driveLink.trim()) return notifyInfo("Drive link is required for submission");
    try {
      setSubmitting(true);
      await API.post(`/api/task-item-submission/${selectedTask.assignmentId}/submit`, { driveLink, remarks });
      notifySuccess("Work submitted successfully!");
      setSelectedTask(null);
      loadTasks();
    } catch (err) {
      notifyError("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Stats Logic
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "VERIFIED").length;
    const submitted = tasks.filter(t => t.submission && t.status !== "VERIFIED").length;
    const avg = total > 0 ? Math.round(tasks.reduce((s, t) => s + (t.progress || 0), 0) / total) : 0;
    return { total, completed, submitted, avg };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
              <ClipboardList className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mission Control</h1>
              <p className="text-slate-500 font-medium">Manage your assignments and deliverables</p>
            </div>
          </div>
          <div className="flex gap-2">
             <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Progress</p>
                <p className="text-lg font-black text-indigo-600">{stats.avg}%</p>
             </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatBox label="Active Tasks" value={stats.total} icon={<TrendingUp size={20}/>} color="text-slate-900" />
          <StatBox label="Submitted" value={stats.submitted} icon={<Send size={20}/>} color="text-blue-600" />
          <StatBox label="Verified" value={stats.completed} icon={<ShieldCheck size={20}/>} color="text-emerald-600" />
          <StatBox label="Success Rate" value={`${stats.avg}%`} icon={<CheckCircle2 size={20}/>} color="text-indigo-600" />
        </div>

        {loading ? (
          <div className="py-20 text-center animate-pulse">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold">Syncing with server...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-[40px] border border-dashed border-slate-300 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
               <AlertCircle size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
            <p className="text-slate-500">No new tasks have been assigned to you yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tasks.map((item) => (
              <TaskCard key={item.assignmentId} item={item} onOpen={() => handleOpenTask(item)} />
            ))}
          </div>
        )}
      </div>

      {/* --- Task Management Modal --- */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-indigo-600">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none">{selectedTask.taskItem?.title}</h2>
                  <p className="text-slate-400 text-sm mt-2 font-medium">Assignment ID: {selectedTask.assignmentId.slice(-8)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-3 bg-white hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all border border-slate-200">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Details */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Project Brief</h4>
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-slate-600 leading-relaxed">
                    {selectedTask.taskItem?.description}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Execution Instructions</h4>
                  <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100 text-indigo-900 whitespace-pre-line text-sm">
                    {selectedTask.taskItem?.instructions}
                  </div>
                </div>

                {selectedTask.taskItem?.task?.referenceLink && (
                  <a href={selectedTask.taskItem.task.referenceLink} target="_blank" className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 transition-all group">
                    <div className="flex items-center gap-3">
                      <Link2 className="text-slate-400 group-hover:text-indigo-500" size={20} />
                      <span className="font-bold text-slate-700">Reference Assets</span>
                    </div>
                    <ExternalLink size={16} className="text-slate-300" />
                  </a>
                )}
              </div>

              {/* Right Column: Actions (Conditional Rendering) */}
              <div className="space-y-6">
                {selectedTask.submission ? (
                  /* POST-SUBMISSION VIEW */
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-[32px]">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200">
                           <CheckCircle2 size={20}/>
                         </div>
                         <h4 className="font-black text-emerald-900 text-lg">Submission Review</h4>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="bg-white p-4 rounded-2xl border border-emerald-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Drive Link</p>
                            <a href={selectedTask.submission.driveLink} target="_blank" className="text-indigo-600 font-bold text-sm truncate block hover:underline">
                              {selectedTask.submission.driveLink}
                            </a>
                         </div>
                         <div className="bg-white p-4 rounded-2xl border border-emerald-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">My Remarks</p>
                            <p className="text-slate-600 text-sm italic">"{selectedTask.submission.remarks || 'No remarks provided'}"</p>
                         </div>
                         <div className="pt-2">
                           <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                             selectedTask.status === 'VERIFIED' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                           }`}>
                             Current Status: {selectedTask.status}
                           </span>
                         </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* PRE-SUBMISSION EDITING VIEW */
                  <>
                    <div className="bg-white border border-slate-200 p-6 rounded-[32px] shadow-sm">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Real-time Progress</h4>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <CircleProgress value={progressValue} size={110} />
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-slate-900">{progressValue}%</span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-4">
                          <input type="range" min="0" max="100" value={progressValue} onChange={(e) => setProgressValue(parseInt(e.target.value))} 
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                          <button onClick={handleSaveProgress} disabled={savingProgress} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all">
                             {savingProgress ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16}/>}
                             Save Progress
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-600 p-6 rounded-[32px] shadow-xl shadow-indigo-100 text-white space-y-4">
                      <div className="flex items-center gap-2">
                         <Sparkles size={18} />
                         <h4 className="font-bold">Final Submission</h4>
                      </div>
                      <div className="space-y-3">
                        <input value={driveLink} onChange={e => setDriveLink(e.target.value)} placeholder="Google Drive Link *" 
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm placeholder:text-indigo-200 outline-none focus:bg-white/20 transition-all" />
                        <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add any final remarks..." rows={3}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm placeholder:text-indigo-200 outline-none focus:bg-white/20 transition-all resize-none" />
                        <button onClick={handleSubmitTask} disabled={submitting} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all disabled:opacity-50">
                          {submitting ? "Processing..." : "Submit Task Now"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- Sub-Components --- */

const StatBox = ({ label, value, icon, color }) => (
  <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
    </div>
    <div className={`p-3 rounded-xl bg-slate-50 ${color} group-hover:bg-indigo-50 transition-all`}>
      {icon}
    </div>
  </div>
);

const TaskCard = ({ item, onOpen }) => {
  const isCompleted = item.status === "VERIFIED";
  const isSubmitted = !!item.submission;

  return (
    <div className="group bg-white border border-slate-200 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 relative overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
          isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
          isSubmitted ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'
        }`}>
          {item.status}
        </div>
        {isSubmitted && <CheckCircle2 className="text-emerald-500" size={20} />}
      </div>

      <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
        {item.taskItem?.title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
        {item.taskItem?.description}
      </p>

      <div className="mt-auto space-y-4">
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl">
           <span className="text-[10px] font-bold text-slate-400 uppercase">Progress</span>
           <span className="text-xs font-black text-slate-700">{item.progress}%</span>
        </div>
        
        <button onClick={onOpen} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-indigo-600 transition-all">
          <BarChart3 size={16} />
          Manage Assignment
        </button>
      </div>
    </div>
  );
};

export default EmployeeTaskPage;