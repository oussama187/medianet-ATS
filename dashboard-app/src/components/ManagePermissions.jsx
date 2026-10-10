import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Shield, Layers, Briefcase, Users, Layout } from 'lucide-react';
import { fetchRecruiters, updateRecruiterPermissions } from '../utils/api';
import './ManagePermissions.css';

const ManagePermissions = () => {
    const [recruiters, setRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [expandedRecruiter, setExpandedRecruiter] = useState(null);

    const permissionTree = [
        { 
            id: 'dashboard', 
            label: 'Dashboard', 
            icon: <Layout size={18} />,
            actions: [
                { id: 'dashboard.view', label: 'View Dashboard' }
            ]
        },
        { 
            id: 'departments', 
            label: 'Departments', 
            icon: <Layers size={18} />,
            actions: [
                { id: 'departments.view', label: 'View Departments' },
                { id: 'departments.create', label: 'Create Department' },
                { id: 'departments.edit', label: 'Edit Department' },
                { id: 'departments.delete', label: 'Delete Department' }
            ]
        },
        { 
            id: 'jobs', 
            label: 'Jobs', 
            icon: <Briefcase size={18} />,
            actions: [
                { id: 'jobs.view', label: 'View Jobs' },
                { id: 'jobs.create', label: 'Create Job' },
                { id: 'jobs.edit', label: 'Edit Job' },
                { id: 'jobs.delete', label: 'Delete Job' }
            ]
        },
        { 
            id: 'candidates', 
            label: 'Candidates', 
            icon: <Users size={18} />,
            actions: [
                { id: 'candidates.view', label: 'View Candidates' },
                { id: 'candidates.manage', label: 'Manage Candidates' }
            ]
        }
    ];

    useEffect(() => {
        loadRecruiters();
    }, []);

    const loadRecruiters = async () => {
        try {
            setLoading(true);
            const data = await fetchRecruiters();
            setRecruiters(data);
        } catch (err) {
            setError('Failed to fetch recruiters. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionToggle = async (recruiterId, actionId) => {
        const recruiter = recruiters.find(r => r.id === recruiterId);
        const currentPermissions = recruiter.permissions || [];
        
        let newPermissions;
        if (currentPermissions.includes(actionId)) {
            newPermissions = currentPermissions.filter(p => p !== actionId);
        } else {
            newPermissions = [...currentPermissions, actionId];
        }

        try {
            setUpdatingId(recruiterId);
            await updateRecruiterPermissions(recruiterId, newPermissions);
            
            // Update local state
            setRecruiters(recruiters.map(r => 
                r.id === recruiterId ? { ...r, permissions: newPermissions } : r
            ));
        } catch (err) {
            alert('Failed to update permissions.');
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleRecruiterExpand = (id) => {
        setExpandedRecruiter(expandedRecruiter === id ? null : id);
    };

    if (loading) return <div className="loading">Loading recruiters...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="permissions-container">
            <div className="page-header">
                <h2>Manage Granular Permissions</h2>
                <p>Define specific actions recruiters can perform within each section.</p>
            </div>

            <div className="recruiters-list-granular">
                {recruiters.length === 0 ? (
                    <p className="no-data">No recruiters found.</p>
                ) : (
                    recruiters.map(recruiter => (
                        <div key={recruiter.id} className={`recruiter-row ${expandedRecruiter === recruiter.id ? 'active' : ''}`}>
                            <div className="recruiter-main" onClick={() => toggleRecruiterExpand(recruiter.id)}>
                                <div className="recruiter-profile">
                                    <div className="avatar">{recruiter.name.charAt(0)}</div>
                                    <div className="info">
                                        <h3>{recruiter.name}</h3>
                                        <span>{recruiter.email}</span>
                                    </div>
                                </div>
                                <div className="recruiter-meta">
                                    <span className="badge">{(recruiter.permissions || []).length} permissions</span>
                                    {expandedRecruiter === recruiter.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>
                            
                            {expandedRecruiter === recruiter.id && (
                                <div className="permissions-expansion">
                                    <div className="granular-grid">
                                        {permissionTree.map(category => (
                                            <div key={category.id} className="permission-category">
                                                <div className="category-header">
                                                    {category.icon}
                                                    <h4>{category.label}</h4>
                                                </div>
                                                <div className="actions-list">
                                                    {category.actions.map(action => (
                                                        <label key={action.id} className="action-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                checked={(recruiter.permissions || []).includes(action.id)}
                                                                onChange={() => handlePermissionToggle(recruiter.id, action.id)}
                                                                disabled={updatingId === recruiter.id}
                                                            />
                                                            <span>{action.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManagePermissions;
