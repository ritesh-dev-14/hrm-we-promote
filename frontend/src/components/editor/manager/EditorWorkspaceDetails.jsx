import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../../../services/api'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Loader2, 
  Link2, 
  AlertCircle, 
  Layers, 
  ExternalLink,
  TrendingUp,
  User2,
  Plus,
  X,
  FileText,
  Briefcase,
  UserCheck,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

const EditorWorkspaceDetails = () => {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  
  // Core States
  const [workspace, setWorkspace] = useState(null)
  const [subtasks, setSubtasks] = useState([])
  const [employees, setAvailableEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Interactive UI Layer Controllers
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedSubtask, setSelectedSubtask] = useState(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  
  // Verification loading tracker
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Rejection Workflow State Module
  const [rejectModal, setRejectModal] = useState({
    open: false,
    subtaskId: null,
    reason: ""
  })

  // Subtask Form Data Initial Bind Vectors
  const [subtaskForm, setSubtaskForm] = useState({
    title: '',
    employeeId: '',
    dueDate: '',
    priority: 'MEDIUM',
    description: '',
    status: 'DRAFT',
    referenceLink: '',
    rawDataLink: ''
  })

  useEffect(() => {
    if (workspaceId) {
      initialWorkspaceHandshake()
    }
  }, [workspaceId])

  const initialWorkspaceHandshake = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [workspaceRes, subtasksRes, employeesRes] = await Promise.all([
        API.get(`/api/manager/tasks/${workspaceId}`),
        API.get(`/api/task-items/${workspaceId}`),
        API.get('/api/manager/my-employees').catch(() => ({ data: { success: true, data: [] } })) 
      ])

      if (workspaceRes.data?.success) {
        setWorkspace(workspaceRes.data.data)
      }
      
      if (subtasksRes.data?.success) {
        setSubtasks(subtasksRes.data.data || [])
      }

      if (employeesRes.data?.success) {
        setAvailableEmployees(employeesRes.data.data || [])
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error occurred communicating with core dataset system.')
    } finally {
      setLoading(false)
    }
  }

  const refreshSubtaskIndex = async () => {
    try {
      const subtasksRes = await API.get(`/api/task-items/${workspaceId}`)
      if (subtasksRes.data?.success) {
        setSubtasks(subtasksRes.data.data || [])
        
        // Dynamic structural synchronizer for open modal view state updates
        if (selectedSubtask) {
          const freshSubtask = (subtasksRes.data.data || []).find(item => item.id === selectedSubtask.id)
          if (freshSubtask) setSelectedSubtask(freshSubtask)
        }
      }
      const workspaceRes = await API.get(`/api/manager/tasks/${workspaceId}`)
      if (workspaceRes.data?.success) {
        setWorkspace(workspaceRes.data.data)
      }
    } catch (err) {
      console.error("Subtask refresh operation failed:", err)
    }
  }

  const handleFormInputChange = (e) => {
    const { name, value } = e.target
    setSubtaskForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubtaskSubmission = async (e) => {
    e.preventDefault()
    if (!subtaskForm.title.trim() || !subtaskForm.employeeId) return

    try {
      setIsActionLoading(true)
      const payload = {
        ...subtaskForm,
        title: subtaskForm.title.trim(),
        description: subtaskForm.description.trim(),
        dueDate: subtaskForm.dueDate ? new Date(subtaskForm.dueDate).toISOString() : null,
        referenceLink: subtaskForm.referenceLink.trim() || null,
        rawDataLink: subtaskForm.rawDataLink.trim() || null
      }

      const res = await API.post(`/api/task-items/${workspaceId}`, payload)
      if (res.data?.success) {
        setShowAddModal(false)
        setSubtaskForm({
          title: '', employeeId: '', dueDate: '', priority: 'MEDIUM',
          description: '', status: 'DRAFT', referenceLink: '', rawDataLink: ''
        })
        await refreshSubtaskIndex()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed pushing asset tracking criteria data to remote stream.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleApproveSubmission = async (subtaskId) => {
    try {
      setActionLoadingId(subtaskId)
      // Check if target requires routing via explicit submission ID context or core subtask ID reference
      await API.patch(`/api/task-item-submission/${subtaskId}/verify`)
      await refreshSubtaskIndex()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || "Verification mapping phase failed")
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRejectSubmission = async () => {
    try {
      if (!rejectModal.reason.trim()) {
        alert("Rejection validation reason parameters are required")
        return
      }

      setActionLoadingId(rejectModal.subtaskId)
      await API.patch(`/api/task-item-submission/${rejectModal.subtaskId}/reject`, {
        rejectionReason: rejectModal.reason.trim(),
      })

      setRejectModal({ open: false, subtaskId: null, reason: "" })
      await refreshSubtaskIndex()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || "Rejection logic deployment sequence failure")
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleOpenRowDetails = (item) => {
    setSelectedSubtask(item)
    setShowDetailsModal(true)
  }

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-rose-50 text-rose-700 border-rose-100'
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-100'
      case 'LOW': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      default: return 'bg-slate-50 text-slate-600 border-slate-200'
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'ACTIVE': 
      case 'ASSIGNED': return 'bg-indigo-50 text-indigo-700 border-indigo-100'
      case 'SUBMITTED': return 'bg-violet-50 text-violet-700 border-violet-100 font-bold'
      case 'VERIFIED':
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-100'
      default: return 'bg-slate-50 text-slate-600 border-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] space-y-3 bg-slate-50/40">
        <Loader2 className="w-9 h-9 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500 tracking-tight">Defragmenting subtask structural nodes...</p>
      </div>
    )
  }

  if (error || !workspace) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-white border border-rose-200 text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <p className="text-slate-800 font-bold text-sm mb-4">{error || 'Workspace index target not found.'}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
        >
          Return to Hub Grid
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans text-slate-800">
      
      {/* HEADER CONTROLS VIEW STRIP */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Matrix Pipeline
        </button>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Inject Subtask Element
        </button>
      </div>

      {/* PARENT WORKSPACE SUMMARY SPECS SHEET CARD */}
      <div className="max-w-6xl mx-auto mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-slate-100 border border-slate-200 text-slate-700 rounded-md">
              {workspace.status || 'Active Config'}
            </span>
            <span className="text-slate-300 font-light">|</span>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
              <User2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Manager Context: <strong className="text-slate-600">{workspace.createdBy?.name || 'Recruiter'}</strong></span>
            </div>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{workspace.projectName}</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{workspace.description || 'No specialized description parameters attached.'}</p>
        </div>

        <div className="bg-slate-50/70 rounded-xl border border-slate-200/60 p-4 space-y-3.5 text-xs font-medium">
          <div className="flex items-center justify-between text-slate-500">
            <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Target Horizon</span>
            <span className="text-slate-800 font-bold">
              {workspace.endDate ? new Date(workspace.endDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'No Target Set'}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span className="inline-flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Task Completion Engine</span>
              <span className="text-indigo-600 font-bold">{workspace.progress || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${workspace.progress || 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* HIGH QUALITY SUBTASK TABULAR MATRIX VIEW INDEX */}
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between pl-1">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" /> Operational Subtask Matrix Breakdown
          </h3>
          <span className="text-xs text-slate-400 font-medium">Total Entries: <strong>{subtasks.length}</strong></span>
        </div>

        {subtasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center shadow-2xs">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No active subtask operations mapped yet</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-0.5">Click the "Inject Subtask Element" button above to register an operational assignment blueprint loop.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-5">Subtask Specification</th>
                    <th className="py-3.5 px-4">Assigned Personnel</th>
                    <th className="py-3.5 px-4 text-center">Priority</th>
                    <th className="py-3.5 px-4">Lifecycle Status</th>
                    <th className="py-3.5 px-4">Due Target Horizon</th>
                    <th className="py-3.5 px-5 text-right">Action Trace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {subtasks.map((item) => (
                    <tr 
                      key={item.id}
                      onClick={() => handleOpenRowDetails(item)}
                      className="hover:bg-slate-50/60 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-5 max-w-xs">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors block text-sm truncate">{item.title}</span>
                        <span className="text-slate-400 block text-[11px] truncate mt-0.5">{item.description || 'No specialized description.'}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 font-bold border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] uppercase shrink-0">
                            {item.assignedToEmployee?.name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">{item.assignedToEmployee?.name || 'Unassigned'}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{item.assignedToEmployee?.employeeId || '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold border rounded-md uppercase ${getPriorityStyle(item.priority)}`}>
                          {item.priority || 'MEDIUM'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold border rounded-md uppercase ${getStatusStyle(item.status)}`}>
                          {item.status || 'DRAFT'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold whitespace-nowrap">
                        {item.dueDate ? (
                          <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date(item.dueDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</div>
                        ) : <span className="text-slate-300 italic">Unscheduled</span>}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap text-indigo-600 font-bold" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {item.status === "SUBMITTED" && (
                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shadow-2xs">
                              <button
                                disabled={actionLoadingId !== null}
                                onClick={() => handleApproveSubmission(item.id)}
                                className="p-1.5 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-200 shadow-3xs transition"
                              >
                                {actionLoadingId === item.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <ThumbsUp size={13} />
                                )}
                              </button>
                              <button
                                disabled={actionLoadingId !== null}
                                onClick={() => setRejectModal({ open: true, subtaskId: item.id, reason: "" })}
                                className="p-1.5 bg-white text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 shadow-3xs transition"
                              >
                                <ThumbsDown size={13} />
                              </button>
                            </div>
                          )}
                          <button 
                            onClick={() => handleOpenRowDetails(item)}
                            className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform text-xs px-2 py-1 hover:bg-slate-50 rounded-lg"
                          >
                            View Details →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL MODULE A: SUBTASK INJECTION SPECIFICATION BUILDER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Deploy Structural Subtask Node</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Initialize an atomic task assignment map vector payload.</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubtaskSubmission} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Subtask Title Header</label>
                <input 
                  type="text" name="title" required
                  placeholder="e.g., Color Grading & Asset Synchronization"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 transition"
                  value={subtaskForm.title}
                  onChange={handleFormInputChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Production Employee</label>
                  <select
                    name="employeeId" required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-2 text-xs font-bold text-slate-600"
                    value={subtaskForm.employeeId}
                    onChange={handleFormInputChange}
                  >
                    <option value="">Select Target Staff</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.employeeId}>{emp.name} ({emp.position || 'Editor'})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Horizon Due Date</label>
                  <input 
                    type="date" name="dueDate" required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-1.5 text-xs font-medium text-slate-600"
                    value={subtaskForm.dueDate}
                    onChange={handleFormInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority Tier Ranking</label>
                  <select
                    name="priority"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-2 text-xs font-bold text-slate-600"
                    value={subtaskForm.priority}
                    onChange={handleFormInputChange}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Sequence Lifecycle State</label>
                  <select
                    name="status"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-2 text-xs font-bold text-slate-600"
                    value={subtaskForm.status}
                    onChange={handleFormInputChange}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Guidelines Description Requirements</label>
                <textarea 
                  name="description" rows={2}
                  placeholder="Detail step specifications constraints array parameters requirements..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 resize-none transition"
                  value={subtaskForm.description}
                  onChange={handleFormInputChange}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Layout Reference Cloud Link (Optional)</label>
                <input 
                  type="url" name="referenceLink"
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 transition"
                  value={subtaskForm.referenceLink}
                  onChange={handleFormInputChange}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Raw Media Directory Datasets Link (Optional)</label>
                <input 
                  type="url" name="rawDataLink"
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 transition"
                  value={subtaskForm.rawDataLink}
                  onChange={handleFormInputChange}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button" disabled={isActionLoading}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isActionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  {isActionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Publish Subtask
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODULE B: SUBTASK DRILL-DOWN ANALYTICAL SPECIFICATIONS VIEWER */}
      {showDetailsModal && selectedSubtask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transform scale-100 transition-all flex flex-col">
            
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
              <div className="space-y-1">
                <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 uppercase tracking-wider rounded-md">
                  Drill-Down Inspection Panel
                </span>
                <h3 className="font-bold text-slate-900 text-base tracking-tight pt-0.5">{selectedSubtask.title}</h3>
              </div>
              <button 
                onClick={() => { setShowDetailsModal(false); setSelectedSubtask(null); }}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs overflow-y-auto max-h-[70vh]">
              {/* Core Meta Properties Badge Strip */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl text-slate-600 font-medium">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Priority Level</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] border uppercase font-bold mt-1 ${getPriorityStyle(selectedSubtask.priority)}`}>
                    {selectedSubtask.priority || 'NORMAL'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Lifecycle Tracking</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] border uppercase font-bold mt-1 ${getStatusStyle(selectedSubtask.status)}`}>
                    {selectedSubtask.status || 'DRAFT'}
                  </span>
                </div>
              </div>

              {/* Assignment Personnel Block */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> Operations Operator Assignment</h4>
                <div className="p-3 bg-slate-50/50 border border-slate-200/60 rounded-xl flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs shadow-2xs">
                    {selectedSubtask.assignedToEmployee?.name?.charAt(0).toUpperCase() || 'E'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">{selectedSubtask.assignedToEmployee?.name || 'No assigned operator detected.'}</span>
                    <span className="text-slate-400 font-mono text-[11px] block mt-0.5">
                      Registry Token: {selectedSubtask.assignedToEmployee?.employeeId || '—'} • {selectedSubtask.assignedToEmployee?.email || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deadline & Progress Frame */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Due Target Horizon</h4>
                  <div className="p-3 bg-slate-50/50 border border-slate-200/60 rounded-xl font-bold text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{selectedSubtask.dueDate ? new Date(selectedSubtask.dueDate).toLocaleString('en-US', {dateStyle: 'medium'}) : 'Pending Sequence Calendar Block'}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Progress Evaluation</h4>
                  <div className="p-3 bg-slate-50/50 border border-slate-200/60 rounded-xl font-bold text-indigo-600 flex items-center justify-between">
                    <span>Task Completion Node Metric:</span>
                    <span>{selectedSubtask.progress ?? 0}%</span>
                  </div>
                </div>
              </div>

              {/* Description Block */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Scope Specifications Requirements</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/30 border border-slate-100 p-3.5 rounded-xl whitespace-pre-wrap">
                  {selectedSubtask.description || 'No specialized description parameters attached across this workspace node element.'}
                </p>
              </div>

              {/* Resource Repositories Links Deployment Frame */}
              {(selectedSubtask.referenceLink || selectedSubtask.rawDataLink) && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cloud Data Directories Links Map Vectors</h4>
                  <div className="space-y-2">
                    {selectedSubtask.referenceLink && (
                      <a 
                        href={selectedSubtask.referenceLink} target="_blank" rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/40 hover:bg-indigo-50 border border-indigo-100/50 text-indigo-700 font-bold transition-all group"
                      >
                        <span className="flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5 text-indigo-400" /> Asset Reference Directory Location</span>
                        <ExternalLink className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    )}
                    {selectedSubtask.rawDataLink && (
                      <a 
                        href={selectedSubtask.rawDataLink} target="_blank" rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100/50 text-emerald-700 font-bold transition-all group"
                      >
                        <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-emerald-400" /> Raw Media Footage Storage Repository</span>
                        <ExternalLink className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Verification Control Section directly in the drilldown panel */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-2 justify-between items-center">
              <div>
                {selectedSubtask.status === "SUBMITTED" && (
                  <span className="text-[11px] font-medium text-slate-400">Actions Pending Manager Approval</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedSubtask.status === "SUBMITTED" && (
                  <>
                    <button
                      disabled={actionLoadingId !== null}
                      onClick={() => handleApproveSubmission(selectedSubtask.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                    >
                      {actionLoadingId === selectedSubtask.id ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={12} />}
                      Approve
                    </button>
                    <button
                      disabled={actionLoadingId !== null}
                      onClick={() => setRejectModal({ open: true, subtaskId: selectedSubtask.id, reason: "" })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition"
                    >
                      <ThumbsDown size={12} />
                      Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => { setShowDetailsModal(false); setSelectedSubtask(null); }}
                  className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs hover:bg-slate-50 transition"
                >
                  Dismiss Analysis View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL FORM BLOCK */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900">Reject Subtask Verification Element</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Provide detailed validation discrepancy metrics mapping constraints mismatch parameters.</p>
            </div>

            <div className="p-5">
              <textarea
                placeholder="Detail asset validation issues context requirements..."
                value={rejectModal.reason}
                onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full min-h-[120px] p-3 bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl outline-none focus:border-rose-500 resize-none text-slate-800 transition"
              />
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
              <button
                onClick={() => setRejectModal({ open: false, subtaskId: null, reason: "" })}
                className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmission}
                disabled={actionLoadingId === rejectModal.subtaskId}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {actionLoadingId === rejectModal.subtaskId ? <Loader2 size={12} className="animate-spin" /> : null}
                Confirm Rejection Node
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default EditorWorkspaceDetails