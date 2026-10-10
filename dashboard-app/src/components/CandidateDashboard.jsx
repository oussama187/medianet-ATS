import React, { useState, useEffect } from 'react';
import JobsList from './JobsList';
import './CandidateDashboard.css';
import './ListView.css';
import { useAuth } from '../context/AuthContext';
import { Briefcase, CheckCircle, Clock, Star, MapPin, Send, Calendar } from 'lucide-react';
import { fetchMyApplications } from '../utils/api';

const CandidateDashboard = ({ onViewChange }) => {
    const { user } = useAuth();
    const [jobCount, setJobCount] = useState(0);
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadMyApplications();
        }
    }, [user]);

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

    return (
        <div className="candidate-dashboard">
            <header className="candidate-hero">
                <div className="hero-content">
                    <div className="hero-welcome-badge">
                        <Star size={14} fill="currentColor" />
                        <span>Candidate Portal</span>
                    </div>
                    <h1>Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}!</h1>
                    <p>Your career journey starts here. Explore tailored opportunities and track your applications in real-time.</p>
                </div>
                <div className="hero-stats">
                    <div className="mini-stat">
                        <div className="stat-icon applied">
                            <CheckCircle size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value" style={{ color: 'white' }}>{applications.length}</span>
                            <span className="stat-label">Applications</span>
                        </div>
                    </div>
                    <div className="mini-stat">
                        <div className="stat-icon new">
                            <Briefcase size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value" style={{ color: 'white' }}>{jobCount}</span>
                            <span className="stat-label">New Jobs</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="dashboard-sections">
                <section className="main-content-section">
                    <div className="applications-section" style={{ marginBottom: '3rem' }}>
                        <div className="section-header">
                            <h2>Your Applications</h2>
                            <p>Track the progress of your submitted candidatures.</p>
                        </div>
                        {applications.length > 0 ? (
                            <div className="applications-grid" style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                                {applications.map(app => (
                                    <div key={app.id} className="application-card" style={{ 
                                        background: 'white', 
                                        padding: '1.5rem', 
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s hover'
                                    }}>
                                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                            <div style={{ 
                                                width: '48px', 
                                                height: '48px', 
                                                background: '#f1f5f9', 
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#3b82f6'
                                            }}>
                                                <Briefcase size={24} />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{app.job_listing?.title}</h3>
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', color: '#64748b', fontSize: '0.875rem' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Clock size={14} /> Applied on {new Date(app.created_at).toLocaleDateString()}
                                                    </span>
                                                    {app.interview_date && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#3b82f6', fontWeight: 600 }}>
                                                            <Calendar size={14} /> Interview: {new Date(app.interview_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                                                {app.status === 'applied' ? 'Current Phase' : 'Status'}
                                            </div>
                                            {app.status === 'accepted' ? (
                                                <span className="status-badge" style={{ background: '#d1fae5', color: '#059669', border: '1px solid #10b981', padding: '0.5rem 1rem', borderRadius: '10px' }}>
                                                    Accepted
                                                </span>
                                            ) : app.status === 'rejected' ? (
                                                <span className="status-badge" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #ef4444', padding: '0.5rem 1rem', borderRadius: '10px' }}>
                                                    Rejected
                                                </span>
                                            ) : (
                                                <span className="status-badge" style={{ 
                                                    background: app.pipeline_step?.color ? `${app.pipeline_step.color}15` : '#eff6ff',
                                                    color: app.pipeline_step?.color || '#3b82f6',
                                                    border: `1px solid ${app.pipeline_step?.color ? `${app.pipeline_step.color}30` : '#dbeafe'}`,
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '10px'
                                                }}>
                                                    {app.pipeline_step?.name || 'Application Received'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state-candidate" style={{ marginTop: '1.5rem', padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                <div className="empty-state-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                    <CheckCircle size={24} />
                                </div>
                                <h3 style={{ fontSize: '1.125rem', color: '#334155', marginBottom: '0.5rem' }}>No applications yet</h3>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>You haven't applied to any positions. Check out our job offers below to get started!</p>
                            </div>
                        )}
                    </div>

                    <div className="jobs-section">
                        <div className="section-header">
                            <h2>Explore Opportunities</h2>
                            <p>Find more roles that match your expertise.</p>
                        </div>
                        <div className="ai-matchmaker-cta" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>Not sure which role fits best?</h3>
                                <p style={{ color: '#64748b', margin: 0 }}>Upload your CV and let our AI recommend the perfect opportunities for your experience.</p>
                            </div>
                            <button className="btn-primary" onClick={() => onViewChange && onViewChange('matching')} style={{ background: '#8b5cf6', borderColor: '#8b5cf6', whiteSpace: 'nowrap' }}>
                                Try AI Matchmaker
                            </button>
                        </div>

                        <JobsList 
                            isPublicView={true} 
                            hideAI={true}
                            limit={3}
                            onJobsLoaded={(count) => setJobCount(count)} 
                            onApplicationSubmitted={loadMyApplications}
                        />

                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button className="btn-secondary" onClick={() => onViewChange && onViewChange('jobs')} style={{ padding: '0.75rem 2rem', fontWeight: 600 }}>
                                View All Job Offers
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CandidateDashboard;
