import React, { useState, useEffect } from 'react';
import { fetchJobListings } from '../utils/api';
import { Search, Briefcase, MapPin, ArrowRight, User, Layout, List, Star, HelpCircle, Bell, LogOut, ChevronRight, DollarSign } from 'lucide-react';
import logo from '../assets/medianet_logo.png';
import Auth from './auth/Auth';
import './PublicCareers.css';

const PublicCareers = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAuth, setShowAuth] = useState(null); // 'login' or 'register'

    useEffect(() => {
        const getJobs = async () => {
            try {
                const data = await fetchJobListings();
                setJobs(data);
            } catch (error) {
                console.error('Error loading jobs:', error);
            } finally {
                setLoading(false);
            }
        };
        getJobs();
    }, []);

    if (showAuth) {
        return (
            <div className="auth-overlay-container">
                <button className="back-to-jobs" onClick={() => setShowAuth(null)}>← Back to Careers</button>
                <Auth initialView={showAuth} />
            </div>
        );
    }

    return (
        <div className="public-careers-premium">
            <header className="public-header-premium">
                <div className="header-content-wrapper">
                    <div className="header-left">
                        <div className="text-logo-premium">
                            Media<span>Net</span>
                        </div>
                    </div>
                    
                    <div className="public-nav-actions">
                        <button className="premium-nav-link" onClick={() => setShowAuth('login')}>Sign In</button>
                        <button className="premium-nav-btn" onClick={() => setShowAuth('register')}>Join Talent Pool</button>
                    </div>
                </div>
            </header>

            <div className="careers-hero-premium">
                <div className="hero-glass-layer"></div>
                <div className="hero-content">
                    <div className="hero-badge">
                        <Star size={14} fill="currentColor" />
                        <span>Work at MediaNet</span>
                    </div>
                    <h1>Build the Future with Us</h1>
                    <p>We're looking for passionate individuals to join our mission. Explore our open roles and find your perfect fit.</p>
                    <div className="hero-search-bar">
                        <Search size={20} className="search-icon" />
                        <input type="text" placeholder="Search for your dream job..." />
                        <button className="hero-search-btn">Find Jobs</button>
                    </div>
                </div>
            </div>

            <div className="jobs-list-public">
                {loading ? (
                    <p className="loading-jobs">Loading jobs...</p>
                ) : jobs.length === 0 ? (
                    <p className="no-jobs">No open positions at the moment. Check back later!</p>
                ) : (
                    <div className="jobs-grid-premium">
                        {jobs.map(job => (
                            <div key={job.id} className="job-card-premium">
                                <div className="job-card-header">
                                    <span className="job-dept-tag">{job.department?.name || 'General'}</span>
                                    <div className="job-meta-top">
                                        <MapPin size={14} />
                                        <span>Remote • Casablanca</span>
                                    </div>
                                </div>
                                
                                <div className="job-card-body">
                                    <h3>{job.title}</h3>
                                    <p className="job-card-excerpt" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {job.description}
                                    </p>
                                </div>

                                <div className="job-card-footer">
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div className="job-meta-bottom">
                                            <Briefcase size={14} />
                                            <span>{job.remote_status || 'Full-time'}</span>
                                        </div>
                                        {job.salary && (
                                            <div className="job-meta-bottom">
                                                <DollarSign size={14} />
                                                <span>{job.salary}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        className="premium-apply-btn" 
                                        onClick={() => job.status !== 'closed' && setShowAuth('register')}
                                        disabled={job.status === 'closed'}
                                    >
                                        <span>Apply Now</span>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicCareers;
