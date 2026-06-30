import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../../../services/api";
import {
  Video,
  ArrowLeft,
  Edit2,
  Trash2,
  Users,
  ListTodo,
  Calendar,
  Mail,
  User,
  X,
  Check,
  Loader2,
  AlertTriangle,
  Info,
  ExternalLink,
  MapPin,
  Clock,
  Plus,
  Layers,
  Briefcase,
  UserPlus,
  Image as ImageIcon,
  Link2,
  FileText,
  VideoIcon
} from "lucide-react";

export default function ShootWorkspaceDetails() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // URL Parameter Dynamic Extractor Fallback Sequence
  const getShootId = () => {
    if (params.shootId) return params.shootId;
    if (params.id) return params.id;
    const pathSegments = location.pathname.split("/").filter(Boolean);
    return pathSegments[pathSegments.length - 1];
  };

  const shootId = getShootId();

  // Core Sync States
  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  
  // New Task Details & Subtasks State
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [isSubtaskLoading, setIsSubtaskLoading] = useState(false);

  // Interface Indicators
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modals Visibility Triggers
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [showAddSubtaskModal, setShowAddSubtaskModal] = useState(false);
  
  // Task Editing Context Layout Tracker Variables
  const [isEditTaskMode, setIsEditTaskMode] = useState(false);
  const [activeEditingTaskId, setActiveEditingTaskId] = useState(null);

  // Forms Binding Vectors
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    noOfPics: 0,
    noOfReels: 0,
    date: "",
    arrivalTime: "",
    location: "",
    setupType: "" 
  });

  // Subtask Form Binding State
  const [subtaskForm, setSubtaskForm] = useState({
    title: "",
    description: "",
    type: "REEL", // Default matching payload configuration
    videoType: "HORIZONTAL",
    referenceLinksRaw: "" // Bound via comma-separated list parser
  });

  // Core Context Aggregation Hook
  useEffect(() => {
    if (!shootId || shootId === "shoot") {
      setErrorMsg("No valid workspace ID detected in the routing sequence.");
      setIsLoading(false);
      return;
    }

    const initialFetch = async () => {
      try {
        setIsLoading(true);
        setErrorMsg("");
        
        const [workspaceRes, tasksRes] = await Promise.all([
          API.get(`/api/shoot-workspaces/${shootId}`),
          API.get(`/api/shoot-workspaces/${shootId}/tasks`)
        ]);

        if (workspaceRes.data?.success) {
          setWorkspace(workspaceRes.data.data);
          setEditForm({
            name: workspaceRes.data.data.name || "",
            description: workspaceRes.data.data.description || "",
          });
        }
        
        if (tasksRes.data?.success) {
          setTasks(tasksRes.data.data || []);
        }
      } catch (err) {
        console.error("Workspace initial data resolution failure:", err);
        setErrorMsg(err.response?.data?.message || "Operational handshake timeout context block dropped.");
      } finally {
        setIsLoading(false);
      }
    };

    initialFetch();
  }, [shootId]);

  // Lazy Execution Handler for Available Team Member Catalogs
  const handleOpenMemberModal = async () => {
    try {
      setIsActionLoading(true);
      const res = await API.get("/api/manager/my-employees");
      if (res.data?.success) {
        setAvailableEmployees(res.data.data || []);
        const existingIds = workspace?.members?.map(m => m.employeeId || m.id) || [];
        setSelectedEmployeeIds(existingIds);
        setShowMemberModal(true);
      }
    } catch (err) {
      console.error("Failed gathering organizational employees ledger profile context:", err);
      setErrorMsg("Failed to gather your employee database logs.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Submit Handler: Add Selected Members to Workspace
  const handleAddMembersSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsActionLoading(true);
      const res = await API.post(`/api/shoot-workspaces/${shootId}/members`, {
        employeeIds: selectedEmployeeIds
      });

      if (res.data?.success) {
        setWorkspace(res.data.data);
        setShowMemberModal(false);
      }
    } catch (err) {
      console.error("Team members configuration layout sync error:", err);
      setErrorMsg(err.response?.data?.message || "Could not push track allocations variables matrix.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle Selection vectors logic arrays
  const handleToggleEmployeeSelection = (empId) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  // Switch modal state over to Edit execution configurations
  const handleOpenEditTaskModal = (e, task) => {
    e.stopPropagation(); // Prevents layout bubbling down to open detail view modal pipeline
    setIsEditTaskMode(true);
    setActiveEditingTaskId(task.id);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      noOfPics: task.noOfPics || 0,
      noOfReels: task.noOfReels || 0,
      date: task.date ? task.date.split("T")[0] : "", 
      arrivalTime: task.arrivalTime || "",
      location: task.location || "",
      setupType: task.setupType || ""
    });
    setShowTaskModal(true);
  };

  // Combined Task Submission Switch Engine (Handles Creation and Patch Mutations)
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsActionLoading(true);
      setErrorMsg("");
      
      const payload = {
        ...taskForm,
        noOfPics: Number(taskForm.noOfPics),
        noOfReels: Number(taskForm.noOfReels),
        setupType: taskForm.setupType === "" ? null : taskForm.setupType
      };

      let res;
      if (isEditTaskMode) {
        res = await API.patch(`/api/shoot-workspaces/${shootId}/tasks/${activeEditingTaskId}`, payload);
      } else {
        res = await API.post(`/api/shoot-workspaces/${shootId}/tasks`, payload);
      }

      if (res.data?.success) {
        const refreshTasks = await API.get(`/api/shoot-workspaces/${shootId}/tasks`);
        if (refreshTasks.data?.success) {
          setTasks(refreshTasks.data.data || []);
        }
        closeAndResetTaskModal();
      }
    } catch (err) {
      console.error("Task mutations action processing failure mapping context:", err);
      setErrorMsg(err.response?.data?.message || "Remote database communication configuration logic exception.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const closeAndResetTaskModal = () => {
    setShowTaskModal(false);
    setIsEditTaskMode(false);
    setActiveEditingTaskId(null);
    setTaskForm({
      title: "", description: "", noOfPics: 0, noOfReels: 0,
      date: "", arrivalTime: "", location: "", setupType: ""
    });
  };

  // Open Task Detailed Information Context Panel Pipeline Row Interceptor
  const handleOpenTaskDetails = async (taskId) => {
    try {
      setIsSubtaskLoading(true);
      setShowTaskDetailsModal(true);
      
      // Concurrent fetching resolution tracking details and existing subtasks allocation arrays
      const [detailsRes, subtasksRes] = await Promise.all([
        API.get(`/api/shoot-workspaces/${shootId}/tasks/${taskId}`),
        API.get(`/api/shoot-workspaces/${shootId}/tasks/${taskId}/subtasks`)
      ]);

      if (detailsRes.data?.success) {
        setSelectedTaskDetails(detailsRes.data.data);
      }
      if (subtasksRes.data?.success) {
        setSubtasks(subtasksRes.data.data || []);
      }
    } catch (err) {
      console.error("Failed executing task details configuration compilation mapping layout:", err);
      setErrorMsg("Failed to resolve absolute target task configurations details pipeline.");
    } finally {
      setIsSubtaskLoading(false);
    }
  };

  // Submit Handler: Inject Dynamic Subtask Context Leaf Node Node
  const handleAddSubtaskSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTaskDetails?.id) return;
    try {
      setIsActionLoading(true);
      
      // Sanitizes and filters links structure safely
      const parsedLinks = subtaskForm.referenceLinksRaw
        .split(",")
        .map(link => link.trim())
        .filter(link => link.length > 0);

      const payload = {
        title: subtaskForm.title.trim(),
        description: subtaskForm.description.trim(),
        type: subtaskForm.type,
        videoType: subtaskForm.type === "REEL" ? subtaskForm.videoType : null,
        referenceLinks: parsedLinks
      };

      const res = await API.post(`/api/shoot-workspaces/${shootId}/tasks/${selectedTaskDetails.id}/subtasks`, payload);
      
      if (res.data?.success) {
        // Refresh local subtasks arrays view safely
        const refreshSubtasks = await API.get(`/api/shoot-workspaces/${shootId}/tasks/${selectedTaskDetails.id}/subtasks`);
        if (refreshSubtasks.data?.success) {
          setSubtasks(refreshSubtasks.data.data || []);
        }
        
        // Refresh root index table meta tracking flags metrics count if needed
        const refreshTasksIndex = await API.get(`/api/shoot-workspaces/${shootId}/tasks`);
        if (refreshTasksIndex.data?.success) {
          setTasks(refreshTasksIndex.data.data || []);
        }

        // Reset UI Context State
        setShowAddSubtaskModal(false);
        setSubtaskForm({ title: "", description: "", type: "REEL", videoType: "HORIZONTAL", referenceLinksRaw: "" });
      }
    } catch (err) {
      console.error("Subtask deployment verification loop execution exception:", err);
      setErrorMsg(err.response?.data?.message || "Failed pushing active layout properties node into repository matrix.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Patch Workspace Target Details Changes Inline
  const handleUpdateWorkspace = async () => {
    if (!editForm.name.trim()) return;
    try {
      setIsActionLoading(true);
      const res = await API.patch(`/api/shoot-workspaces/${shootId}`, {
        brandName: editForm.name.trim(),
        description: editForm.description.trim(),
      });

      if (res.data?.success) {
        setWorkspace(res.data.data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed patch synchronization update request:", err);
      setErrorMsg(err.response?.data?.message || "Failed to save workspace mutations.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete Core Workspace Context Layout Track Elements
  const handleDeleteWorkspace = async () => {
    try {
      setIsActionLoading(true);
      const res = await API.delete(`/api/shoot-workspaces/${shootId}`);
      if (res.data?.success) {
        setShowDeleteModal(false);
        navigate("/shoot");
      }
    } catch (err) {
      console.error("Critical error firing workspace eviction cascade:", err);
      setErrorMsg(err.response?.data?.message || "Eviction aborted due to operational validation failure.");
      setShowDeleteModal(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50/50 text-slate-800">
      
      {/* BREADCRUMB HEADER CONTROL STRIP */}
      <button
        onClick={() => navigate("/shoot")}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition mb-6 group bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition" />
        Back to Workspace Roster
      </button>

      {/* RENDER CONTROLLER BOUNDS ENGINE BLOCK */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 w-full bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-slate-500 text-sm mt-3 font-medium">Loading shoot workspace analytics...</p>
        </div>
      ) : errorMsg && !workspace ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Operational Sync Error</h3>
          <p className="text-slate-500 text-sm mt-1 mb-4">{errorMsg}</p>
          <button
            onClick={() => navigate("/shoot")}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} /> Back to Shoots
          </button>
        </div>
      ) : (
        <>
          {/* CORE IDENTITY WORKSPACE META HEADER BLOCK MODULE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 relative overflow-hidden">
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle size={14} /> {errorMsg}
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start gap-4 z-10 relative">
              <div className="flex-1 w-full">
                {isEditing ? (
                  <div className="space-y-3 max-w-2xl">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="text-xl font-bold text-slate-800 w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="Workspace Name"
                      required
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="text-sm text-slate-600 w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                      rows="2"
                      placeholder="Add workspace operational specifications..."
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleUpdateWorkspace}
                        disabled={isActionLoading || !editForm.name.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition"
                      >
                        {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({ name: workspace.name, description: workspace.description });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                        <Video size={24} />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{workspace?.name}</h1>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar size={12} /> Established on {workspace?.createdAt ? new Date(workspace.createdAt).toLocaleDateString("en-US", { dateStyle: "long" }) : ""}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm mt-4 max-w-3xl leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      {workspace?.description || "No specific guidelines provided for this shoot brand track container."}
                    </p>
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 text-slate-600 hover:text-indigo-600 font-medium text-xs rounded-xl transition"
                  >
                    <Edit2 size={14} />
                    Edit Info
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-rose-200 hover:bg-rose-50/50 text-rose-600 font-medium text-xs rounded-xl transition"
                  >
                    <Trash2 size={14} />
                    Delete Shoot
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SPLIT DATA SECTIONS VIEW OVERVIEW LAYOUT */}
          <div className="space-y-10">
            
            {/* 1. SECTOR TASK SPECIFICATIONS MODULE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ListTodo size={20} className="text-indigo-600" />
                    Shoot Workspace Tasks Index Matrix
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Production instructions and timeline configurations list. Click a task row to view details & subtasks.</p>
                </div>
                <button
                  onClick={() => {
                    setIsEditTaskMode(false);
                    setShowTaskModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-indigo-600/10 transition"
                >
                  <Plus size={14} />
                  Add Shoot Task
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-16 p-6">
                  <Info className="h-9 w-9 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-700">No Target Specifications Found</h4>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">There are no operational tasks populated into this dynamic campaign tracking index layout container framework yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/30 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-5">Task Scope Meta</th>
                        <th className="py-3 px-4">Setup Flag</th>
                        <th className="py-3 px-4">Metrics Layout</th>
                        <th className="py-3 px-4">Date Context</th>
                        <th className="py-3 px-4">Arrival</th>
                        <th className="py-3 px-4">Maps Navigation</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {tasks.map((task) => (
                        <tr 
                          key={task.id} 
                          onClick={() => handleOpenTaskDetails(task.id)}
                          className="hover:bg-indigo-50/30 transition group cursor-pointer"
                        >
                          <td className="py-4 px-5 max-w-xs">
                            <span className="font-bold text-slate-900 block tracking-tight group-hover:text-indigo-600 transition">{task.title}</span>
                            <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">{task.description || "No specifications description provided."}</span>
                            {task.subtasks?.length > 0 && (
                              <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-medium">
                                <Layers size={10} /> Contains {task.subtasks.length} subtasks nodes
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            {task.setupType ? (
                              <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                task.setupType === 'VERY_PREMIUM' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                task.setupType === 'PREMIUM' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                'bg-sky-50 text-sky-700 border border-sky-100'
                              }`}>
                                {task.setupType}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300 italic">Standard</span>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                              <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"><ImageIcon size={12} className="text-slate-400" /> {task.noOfPics} Pics</span>
                              <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"><Video size={12} className="text-slate-400" /> {task.noOfReels} Reels</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                            {task.date ? new Date(task.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : <span className="text-slate-300 italic">Unscheduled</span>}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                            {task.arrivalTime ? (
                              <div className="flex items-center gap-1"><Clock size={12} className="text-slate-400" /> {task.arrivalTime}</div>
                            ) : (
                              <span className="text-slate-300 italic">Pending</span>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {task.location ? (
                              <a
                                href={task.location}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 rounded-lg transition"
                              >
                                <MapPin size={12} />
                                Teleport Map Vector
                                <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-300 italic">No Coordinates</span>
                            )}
                          </td>
                          <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleOpenEditTaskModal(e, task)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg text-xs font-semibold transition"
                            >
                              <Edit2 size={12} />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 2. OPERATIONAL MANAGEMENT ROSTER MATRIX TEAM SECTION */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users size={20} className="text-indigo-600" />
                    Assigned Structural Team Roster Context
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Personnel logs authorized to execute operational processes within this shoot sector scope mapping.</p>
                </div>
                <button
                  onClick={handleOpenMemberModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 text-slate-600 hover:text-indigo-600 font-semibold text-xs rounded-xl transition shadow-sm bg-white"
                >
                  <UserPlus size={14} />
                  Manage Team Board
                </button>
              </div>

              {!workspace?.members || workspace.members.length === 0 ? (
                <div className="text-center py-12 p-6">
                  <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">No personnel operators assigned to this workspace configuration context structural pipeline loop.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/30 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-5">Operator Identity Profile</th>
                        <th className="py-3 px-4">Registry Registry ID</th>
                        <th className="py-3 px-4">Electronic Mail Routing Token</th>
                        <th className="py-3 px-5 text-right">Structural Role Tag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {workspace.members.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center shrink-0">
                                {member.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-800">{member.name || "Unknown Operator"}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-500">
                            {member.employeeId || <span className="text-slate-300 italic">N/A</span>}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                            {member.email}
                          </td>
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                              {member.role || "EMPLOYEE"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </>
      )}

      {/* MODAL MODULE A: TEAM ASSIGNATION SYNC INTERACTION INTERFACE */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full overflow-hidden animate-scale-up flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2 text-indigo-600">
                <Users size={20} />
                <h3 className="text-base font-bold text-slate-900">Configure Workspace Operators</h3>
              </div>
              <button onClick={() => setShowMemberModal(false)} className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddMembersSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-white">
                <p className="text-xs text-slate-400 font-medium mb-2">Select staff logs to bind authorization access arrays across this specific tracking segment:</p>
                {availableEmployees.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">No organizational logs found inside your management endpoint directories index mapping.</p>
                ) : (
                  availableEmployees.map((emp) => {
                    const identifier = emp.employeeId || emp.id;
                    const isChecked = selectedEmployeeIds.includes(identifier);
                    return (
                      <label 
                        key={emp.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer select-none ${
                          isChecked ? 'border-indigo-500 bg-indigo-50/40' : 'border-slate-200 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden pr-2">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleEmployeeSelection(identifier)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                          />
                          <div className="overflow-hidden">
                            <span className="text-sm font-bold text-slate-800 block truncate">{emp.name}</span>
                            <span className="text-[11px] text-slate-400 font-medium block truncate font-mono mt-0.5">{identifier} • {emp.position || "Staff Operator"}</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium shrink-0 bg-white px-2 py-0.5 rounded border border-slate-200">{emp.email}</span>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isActionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition"
                >
                  {isActionLoading && <Loader2 size={12} className="animate-spin" />}
                  Synchronize Board Allocations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODULE B: CAMPAIGN SHOOT TASK SPECIFICATION GENERATOR / EDITOR */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-xl w-full overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2 text-indigo-600">
                <ListTodo size={20} />
                <h3 className="text-base font-bold text-slate-900">
                  {isEditTaskMode ? "Modify Target Shoot Task Context" : "Compile Target Shoot Task Context"}
                </h3>
              </div>
              <button onClick={closeAndResetTaskModal} className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition"><X size={18} /></button>
            </div>

            <form onSubmit={handleTaskSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-white grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Task Title Core Header</label>
                  <input 
                    type="text" required
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    placeholder="e.g., Campaign Shoot Plan Alpha"
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/40"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Description Parameters</label>
                  <textarea 
                    rows="2"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                    placeholder="Provide execution guidelines and equipment details requirements arrays..."
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/40 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Pictures Target Metrics Count</label>
                  <input 
                    type="number" min="0" required
                    value={taskForm.noOfPics}
                    onChange={(e) => setTaskForm({...taskForm, noOfPics: e.target.value})}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/40"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Reels Target Metrics Count</label>
                  <input 
                    type="number" min="0" required
                    value={taskForm.noOfReels}
                    onChange={(e) => setTaskForm({...taskForm, noOfReels: e.target.value})}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/40"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Calendar Execution Target Date</label>
                  <input 
                    type="date"
                    value={taskForm.date}
                    onChange={(e) => setTaskForm({...taskForm, date: e.target.value})}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/40 text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Call Target Arrival Time</label>
                  <input 
                    type="time"
                    value={taskForm.arrivalTime}
                    onChange={(e) => setTaskForm({...taskForm, arrivalTime: e.target.value})}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/40 text-slate-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Live Set Map Coordinates Navigation Hyperlink</label>
                  <input 
                    type="url"
                    value={taskForm.location}
                    onChange={(e) => setTaskForm({...taskForm, location: e.target.value})}
                    placeholder="https://maps.google.com/..."
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/40"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Workspace Setup Matrix Variant Flag</label>
                  <select
                    value={taskForm.setupType || ""}
                    onChange={(e) => setTaskForm({...taskForm, setupType: e.target.value})}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/40 text-slate-700"
                  >
                    <option value="">Standard Base Config (Null Mapping Value)</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="VERY_PREMIUM">VERY_PREMIUM</option>
                    <option value="PHONE">PHONE</option>
                  </select>
                </div>

              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <button type="button" onClick={closeAndResetTaskModal} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isActionLoading}
                  className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition"
                >
                  {isActionLoading && <Loader2 size={12} className="animate-spin" />}
                  {isEditTaskMode ? "Update Changes" : "Publish Context Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODULE C: DANGER ZONE DELETION VERIFICATION DOCK */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-6 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Shoot Deletion</h3>
            </div>
            
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Are you absolutely certain you want to tear down <strong>{workspace?.name}</strong>? This structural change is irreversible and will drop all associated production workflows and tasks indices.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button" disabled={isActionLoading}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button" disabled={isActionLoading}
                onClick={handleDeleteWorkspace}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition"
              >
                {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODULE D: TASK COMPREHENSIVE VIEW & SUBTASK INDEX DRAWER */}
      {showTaskDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-3xl w-full overflow-hidden animate-scale-up flex flex-col max-h-[85vh]">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="space-y-1">
                <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Operational Context Node
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {isSubtaskLoading ? "Fetching Track Profile..." : selectedTaskDetails?.title}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowTaskDetailsModal(false);
                  setSelectedTaskDetails(null);
                  setSubtasks([]);
                }} 
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-white">
              {isSubtaskLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                  <p className="text-xs text-slate-400 mt-2 font-medium">Resolving task profile logs matrix...</p>
                </div>
              ) : (
                <>
                  {/* Meta Grid Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block">Pictures Target</span>
                      <span className="text-slate-800 font-bold flex items-center gap-1 mt-0.5"><ImageIcon size={12} className="text-slate-400" /> {selectedTaskDetails?.noOfPics} Units</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Reels Target</span>
                      <span className="text-slate-800 font-bold flex items-center gap-1 mt-0.5"><Video size={12} className="text-slate-400" /> {selectedTaskDetails?.noOfReels} Units</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Timeline Segment</span>
                      <span className="text-slate-800 font-bold mt-0.5 block">{selectedTaskDetails?.date ? new Date(selectedTaskDetails.date).toLocaleDateString() : "Pending"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Arrival Slot</span>
                      <span className="text-slate-800 font-bold mt-0.5 block">{selectedTaskDetails?.arrivalTime || "N/A"}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Task Description Specification</h4>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/40 border border-slate-100 p-3 rounded-xl">
                      {selectedTaskDetails?.description || "No specific parameters detailed for this leaf configuration context."}
                    </p>
                  </div>

                  {/* Subtasks Component Core Workspace Section */}
                  <div className="border-t border-slate-100 pt-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Layers size={16} className="text-indigo-600" />
                          Subtask Specifications Roster
                        </h4>
                        <p className="text-[11px] text-slate-400">Atomic functional tasks targets allocations tracking array indicators.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddSubtaskModal(true)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition"
                      >
                        <Plus size={12} /> Add Subtask Node
                      </button>
                    </div>

                    {subtasks.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                        <FileText className="h-7 w-7 text-slate-300 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-400 font-medium">No active subtasks mapped across this execution node pipeline layer framework loop.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {subtasks.map((sub) => (
                          <div key={sub.id} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-100 shadow-sm transition">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="text-sm font-bold text-slate-800 tracking-tight">{sub.title}</h5>
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                    sub.type === "REEL" ? "bg-purple-50 text-purple-700 border border-purple-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                                  }`}>
                                    {sub.type} {sub.videoType ? `• ${sub.videoType}` : ""}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 leading-normal">{sub.description || "No descriptions specified for this structural branch node item."}</p>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                                {sub.id.split("-")[0]}...
                              </span>
                            </div>

                            {/* Reference Links Vectors Section inside subtask box layout template */}
                            {sub.referenceLinks?.length > 0 && (
                              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0"><Link2 size={10} /> Reference Links Matrix:</span>
                                {sub.referenceLinks.map((link, idx) => (
                                  <a 
                                    key={idx} href={link} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 text-slate-600 hover:text-indigo-600 px-2 py-0.5 rounded transition font-medium truncate max-w-[160px]"
                                  >
                                    URL Vector {idx + 1} <ExternalLink size={8} />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                type="button" 
                onClick={() => {
                  setShowTaskDetailsModal(false);
                  setSelectedTaskDetails(null);
                  setSubtasks([]);
                }} 
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition bg-white"
              >
                Close Analytical Drawer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL MODULE E: SUBTASK SPECIFICATION BUILDER INTERACTION LAYER */}
      {showAddSubtaskModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up flex flex-col">
            
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-1.5 text-indigo-600">
                <Plus size={16} />
                <h4 className="text-sm font-bold text-slate-900">Inject Subtask Branch Parameters</h4>
              </div>
              <button onClick={() => setShowAddSubtaskModal(false)} className="p-1 text-slate-400 hover:text-slate-600 transition"><X size={16} /></button>
            </div>

            <form onSubmit={handleAddSubtaskSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Subtask Title Core</label>
                <input 
                  type="text" required
                  value={subtaskForm.title}
                  onChange={(e) => setSubtaskForm({...subtaskForm, title: e.target.value})}
                  placeholder="e.g., Close-up dynamic product reel setup"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/40 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Functional Guidelines Description</label>
                <textarea 
                  rows="2"
                  value={subtaskForm.description}
                  onChange={(e) => setSubtaskForm({...subtaskForm, description: e.target.value})}
                  placeholder="Map clear production guidelines step specifications requirements matrices..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/40 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Production Type Scope</label>
                  <select
                    value={subtaskForm.type}
                    onChange={(e) => setSubtaskForm({...subtaskForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/40 text-slate-700 font-medium"
                  >
                    <option value="REEL">REEL</option>
                    <option value="IMAGE">IMAGE</option>
                    <option value="VIDEO">VIDEO</option>
                  </select>
                </div>

                {subtaskForm.type === "REEL" && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Video Aspect Variant Layout</label>
                    <select
                      value={subtaskForm.videoType}
                      onChange={(e) => setSubtaskForm({...subtaskForm, videoType: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/40 text-slate-700 font-medium"
                    >
                      <option value="HORIZONTAL">HORIZONTAL</option>
                      <option value="VERTICAL">VERTICAL</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Reference Asset Links Matrix (Comma Separated)</label>
                <input 
                  type="text"
                  value={subtaskForm.referenceLinksRaw}
                  onChange={(e) => setSubtaskForm({...subtaskForm, referenceLinksRaw: e.target.value})}
                  placeholder="https://example.com/asset1, https://example.com/asset2"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/40 text-sm"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowAddSubtaskModal(false)} className="px-3 py-1.5 font-semibold text-slate-600 hover:text-slate-800 transition">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isActionLoading}
                  className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition"
                >
                  {isActionLoading && <Loader2 size={10} className="animate-spin" />}
                  Deploy branch node
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}