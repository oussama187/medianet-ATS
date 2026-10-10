import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Info, FileText, Upload, Clock, CheckCircle, Search, Filter, Briefcase, DollarSign, ArrowRight } from 'lucide-react';
import { fetchJobListings, createJobListing, updateJobListing, deleteJobListing, fetchDepartments, submitApplication, fetchMyApplications, fetchJobRecommendations } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import './ListView.css';

const JobsList = ({ isPublicView = false, hideAI = false, hideJobs = false, isTemplateMode = false, limit, onJobsLoaded, onApplicationSubmitted, onViewChange }) => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'super-admin';
    const [jobs, setJobs] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    
    // Existing Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [jobModalStep, setJobModalStep] = useState(0); 
    const [editingJobId, setEditingJobId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Application Modal
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [applyingJob, setApplyingJob] = useState(null);
    const [applyForm, setApplyForm] = useState({
        first_name: '',
        last_name: '',
        note: '',
        cv: null
    });

    // Recommendations State
    const [recommendations, setRecommendations] = useState([]);
    const [isRecommending, setIsRecommending] = useState(false);
    const [recommendationCv, setRecommendationCv] = useState(null);

    const hasPermission = (p) => isSuperAdmin || (user?.permissions || []).includes(p);

    const [jobForm, setJobForm] = useState({ 
        title: '', 
        description: '',
        sections: [{ id: 1, title: 'Responsibilities', content: '' }, { id: 2, title: 'Requirements', content: '' }],
        department_id: '', 
        status: 'open',
        remote_status: '',
        salary: ''
    });

    useEffect(() => {
        loadJobs();
        if (isPublicView && user) {
            loadMyApplications();
        }
        if (!isPublicView) {
            loadDepartments();
        }
        if (user) {
            // Pre-fill names from user profile if available
            const names = user.name ? user.name.split(' ') : ['', ''];
            setApplyForm(prev => ({
                ...prev,
                first_name: names[0] || '',
                last_name: names.slice(1).join(' ') || ''
            }));
        }
    }, [isPublicView, user]);

    const loadJobs = async () => {
        try {
            setIsLoading(true);
            const data = await fetchJobListings();
            setJobs(data);
            if (onJobsLoaded) onJobsLoaded(data.length);
        } catch (error) {
            console.error('Failed to load jobs', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const data = await fetchDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Failed to load departments', error);
        }
    };

    const loadMyApplications = async () => {
        try {
            const data = await fetchMyApplications();
            setMyApplications(data);
        } catch (error) {
            console.error('Failed to load my applications', error);
        }
    };

    const handleCreateClick = () => {
        setModalMode('create');
        setJobForm({ 
            title: '', 
            description: '', 
            sections: [{ id: 1, title: 'Responsibilities', content: '' }, { id: 2, title: 'Requirements', content: '' }],
            department_id: departments.length > 0 ? departments[0].id : '', 
            status: isTemplateMode ? 'template' : 'open',
            remote_status: '',
            salary: ''
        });
        setJobModalStep(isTemplateMode ? 1 : 0);
        setIsModalOpen(true);
    };

    const handleEditClick = (job) => {
        setModalMode('edit');
        setEditingJobId(job.id);
        
        // Attempt to parse sections from description if it contains '###'
        let parsedSections = [];
        if (job.description && job.description.includes('### ')) {
            const parts = job.description.split('### ').filter(p => p.trim());
            parsedSections = parts.map((part, index) => {
                const lines = part.split('\n');
                return { id: index + 1, title: lines[0].trim(), content: lines.slice(1).join('\n').trim() };
            });
        }
        
        setJobForm({
            title: job.title,
            description: job.description,
            sections: parsedSections.length > 0 ? parsedSections : [{ id: 1, title: 'About the role', content: job.description }],
            department_id: job.department_id,
            status: job.status,
            remote_status: job.remote_status || '',
            salary: job.salary || ''
        });
        setJobModalStep(1); // Go straight to form for editing
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        try {
            await deleteJobListing(id);
            setJobs(jobs.filter(job => job.id !== id));
        } catch (error) {
            alert('Failed to delete job listing');
        }
    };

    const handleApplyClick = (job) => {
        setApplyingJob(job);
        setIsApplyModalOpen(true);
    };

    const handleApplicationSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('first_name', applyForm.first_name);
            formData.append('last_name', applyForm.last_name);
            formData.append('email', user?.email || '');
            formData.append('note', applyForm.note);
            formData.append('job_listing_id', applyingJob.id);
            formData.append('cv', applyForm.cv);

            await submitApplication(formData);
            setIsApplyModalOpen(false);
            setApplyForm({ ...applyForm, note: '', cv: null });
            if (isPublicView) {
                loadMyApplications();
                if (onApplicationSubmitted) {
                    onApplicationSubmitted();
                }
            }
        } catch (error) {
            let errorMsg = error.message || 'Error submitting application';
            if (error.errors) {
                errorMsg = Object.values(error.errors).flat().join('\n');
            }
            alert(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleGetRecommendations = async () => {
        if (!recommendationCv) return;
        setIsRecommending(true);
        try {
            const formData = new FormData();
            formData.append('cv', recommendationCv);
            const data = await fetchJobRecommendations(formData);
            setRecommendations(data.recommendations || []);
            if (!data.recommendations || data.recommendations.length === 0) {
                alert('We couldn\'t find any jobs matching your profile perfectly, but please browse our available roles!');
            }
        } catch (error) {
            alert(error.error || 'Failed to get recommendations.');
        } finally {
            setIsRecommending(false);
        }
    };

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        // Compile sections into description if we have them
        const compiledDescription = jobForm.sections && jobForm.sections.length > 0 
            ? jobForm.sections.map(s => `### ${s.title}\n${s.content}`).join('\n\n')
            : jobForm.description;
            
        const submissionData = { ...jobForm, description: compiledDescription };
            
        try {
            if (modalMode === 'create') {
                await createJobListing(submissionData);
            } else {
                await updateJobListing(editingJobId, submissionData);
            }
            setIsModalOpen(false);
            loadJobs();
        } catch (error) {
            alert(`Error ${modalMode === 'create' ? 'creating' : 'updating'} job listing`);
        } finally {
            setSubmitting(false);
        }
    };

    const getApplicationForJob = (jobId) => {
        return myApplications.find(app => app.job_listing_id === jobId);
    };

    if (isLoading) return <div className="loading">Loading jobs...</div>;

    const showActionsColumn = !isPublicView && (hasPermission('jobs.edit') || hasPermission('jobs.delete'));
    
    const filteredJobs = jobs.filter(job => {
        const isTemplate = job.status === 'template';
        if (isTemplateMode && !isTemplate) return false;
        if (!isTemplateMode && isTemplate) return false;
        
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDepartment === 'All' || job.department?.name === selectedDepartment;
        const matchesStatus = selectedStatus === 'All' || job.status === selectedStatus;
        return matchesSearch && matchesDept && matchesStatus;
    });

    const displayedJobs = limit ? filteredJobs.slice(0, limit) : filteredJobs;
    const uniqueDepartments = ['All', ...new Set(jobs.map(j => j.department?.name).filter(Boolean))];

    return (
        <div className="list-container" style={isPublicView ? { padding: 0 } : {}}>
            <div className="list-header">
                <div>
                    <h1>{isPublicView ? (hideJobs ? 'AI Job Matching' : 'Available Careers') : (isTemplateMode ? 'Job Templates' : 'Job Listings')}</h1>
                    <p>{isPublicView ? (hideJobs ? 'Upload your CV and let our AI find the best roles for you.' : 'Join our amazing team') : (isTemplateMode ? 'Manage your reusable job templates.' : 'Overview of all active and closed positions across departments.')}</p>
                </div>
                {!isPublicView && hasPermission('jobs.create') && (
                    <button className="btn-primary" onClick={handleCreateClick}>
                        <Plus size={18} /> {isTemplateMode ? 'Create Template' : 'Create Job'}
                    </button>
                )}
            </div>

            {isPublicView && !hideAI && (
                <div className="recommendations-banner" style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>AI Matchmaker</h2>
                            <p style={{ color: '#64748b', marginBottom: '1rem' }}>Not sure which role fits best? Upload your CV and our AI will recommend the perfect opportunities for your experience.</p>
                            <div className="file-upload-wrapper" style={{ marginBottom: '1rem' }}>
                                <input 
                                    type="file" 
                                    id="rec-cv-upload"
                                    onChange={(e) => setRecommendationCv(e.target.files[0])}
                                    accept=".pdf"
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="rec-cv-upload" className="file-upload-label" style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Upload size={18} />
                                    {recommendationCv ? recommendationCv.name : 'Choose CV (PDF only)...'}
                                </label>
                            </div>
                            <button 
                                className="btn-primary w-full" 
                                onClick={handleGetRecommendations}
                                disabled={!recommendationCv || isRecommending}
                                style={{ background: '#8b5cf6', borderColor: '#8b5cf6' }}
                            >
                                {isRecommending ? 'Analyzing Profile...' : 'Find Matches'}
                            </button>
                        </div>

                        {recommendations.length > 0 && (
                            <div style={{ flex: '2 1 400px', background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#0f172a' }}>Top Matches For You</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {recommendations.map(rec => {
                                        const matchedJob = jobs.find(j => j.id === parseInt(rec.job_id));
                                        return (
                                            <div key={rec.job_id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginTop: '0.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.05rem' }}>{rec.job_title}</span>
                                                        <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Briefcase size={12}/> {matchedJob?.department?.name || 'Department'}</span>
                                                    </div>
                                                    <span style={{ background: '#dcfce7', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, boxShadow: '0 2px 4px rgba(22, 101, 52, 0.1)' }}>
                                                        {rec.match_percentage}% Match
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, lineHeight: 1.6, background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #8b5cf6' }}>{rec.reason}</p>
                                                {matchedJob && (
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                                                        <button 
                                                            onClick={() => handleApplyClick(matchedJob)}
                                                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)' }}
                                                            onMouseOver={(e) => e.target.style.background = '#2563eb'}
                                                            onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                                                        >
                                                            View Details & Apply
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isPublicView ? (
                !hideJobs && (
                    <div className="public-jobs-section">
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 800, marginBottom: '1.5rem' }}>{hideAI ? 'Explore Job Offers' : 'Latest Job Openings'}</h2>
                            
                            {!limit && (
                                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 600, paddingRight: '1rem', borderRight: '1px solid #e2e8f0' }}>
                                        <Filter size={20} />
                                        <span>Filters</span>
                                    </div>
                                    <div style={{ flex: '1 1 250px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                                            <Search size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search by job title or keyword..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#1e293b', outline: 'none', transition: 'all 0.2s ease', background: '#f8fafc' }}
                                            onFocus={(e) => { e.target.style.borderColor = '#8b5cf6'; e.target.style.background = '#ffffff'; e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'; }}
                                            onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                                        />
                                    </div>
                                    <div style={{ flex: '0 1 250px', position: 'relative' }}>
                                        <select 
                                            value={selectedDepartment} 
                                            onChange={(e) => setSelectedDepartment(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#1e293b', outline: 'none', cursor: 'pointer', appearance: 'none', background: '#f8fafc', transition: 'all 0.2s ease' }}
                                            onFocus={(e) => { e.target.style.borderColor = '#8b5cf6'; e.target.style.background = '#ffffff'; e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'; }}
                                            onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                                        >
                                            {uniqueDepartments.map(dept => (
                                                <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                                            ))}
                                        </select>
                                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8', fontSize: '0.8rem' }}>
                                            ▼
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="jobs-grid-candidate">
                    {displayedJobs.length > 0 ? (
                        displayedJobs.map(job => (
                            <div key={job.id} className="job-card-candidate">
                                <span className="job-dept-badge">{job.department?.name || 'General'}</span>
                                <h3 className="job-card-title">{job.title}</h3>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {job.description}
                                </p>
                                <div className="job-card-body">
                                    <div className="job-meta-item">
                                        <Clock size={16} />
                                        <span>Full-time</span>
                                    </div>
                                    <div className="job-meta-item">
                                        <Info size={16} />
                                        <span>{job.remote_status || 'On-site'}</span>
                                    </div>
                                    {job.salary && (
                                        <div className="job-meta-item">
                                            <DollarSign size={16} />
                                            <span>{job.salary}</span>
                                        </div>
                                    )}
                                    <div className="job-meta-item">
                                        <span className={`status-badge ${job.status}`}>
                                            {job.status}
                                        </span>
                                    </div>
                                </div>
                                {(() => {
                                    const application = getApplicationForJob(job.id);
                                    if (application) {
                                        return (
                                            <div className="applied-status-container">
                                                <div className="btn-applied">
                                                    <CheckCircle size={16} /> Applied
                                                </div>
                                                <div className="pipeline-mini-status">
                                                    <span className="dot" style={{ backgroundColor: application.pipeline_step?.color || '#3b82f6' }}></span>
                                                    {application.pipeline_step?.name || 'Processing'}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <button 
                                            className="btn-primary w-full" 
                                            onClick={() => handleApplyClick(job)}
                                            disabled={job.status === 'closed'}
                                        >
                                            {job.status === 'closed' ? 'Closed' : 'Apply Now'}
                                        </button>
                                    );
                                })()}
                            </div>
                        ))
                    ) : (
                        <div className="empty-state-candidate">
                            <div className="empty-state-content">
                                <div className="empty-state-icon"><FileText size={32} /></div>
                                <h3>No job openings right now</h3>
                                <p>Check back soon for new opportunities.</p>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
                )
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.5rem', marginTop: '1rem' }}>
                        <div className="premium-filter-wrapper">
                            <div className="premium-filter-group">
                                <label><Filter size={14} style={{ marginRight: '4px' }} /> Department</label>
                                <select 
                                    value={selectedDepartment} 
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="premium-filter-select"
                                >
                                    {uniqueDepartments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={{ width: '1px', height: '24px', background: '#cbd5e1' }}></div>
                            
                            <div className="premium-filter-group">
                                <label>Status</label>
                                <select 
                                    value={selectedStatus} 
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="premium-filter-select"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>
                    </div>
                {isTemplateMode ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                        {displayedJobs.length > 0 ? (
                            displayedJobs.map(job => (
                                <div key={job.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ background: '#f5f3ff', padding: '1rem', borderRadius: '12px', color: '#8b5cf6' }}>
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b', fontWeight: 700 }}>{job.title}</h3>
                                                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                                    <Briefcase size={14} /> {job.department?.name || 'General'}
                                                </span>
                                            </div>
                                        </div>
                                        {showActionsColumn && (
                                            <div style={{ display: 'flex', gap: '0.25rem', background: '#f8fafc', padding: '0.25rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                                {hasPermission('jobs.edit') && (
                                                    <button onClick={() => handleEditClick(job)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', display: 'flex' }} onMouseOver={e => { e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.background = '#eff6ff'; }} onMouseOut={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'none'; }} title="Edit Template">
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                {hasPermission('jobs.delete') && (
                                                    <button onClick={() => handleDeleteClick(job.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', display: 'flex' }} onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }} onMouseOut={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'none'; }} title="Delete Template">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {job.salary && (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#dcfce7', color: '#166534', padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, width: 'fit-content', marginBottom: '1rem' }}>
                                            <DollarSign size={14} /> {job.salary}
                                        </div>
                                    )}
                                    
                                    <div style={{ marginTop: 'auto', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                        <Clock size={14} /> Last updated {new Date(job.updated_at || job.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state-content" style={{ gridColumn: '1 / -1', padding: '4rem 0', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                                <div className="empty-state-icon" style={{ background: '#e2e8f0', color: '#64748b' }}><FileText size={32} /></div>
                                <h3>No templates found</h3>
                                <p>Click "Create Template" to save your first reusable job offer.</p>
                            </div>
                        )}
                    </div>
                ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Department</th>
                            <th>Salary</th>
                            <th>Status</th>
                            <th>Created At</th>
                            {showActionsColumn && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {displayedJobs.length > 0 ? (
                            displayedJobs.map(job => (
                                <tr key={job.id}>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => onViewChange && onViewChange('candidates', { jobId: job.id, deptId: job.department_id })}>
                                            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#3b82f6', textDecoration: 'underline' }}>{job.title}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>#{job.id}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: '#475569' }}>{job.department?.name || 'N/A'}</span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: '#10b981' }}>{job.salary || 'N/A'}</span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${job.status}`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Created</span>
                                        </div>
                                    </td>
                                    {showActionsColumn && (
                                        <td className="actions-cell">
                                            {hasPermission('jobs.edit') && (
                                                <button className="action-btn edit" onClick={() => handleEditClick(job)} title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {hasPermission('jobs.delete') && (
                                                <button className="action-btn delete" onClick={() => handleDeleteClick(job.id)} title="Delete">
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
                                            <FileText size={32} />
                                        </div>
                                        <h3>No job listings found</h3>
                                        <p>Click "Create Job" to get started.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                )}
                </>
            )}

            {/* Application Modal */}
            <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title={`Apply for ${applyingJob?.title}`}>
                {applyingJob && (
                    <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#64748b' }}>
                                <Briefcase size={14} /> {applyingJob.department?.name || 'General'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#64748b' }}>
                                <Clock size={14} /> {applyingJob.remote_status || 'On-site'}
                            </span>
                            {applyingJob.salary && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                                    <DollarSign size={14} /> {applyingJob.salary}
                                </span>
                            )}
                        </div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#1e293b' }}>Job Description</h4>
                        <div style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '0.5rem', borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {applyingJob.description}
                            </p>
                        </div>
                    </div>
                )}
                <form onSubmit={handleApplicationSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>First Name</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={applyForm.first_name}
                                onChange={(e) => setApplyForm({...applyForm, first_name: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={applyForm.last_name}
                                onChange={(e) => setApplyForm({...applyForm, last_name: e.target.value})}
                                required 
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Application Note (Optional)</label>
                        <textarea 
                            className="form-control" 
                            style={{ minHeight: '80px' }}
                            value={applyForm.note}
                            onChange={(e) => setApplyForm({...applyForm, note: e.target.value})}
                            placeholder="Why are you a good fit?"
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label>Resume (CV) - PDF or Doc</label>
                        <div className="file-upload-wrapper">
                            <input 
                                type="file" 
                                id="cv-upload"
                                onChange={(e) => setApplyForm({...applyForm, cv: e.target.files[0]})}
                                accept=".pdf,.doc,.docx"
                                required 
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="cv-upload" className="file-upload-label">
                                <Upload size={18} />
                                {applyForm.cv ? applyForm.cv.name : 'Choose CV file...'}
                            </label>
                        </div>
                    </div>
                    <div className="form-actions" style={{ marginTop: '2rem' }}>
                        <button type="button" className="btn-secondary" onClick={() => setIsApplyModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Recruiter Modals */}
            <Modal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              title={modalMode === 'create' ? (jobModalStep === 0 ? "" : (isTemplateMode ? "Create Template" : "Create Job")) : (isTemplateMode ? "Edit Template" : "Edit Job Listing")}
              containerClass={"modal-medium"}
            >
                {modalMode === 'create' && jobModalStep === 0 ? (
                    <div className="template-picker">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Select a Template</h3>
                            <button type="button" className="btn-secondary" onClick={() => setJobModalStep(1)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                                <Plus size={14} style={{ marginRight: '0.25rem' }} /> Create from scratch
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {jobs.filter(j => j.status === 'template').length > 0 ? (
                                jobs.filter(j => j.status === 'template').map(template => (
                                    <div 
                                        key={template.id} 
                                        onClick={() => {
                                            let parsedSections = [];
                                            if (template.description && template.description.includes('### ')) {
                                                const parts = template.description.split('### ').filter(p => p.trim());
                                                parsedSections = parts.map((part, index) => {
                                                    const lines = part.split('\n');
                                                    return { id: index + 1, title: lines[0].trim(), content: lines.slice(1).join('\n').trim() };
                                                });
                                            }
                                            
                                            setJobForm(prev => ({
                                                ...prev,
                                                title: template.title,
                                                description: template.description,
                                                sections: parsedSections.length > 0 ? parsedSections : [{ id: 1, title: 'About the role', content: template.description }],
                                                salary: template.salary,
                                                remote_status: template.remote_status,
                                                fromTemplate: true
                                            }));
                                            setJobModalStep(1);
                                        }}
                                        style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{template.title}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{template.department?.name || 'General'}</div>
                                        </div>
                                        <ArrowRight size={18} color="#94a3b8" />
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No templates found. Create one in the Job Templates page!</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleJobSubmit} className="job-template-form">
                        <div className="form-group-full">
                            <label>Job Title</label>
                            <input
                                type="text"
                                className="form-control"
                                value={jobForm.title}
                                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                                placeholder="e.g. Account Manager"
                                required
                            />
                        </div>

                        <div className="form-group-full">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ margin: 0 }}>Job Details</label>
                                {!(jobForm.fromTemplate && !isTemplateMode) && (
                                    <button type="button" onClick={() => setJobForm(prev => ({ ...prev, sections: [...(prev.sections || []), { id: Date.now(), title: 'New Section', content: '' }] }))} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Plus size={14} /> Add Section
                                    </button>
                                )}
                            </div>
                            
                            {(jobForm.sections && jobForm.sections.length > 0) ? jobForm.sections.map((section, index) => (
                                <div key={section.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem' }}>
                                        <input 
                                            type="text" 
                                            value={section.title} 
                                            readOnly={jobForm.fromTemplate && !isTemplateMode}
                                            onChange={(e) => {
                                                if (jobForm.fromTemplate && !isTemplateMode) return;
                                                const newSections = [...jobForm.sections];
                                                newSections[index].title = e.target.value;
                                                setJobForm({ ...jobForm, sections: newSections });
                                            }}
                                            style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: '1rem', color: '#1e293b', outline: 'none', width: '100%', cursor: (jobForm.fromTemplate && !isTemplateMode) ? 'default' : 'text' }}
                                            placeholder="Section Title (e.g. Responsibilities)"
                                            required
                                        />
                                        {!(jobForm.fromTemplate && !isTemplateMode) && (
                                            <button type="button" onClick={() => {
                                                const newSections = jobForm.sections.filter((_, i) => i !== index);
                                                setJobForm({ ...jobForm, sections: newSections });
                                            }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <textarea
                                        className="form-control"
                                        style={{ minHeight: '80px', border: 'none', background: 'transparent', padding: '0.5rem 0 0 0' }}
                                        value={section.content}
                                        onChange={(e) => {
                                            const newSections = [...jobForm.sections];
                                            newSections[index].content = e.target.value;
                                            setJobForm({ ...jobForm, sections: newSections });
                                        }}
                                        placeholder="Enter section content..."
                                        required
                                    ></textarea>
                                </div>
                            )) : (
                                <div className="description-wrapper">
                                    <textarea
                                        className="form-control job-desc-textarea"
                                        value={jobForm.description}
                                        onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                                        placeholder="Tell us about the role..."
                                        required
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Salary / Compensation</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={jobForm.salary || ''}
                                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                                    placeholder="e.g. $80,000 - $100,000"
                                />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <select
                                    className="form-control"
                                    value={jobForm.department_id}
                                    onChange={(e) => setJobForm({ ...jobForm, department_id: e.target.value })}
                                    required
                                >
                                    <option value="" disabled hidden>Select a Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Remote status <Info size={14} className="info-icon" /></label>
                                <select
                                    className="form-control"
                                    value={jobForm.remote_status}
                                    onChange={(e) => setJobForm({ ...jobForm, remote_status: e.target.value })}
                                    required
                                >
                                    <option value="" disabled hidden>Select Status</option>
                                    <option value="Hybrid remote">Hybrid remote</option>
                                    <option value="On-site">On-site</option>
                                    <option value="Full Remote">Full Remote</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Job Status</label>
                                <select
                                    className="form-control"
                                    value={jobForm.status}
                                    onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
                                    required
                                >
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={submitting || departments.length === 0}>
                                {submitting ? 'Saving...' : (modalMode === 'create' ? (isTemplateMode ? 'Create Template' : 'Create Job') : 'Save Changes')}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default JobsList;
