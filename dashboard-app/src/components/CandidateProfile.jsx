import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMyApplications, uploadUserResume } from '../utils/api';
import { Mail, User, FileText, Download, Briefcase, Clock, Calendar, CheckCircle, Upload } from 'lucide-react';
import './CandidateDashboard.css';

const CandidateProfile = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        const loadMyApplications = async () => {
            try {
                setIsLoading(true);
                const data = await fetchMyApplications();
                setApplications(data);
            } catch (error) {
                console.error('Failed to load applications', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            loadMyApplications();
        }
    }, [user]);

    // Find the most recently uploaded CV if the user doesn't have a direct resume_url yet
    const latestApplicationWithCv = applications.find(app => app.resume_url);
    const activeCvUrl = user?.resume_url || latestApplicationWithCv?.resume_url;

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('resume', file);
            
            await uploadUserResume(formData);
            // Reload the page to get the updated user context
            window.location.reload();
        } catch (err) {
            console.error('Upload failed', err);
            alert('Failed to upload CV');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="candidate-dashboard" style={{ padding: '2rem' }}>
            <div className="section-header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }}>My Profile</h1>
                <p style={{ color: '#64748b' }}>Manage your personal information and view your career progress.</p>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Personal Info Card */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ width: '100px', height: '100px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{user?.name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                            <Mail size={16} /> {user?.email}
                        </div>
                    </div>

                    {/* Resume Card */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={20} style={{ color: '#3b82f6' }} /> My Resume
                            </h3>
                            <button 
                                onClick={handleUploadClick} 
                                disabled={uploading}
                                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: uploading ? 'not-allowed' : 'pointer' }}
                            >
                                <Upload size={14} /> {uploading ? 'Uploading...' : 'Update CV'}
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept=".pdf,.doc,.docx" 
                                style={{ display: 'none' }} 
                            />
                        </div>
                        {activeCvUrl ? (
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '0.5rem', borderRadius: '8px' }}>
                                        <FileText size={20} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>{user?.resume_url ? 'Profile_CV.pdf' : 'Latest_CV.pdf'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.resume_url ? 'Primary Resume' : 'Used in recent applications'}</div>
                                    </div>
                                </div>
                                <a href={`http://127.0.0.1:8000/storage/${activeCvUrl}`} target="_blank" rel="noreferrer" style={{ background: 'white', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', textDecoration: 'none' }}>
                                    <Download size={14} /> View
                                </a>
                            </div>
                        ) : (
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>No resume uploaded yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ flex: '2 1 500px' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Recent Applications</h3>
                        
                        {isLoading ? (
                            <div className="loading">Loading...</div>
                        ) : applications.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {applications.slice(0, 5).map(app => (
                                    <div key={app.id} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#e0e7ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                                                <Briefcase size={20} />
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{app.job_listing?.title}</h4>
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', color: '#64748b', fontSize: '0.75rem' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Clock size={12} /> Applied {new Date(app.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ 
                                                background: app.pipeline_step?.color ? `${app.pipeline_step.color}15` : '#eff6ff',
                                                color: app.pipeline_step?.color || '#3b82f6',
                                                border: `1px solid ${app.pipeline_step?.color ? `${app.pipeline_step.color}30` : '#dbeafe'}`,
                                                padding: '0.3rem 0.8rem',
                                                borderRadius: '999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                {app.pipeline_step?.name || 'Application Received'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                                <div style={{ margin: '0 auto 1rem', width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    <CheckCircle size={24} />
                                </div>
                                <h4 style={{ fontSize: '1rem', color: '#475569', marginBottom: '0.5rem' }}>No recent applications</h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Your applications will appear here once you start applying.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateProfile;
