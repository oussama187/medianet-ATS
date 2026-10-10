import React, { useState, useEffect } from 'react';
import { Mail, Eye, Clock, User, Layout, List, FileText, X, Filter } from 'lucide-react';
import { fetchCandidates, fetchDepartments, parseCandidateCv, sendCandidateEmail } from '../utils/api';
import PipelineBoard from './PipelineBoard';
import './ListView.css';

const CandidatesList = ({ initialDeptId, initialJobId }) => {
    const [candidates, setCandidates] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [selectedDeptId, setSelectedDeptId] = useState(initialDeptId || 'all');
    const [selectedJobId, setSelectedJobId] = useState(initialJobId || 'all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'pipeline'
    const [selectedCandidateForParse, setSelectedCandidateForParse] = useState(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailCandidate, setEmailCandidate] = useState(null);
    const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    useEffect(() => {
        loadCandidates();
    }, []);

    const loadCandidates = async () => {
        try {
            setIsLoading(true);
            const [candData, deptData] = await Promise.all([
                fetchCandidates(),
                fetchDepartments()
            ]);
            setCandidates(candData);
            setDepartments(deptData);
            
            // Extract unique jobs from candidates or fetch them if needed
            // For now, let's just extract jobs that have candidates to show in the filter
            const uniqueJobsMap = new Map();
            candData.forEach(c => {
                if(c.job_listing) uniqueJobsMap.set(c.job_listing.id, c.job_listing);
            });
            setJobs(Array.from(uniqueJobsMap.values()));

        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCandidates = candidates.filter(c => {
        const matchesDept = selectedDeptId === 'all' || c.job_listing?.department_id?.toString() === selectedDeptId.toString();
        const matchesJob = selectedJobId === 'all' || c.job_listing_id?.toString() === selectedJobId.toString();
        const matchesStatus = selectedStatus === 'all' || (c.status || 'pending') === selectedStatus;
        return matchesDept && matchesJob && matchesStatus;
    });

    if (viewMode === 'pipeline') {
        return (
            <div className="list-container-fluid">
                <div className="view-toggle-sticky">
                    <button 
                        className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        <List size={18} /> List
                    </button>
                    <button 
                        className={`toggle-btn ${viewMode === 'pipeline' ? 'active' : ''}`}
                        onClick={() => setViewMode('pipeline')}
                    >
                        <Layout size={18} /> Pipeline
                    </button>
                </div>
                <PipelineBoard />
            </div>
        );
    }

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setIsSendingEmail(true);
        try {
            await sendCandidateEmail(emailCandidate.id, emailForm);
            setIsEmailModalOpen(false);
        } catch (error) {
            alert(error.error || 'Failed to send email');
        } finally {
            setIsSendingEmail(false);
        }
    };

    if (isLoading) return <div className="loading">Loading candidates...</div>;

    return (
        <div className="list-container">
            <div className="list-header-premium">
                <div className="header-main-info">
                    <div className="header-icon-wrapper">
                        <User size={32} />
                    </div>
                    <div>
                        <h1>Candidate Applications</h1>
                        <p>Track, manage, and analyze your incoming talent pool with AI insights.</p>
                    </div>
                </div>
                
                <div className="header-actions-area">
                    <div className="view-mode-toggle">
                        <button 
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} /> <span>List</span>
                        </button>
                        <button 
                            className={`toggle-btn ${viewMode === 'pipeline' ? 'active' : ''}`}
                            onClick={() => setViewMode('pipeline')}
                        >
                            <Layout size={18} /> <span>Pipeline</span>
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.5rem', marginTop: '-1.5rem' }}>
                <div className="premium-filter-wrapper">
                    <div className="premium-filter-group">
                        <label><Filter size={14} style={{ marginRight: '4px' }} /> Department</label>
                        <select 
                            value={selectedDeptId} 
                            onChange={(e) => { setSelectedDeptId(e.target.value); setSelectedJobId('all'); }}
                            className="premium-filter-select"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div style={{ width: '1px', height: '24px', background: '#cbd5e1' }}></div>
                    
                    <div className="premium-filter-group">
                        <label>Role</label>
                        <select 
                            value={selectedJobId} 
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="premium-filter-select"
                        >
                            <option value="all">All Roles</option>
                            {jobs.filter(j => selectedDeptId === 'all' || j.department_id?.toString() === selectedDeptId.toString()).map(job => (
                                <option key={job.id} value={job.id}>{job.title}</option>
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
                            <option value="all">All Statuses</option>
                            <option value="applied">Applied</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Candidate</th>
                        <th>Applied For</th>
                        <th>Applied Date</th>
                        <th>Match Score</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCandidates.length > 0 ? (
                        filteredCandidates.map(candidate => (
                            <tr key={candidate.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}>
                                            {candidate.first_name[0]}{candidate.last_name[0]}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 800, color: '#1e293b' }}>{candidate.first_name} {candidate.last_name}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{candidate.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 600, color: '#475569' }}>{candidate.job_listing?.title || 'Unknown Position'}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{candidate.job_listing?.department?.name || 'N/A'}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>{new Date(candidate.created_at).toLocaleDateString()}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Application Date</span>
                                    </div>
                                </td>
                                <td>
                                    {candidate.match_score !== null ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ background: '#f1f5f9', borderRadius: '4px', width: '60px', height: '6px', overflow: 'hidden' }}>
                                                <div style={{ background: candidate.match_score > 75 ? '#10b981' : candidate.match_score > 40 ? '#f59e0b' : '#ef4444', height: '100%', width: `${candidate.match_score}%` }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{candidate.match_score}%</span>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>N/A</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`status-badge ${candidate.status || 'pending'}`}>
                                        {candidate.status || 'Pending'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    {candidate.resume_url && (
                                        <a 
                                            href={`http://localhost:8000${candidate.resume_url}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="action-btn edit"
                                            title="View Resume"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Eye size={18} />
                                        </a>
                                    )}
                                    <button 
                                        className="action-btn" 
                                        title="AI Parse CV"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCandidateForParse(candidate);
                                        }}
                                        style={{ color: '#8b5cf6' }}
                                    >
                                        <FileText size={18} />
                                    </button>
                                    <button className="action-btn" title="Send Email" onClick={(e) => {
                                        e.stopPropagation();
                                        setEmailCandidate(candidate);
                                        setEmailForm({ subject: '', message: '' });
                                        setIsEmailModalOpen(true);
                                    }}>
                                        <Mail size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="empty-row">
                                <div className="empty-state-content">
                                    <div className="empty-state-icon">
                                        <User size={32} />
                                    </div>
                                    <h3>No candidates found</h3>
                                    <p>Incoming applications will appear here once candidates apply.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selectedCandidateForParse && (
                <ParsedCvModal 
                    candidate={selectedCandidateForParse} 
                    onClose={() => setSelectedCandidateForParse(null)} 
                />
            )}

            {isEmailModalOpen && emailCandidate && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Send Email to {emailCandidate.first_name}</h2>
                            <button className="close-btn" onClick={() => setIsEmailModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSendEmail}>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={emailForm.subject}
                                        onChange={e => setEmailForm({...emailForm, subject: e.target.value})}
                                        required 
                                        placeholder="e.g. Interview Invitation"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea 
                                        className="form-control" 
                                        style={{ minHeight: '150px' }}
                                        value={emailForm.message}
                                        onChange={e => setEmailForm({...emailForm, message: e.target.value})}
                                        required 
                                        placeholder="Type your message here..."
                                    ></textarea>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsEmailModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={isSendingEmail}>
                                        {isSendingEmail ? 'Sending...' : 'Send Email'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const ParsedCvModal = ({ candidate, onClose }) => {
    const [parsedData, setParsedData] = useState(null);
    const [isParsing, setIsParsing] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const doParse = async () => {
            try {
                setIsParsing(true);
                setError(null);
                const data = await parseCandidateCv(candidate.id);
                if (data.error) {
                    setError(data.error);
                } else {
                    setParsedData(data);
                }
            } catch (err) {
                setError(err.error || 'Failed to parse CV');
            } finally {
                setIsParsing(false);
            }
        };

        if (candidate) {
            doParse();
        }
    }, [candidate]);

    return (
        <div className="modal-overlay">
            <div className="pipeline-modal" style={{ width: '600px', maxWidth: '90%' }}>
                <div className="modal-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ background: '#8b5cf6', color: 'white', padding: '0.5rem', borderRadius: '8px' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>CV Parsing</h2>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Extracting insights for {candidate.first_name}</p>
                        </div>
                    </div>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                
                <div className="modal-body" style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
                    {isParsing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 0' }}>
                            <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ color: '#64748b', fontWeight: 600 }}>Wait a little...</p>
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : error ? (
                        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', border: '1px solid #ef4444' }}>
                            <strong>Error:</strong> {error}
                        </div>
                    ) : parsedData ? (
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Name</label>
                                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: '#0f172a' }}>{parsedData.name || 'N/A'}</p>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Age</label>
                                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: '#0f172a' }}>{parsedData.age || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <label style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Contact Info</label>
                                <div style={{ margin: '0.25rem 0 0 0', color: '#0f172a' }}>
                                    {typeof parsedData.contact === 'object' && parsedData.contact !== null ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            {parsedData.contact.email && <div><strong>Email:</strong> {parsedData.contact.email}</div>}
                                            {parsedData.contact.phone && <div><strong>Phone:</strong> {parsedData.contact.phone}</div>}
                                            {!parsedData.contact.email && !parsedData.contact.phone && JSON.stringify(parsedData.contact)}
                                        </div>
                                    ) : (
                                        <p style={{ margin: 0 }}>{parsedData.contact || 'N/A'}</p>
                                    )}
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <label style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Location / Address</label>
                                <p style={{ margin: '0.25rem 0 0 0', color: '#0f172a' }}>{parsedData.location || 'N/A'}</p>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <label style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Spoken Languages</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {Array.isArray(parsedData.languages) ? parsedData.languages.map((lang, idx) => (
                                        <span key={idx} style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600 }}>{lang}</span>
                                    )) : <p style={{ margin: 0 }}>{parsedData.languages || 'N/A'}</p>}
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <label style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Skills</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {Array.isArray(parsedData.skills) ? parsedData.skills.map((skill, idx) => (
                                        <span key={idx} style={{ background: '#f1f5f9', color: '#334155', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, border: '1px solid #cbd5e1' }}>{skill}</span>
                                    )) : <p style={{ margin: 0 }}>{parsedData.skills || 'N/A'}</p>}
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <label style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Experience</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                                    {Array.isArray(parsedData.experience) ? parsedData.experience.map((exp, idx) => (
                                        <div key={idx} style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{exp.role || exp.title || 'Role not specified'}</div>
                                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 500 }}>
                                                {exp.company || 'Company not specified'} <span style={{ color: '#cbd5e1', margin: '0 0.5rem' }}>|</span> <span style={{ color: '#8b5cf6' }}>{exp.duration || 'Duration not specified'}</span>
                                            </div>
                                            {exp.description && <p style={{ fontSize: '0.875rem', marginTop: '0.75rem', color: '#334155', marginBottom: 0, lineHeight: 1.5 }}>{exp.description}</p>}
                                        </div>
                                    )) : <p style={{ margin: 0 }}>{parsedData.experience ? JSON.stringify(parsedData.experience) : 'N/A'}</p>}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default CandidatesList;
