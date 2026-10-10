import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Briefcase, MapPin, DollarSign } from 'lucide-react';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment, fetchJobListings } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import './ListView.css';

const DepartmentsList = ({ onViewChange }) => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'super-admin';
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [editingDeptId, setEditingDeptId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deptForm, setDeptForm] = useState({ name: '', description: '' });
    
    // Details Modal State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedDeptForDetails, setSelectedDeptForDetails] = useState(null);
    const [deptJobs, setDeptJobs] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const hasPermission = (p) => isSuperAdmin || (user?.permissions || []).includes(p);

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            setIsLoading(true);
            const data = await fetchDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Failed to load departments', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClick = () => {
        setModalMode('create');
        setDeptForm({ name: '', description: '' });
        setIsModalOpen(true);
    };

    const handleEditClick = (dept) => {
        setModalMode('edit');
        setEditingDeptId(dept.id);
        setDeptForm({ name: dept.name, description: dept.description || '' });
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        try {
            await deleteDepartment(id);
            setDepartments(departments.filter(dept => dept.id !== id));
        } catch (error) {
            alert('Failed to delete department');
        }
    };

    const handleDetailsClick = async (dept) => {
        setSelectedDeptForDetails(dept);
        setIsDetailsModalOpen(true);
        setIsLoadingDetails(true);
        try {
            const jobs = await fetchJobListings();
            setDeptJobs(jobs.filter(j => j.department_id === dept.id && j.status !== 'template'));
        } catch (error) {
            console.error('Failed to load jobs for department', error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleDeptSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (modalMode === 'create') {
                await createDepartment(deptForm);
            } else {
                await updateDepartment(editingDeptId, deptForm);
            }
            setIsModalOpen(false);
            loadDepartments();
        } catch (error) {
            alert(`Error ${modalMode === 'create' ? 'creating' : 'updating'} department`);
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) return <div className="loading">Loading departments...</div>;

    const showActionsColumn = hasPermission('departments.edit') || hasPermission('departments.delete');

    return (
        <div className="list-container">
            <div className="list-header">
                <div>
                    <h1>Departments</h1>
                    <p>Manage your company departments and organization structure.</p>
                </div>
                {hasPermission('departments.create') && (
                    <button className="btn-primary" onClick={handleCreateClick}>
                        <Plus size={18} /> Create Department
                    </button>
                )}
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Department</th>
                        <th>Description</th>
                        <th>Active Jobs</th>
                        <th>Timeline</th>
                        {showActionsColumn && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {departments.length > 0 ? (
                        departments.map(dept => (
                            <tr key={dept.id}>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>{dept.name}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: #{dept.id}</span>
                                    </div>
                                </td>
                                <td style={{ maxWidth: '300px' }}>
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {dept.description || 'No description provided.'}
                                    </p>
                                </td>
                                <td>
                                    <span className="status-badge active" style={{ borderRadius: '8px' }}>
                                        {dept.job_listings_count || 0} Positions
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>{new Date(dept.created_at).toLocaleDateString()}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Created</span>
                                    </div>
                                </td>
                                {showActionsColumn && (
                                    <td className="actions-cell">
                                        <button className="action-btn" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }} onClick={() => handleDetailsClick(dept)} title="View Details">
                                            <Eye size={16} />
                                        </button>
                                        {hasPermission('departments.edit') && (
                                            <button className="action-btn edit" onClick={() => handleEditClick(dept)} title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                        {hasPermission('departments.delete') && (
                                            <button className="action-btn delete" onClick={() => handleDeleteClick(dept.id)} title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={showActionsColumn ? "5" : "4"} className="empty-row">
                                <div className="empty-state-content">
                                    <div className="empty-state-icon">
                                        <Plus size={32} />
                                    </div>
                                    <h3>No departments added yet</h3>
                                    <p>Organization structure begins with departments.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Create New Department" : "Edit Department"}>
                <form onSubmit={handleDeptSubmit}>
                    <div className="form-group">
                        <label>Department Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={deptForm.name}
                            onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                            placeholder="e.g. Engineering"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className="form-control"
                            value={deptForm.description}
                            onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                            placeholder="Briefly describe the department"
                        ></textarea>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : (modalMode === 'create' ? 'Create Department' : 'Save Changes')}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={`${selectedDeptForDetails?.name || 'Department'} Details`}>
                <div style={{ padding: '0 0.5rem' }}>
                    <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1rem' }}>Description</h4>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                            {selectedDeptForDetails?.description || 'No description available for this department.'}
                        </p>
                    </div>
                    
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Briefcase size={18} style={{ color: '#3b82f6' }} /> Job Listings ({deptJobs.length})
                    </h4>

                    {isLoadingDetails ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>Loading jobs...</div>
                    ) : deptJobs.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {deptJobs.map(job => (
                                <div key={job.id} onClick={() => { onViewChange && onViewChange('candidates', { jobId: job.id, deptId: job.department_id }); setIsDetailsModalOpen(false); }} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseOver={(e) => e.currentTarget.style.borderColor = '#8b5cf6'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h5 style={{ margin: 0, fontSize: '1.05rem', color: '#3b82f6', fontWeight: 700 }}>{job.title}</h5>
                                        <span className={`status-badge ${job.status}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} /> {job.locations || 'Remote'}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Briefcase size={14} /> {job.role || 'Full-time'}</span>
                                        {job.salary && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 600 }}>
                                                <DollarSign size={14} /> {job.salary}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}><Briefcase size={32} style={{ margin: '0 auto' }} /></div>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>No job listings currently available in this department.</p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default DepartmentsList;
