import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../services/api';

const HRManagerView = ({ projectId }) => {
  const navigate = useNavigate();

  // State Management
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit Form State
  const [formData, setFormData] = useState({
    description: '',
    endDate: '',
    frequency: '',
    renewalDate: '',
    assignTo: [] 
  });

  // 1. Fetch Project Details
  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.get(`/api/projects/${projectId}`);
      const resData = response.data ? response.data : response;

      if (resData && resData.success) {
        const projectData = resData.data;
        setProject(projectData);
        
        setFormData({
          description: projectData?.description || '',
          endDate: projectData?.endDate ? projectData.endDate.split('T')[0] : '',
          frequency: projectData?.frequency || 'monthly',
          renewalDate: projectData?.renewalDate ? projectData.renewalDate.split('T')[0] : '',
          assignTo: projectData?.assignments?.map(a => a?.manager?.employeeId).filter(Boolean) || []
        });
      } else {
        setError(resData?.message || 'Failed to fetch project details.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    } else {
      setError("No project ID passed to this component view.");
      setLoading(false);
    }
  }, [projectId]);

  // Handle Text/Select Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Multi-select for assignments
  const handleAssigneeChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, assignTo: selectedValues }));
  };

  // 2. Update Project API
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        description: formData.description,
        frequency: formData.frequency,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        renewalDate: formData.renewalDate ? new Date(formData.renewalDate).toISOString() : null,
        assignTo: formData.assignTo
      };

      // Force explicitly defining JSON Headers to bypass routing proxies
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      try {
        // Attempt clean PUT operation first
        await API.put(`/api/projects/${projectId}`, payload, config);
      } catch (putError) {
        // Fallback: If backend was built using PATCH instead of PUT, try PATCH automatically
        if (putError.response?.status === 404) {
          console.warn("PUT route returned 404, attempting fallback to PATCH method...");
          await API.patch(`/api/projects/${projectId}`, payload, config);
        } else {
          throw putError;
        }
      }
      
      setIsEditing(false);
      fetchProjectDetails(); 
      alert('Project updated successfully!');
    } catch (err) {
      console.error("Update request failure diagnostic logs:", err);
      alert(err.response?.data?.message || err.message || 'Failed to update project. Verify backend route methods.');
    }
  };

  // 3. Delete Project API
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await API.delete(`/api/projects/${projectId}`);
        alert('Project deleted successfully.');
        navigate('/projects'); 
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Failed to delete project.');
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#64748b', marginTop: '12px' }}>Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.errorCard}>
          <strong>Error Encountered</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Upper Navigation Metadata Badge */}
      <div style={styles.metaRow}>
        <span style={styles.idBadge}>ID: {project?.id?.slice(0, 8)}...</span>
        <span style={styles.deptBadge}>{project?.department?.name || 'General'}</span>
      </div>

      {/* Main Header Action Area */}
      <div style={styles.header}>
        <h1 style={styles.title}>{project?.projectName || 'Unnamed Project'}</h1>
        <div style={styles.actionButtonGroup}>
          <button 
            type="button"
            style={isEditing ? styles.cancelBtn : styles.editBtn} 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Project'}
          </button>
          {!isEditing && (
            <button type="button" style={styles.deleteBtn} onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        /* ================= EDIT MODE FORM ================= */
        <form onSubmit={handleUpdate} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Project Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              style={styles.textarea}
              rows="4"
              placeholder="Provide clear scopes and requirements..."
            />
          </div>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Frequency</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                style={styles.input}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
              <label style={styles.label}>Renewal Date</label>
              <input
                type="date"
                name="renewalDate"
                value={formData.renewalDate}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Assign Managers <span style={{fontWeight:'normal', fontSize:'12px', color:'#64748b'}}>(Hold Ctrl/Cmd to select multiple)</span></label>
            <select
              multiple
              value={formData.assignTo}
              onChange={handleAssigneeChange}
              style={{ ...styles.input, height: '110px', padding: '6px' }}
            >
              <option value="SM-MGR-001">Lovprit (Social Media Manager)</option>
              <option value="CC-MGR-001">Abhijeet (Content & Creative Manager)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" style={styles.saveBtn}>Save Project Details</button>
          </div>
        </form>
      ) : (
        /* ================= DISPLAY VIEW MODE ================= */
        <div>
          <div style={styles.descriptionBox}>
            <h4 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project Overview</h4>
            <p style={{ margin: 0, color: '#475569', lineHeight: '1.6' }}>{project?.description || 'No descriptive overview provided for this active timeline.'}</p>
          </div>

          <div style={styles.detailsGrid}>
            <div style={styles.infoTile}>
              <svg style={styles.tileIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                <span style={styles.tileLabel}>Update Frequency</span>
                <span style={styles.tileValue}>{project?.frequency}</span>
              </div>
            </div>

            <div style={styles.infoTile}>
              <svg style={styles.tileIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <div>
                <span style={styles.tileLabel}>Project Start Date</span>
                <span style={styles.tileValue}>{project?.startDate ? new Date(project.startDate).toLocaleDateString(undefined, {dateStyle: 'medium'}) : 'N/A'}</span>
              </div>
            </div>

            <div style={styles.infoTile}>
              <svg style={styles.tileIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              <div>
                <span style={styles.tileLabel}>Target End Date</span>
                <span style={styles.tileValue}>{project?.endDate ? new Date(project.endDate).toLocaleDateString(undefined, {dateStyle: 'medium'}) : 'N/A'}</span>
              </div>
            </div>

            <div style={styles.infoTile}>
              <svg style={styles.tileIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.213 6H16"></path></svg>
              <div>
                <span style={styles.tileLabel}>Renewal Review</span>
                <span style={styles.tileValue}>{project?.renewalDate ? new Date(project.renewalDate).toLocaleDateString(undefined, {dateStyle: 'medium'}) : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <h3 style={styles.sectionHeading}>Assigned Team Managers</h3>
            {project?.assignments?.length > 0 ? (
              <div style={styles.managerGrid}>
                {project.assignments.map((assignment) => (
                  <div key={assignment.id} style={styles.managerCard}>
                    <div style={styles.avatar}>{assignment.manager?.name?.charAt(0) || 'M'}</div>
                    <div>
                      <div style={styles.mgrName}>{assignment.manager?.name}</div>
                      <div style={styles.mgrRole}>{assignment.manager?.position || 'Project Lead'}</div>
                      <div style={styles.mgrId}>ID: {assignment.manager?.employeeId}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>No management structures assigned yet.</div>
            )}
          </div>

          <div style={styles.footerContainer}>
            <span>Created by: <strong>{project?.createdBy?.name || 'System'}</strong> ({project?.createdBy?.role || 'Admin'})</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* Modern UI System Styling */
const styles = {
  container: { maxWidth: '850px', margin: '40px auto', padding: '32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9' },
  centerContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '350px', fontFamily: 'sans-serif' },
  metaRow: { display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' },
  idBadge: { backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' },
  deptBadge: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '20px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: 0 },
  actionButtonGroup: { display: 'flex', gap: '10px', flexShrink: 0 },
  
  editBtn: { backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  cancelBtn: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  deleteBtn: { backgroundColor: '#fff', color: '#ef4444', border: '1px solid #fca5a5', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  saveBtn: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  
  descriptionBox: { backgroundColor: '#f8fafc', borderLeft: '4px solid #cbd5e1', padding: '16px', borderRadius: '0 8px 8px 0', marginBottom: '24px' },
  detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' },
  infoTile: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff' },
  tileIcon: { width: '22px', height: '22px', color: '#94a3b8' },
  tileLabel: { display: 'block', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' },
  tileValue: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginTop: '2px', textTransform: 'capitalize' },
  
  sectionHeading: { fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' },
  managerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' },
  managerCard: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' },
  mgrName: { fontSize: '14px', fontWeight: '600', color: '#1e293b' },
  mgrRole: { fontSize: '12px', color: '#64748b', marginTop: '1px' },
  mgrId: { fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', marginTop: '3px' },
  emptyState: { padding: '20px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '8px', fontSize: '14px' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
  input: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#334155', outline: 'none' },
  textarea: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#334155', outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  
  footerContainer: { marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' },
  errorCard: { padding: '16px 24px', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '4px', color: '#991b1b' },
  spinner: { width: '32px', height: '32px', border: '3px solid #f3f3f3', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};

export default HRManagerView;