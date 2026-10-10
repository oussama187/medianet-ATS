import React, { useState, useEffect } from 'react';
import { Building, Briefcase, Users, ArrowRight, UserCheck } from 'lucide-react';
import { fetchDepartments, fetchJobListings, fetchCandidates, fetchEmployees } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = ({ onViewChange }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        departments: 0,
        jobs: 0,
        candidates: 0,
        employees: 0,
        accepted: 0,
        rejected: 0,
        pending: 0,
        acceptanceRate: 0,
        avgPerJob: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [depts, allJobs, cands, emps] = await Promise.all([
                fetchDepartments(),
                fetchJobListings(),
                fetchCandidates(),
                fetchEmployees()
            ]);
            let accepted = 0;
            let rejected = 0;
            let pending = 0;
            
            cands.forEach(c => {
                if (c.status === 'accepted') accepted++;
                else if (c.status === 'rejected') rejected++;
                else pending++;
            });

            const activeJobs = allJobs.filter(j => j.status !== 'template');
            
            const totalResolved = accepted + rejected;
            const acceptanceRate = totalResolved > 0 ? Math.round((accepted / totalResolved) * 100) : 0;
            const avgPerJob = activeJobs.length > 0 ? (cands.length / activeJobs.length).toFixed(1) : 0;

            setStats({
                departments: depts.length,
                jobs: activeJobs.length,
                candidates: cands.length,
                employees: emps.length,
                accepted,
                rejected,
                pending,
                acceptanceRate,
                avgPerJob
            });
        } catch (error) {
            console.error('Failed to load dashboard stats', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="dashboard-content">
            <div className="welcome-section">
                <h1 className="welcome-title">Welcome back, {user?.name || 'User'}!</h1>
                <p className="welcome-subtitle">Here is a quick overview of your company workspace.</p>
            </div>

            <div className="stats-grid">
                <StatCard 
                    icon={<Building size={24} />} 
                    label="Departments" 
                    value={stats.departments} 
                    color="#4f46e5"
                    onClick={() => onViewChange && onViewChange('departments')}
                />
                <StatCard 
                    icon={<Briefcase size={24} />} 
                    label="Active Jobs" 
                    value={stats.jobs} 
                    color="#10b981"
                    onClick={() => onViewChange && onViewChange('jobs')}
                />
                <StatCard 
                    icon={<Users size={24} />} 
                    label="Total Applications" 
                    value={stats.candidates} 
                    color="#f59e0b"
                    onClick={() => onViewChange && onViewChange('candidates')}
                />
                <StatCard 
                    icon={<UserCheck size={24} />} 
                    label="Employees" 
                    value={stats.employees} 
                    color="#ec4899"
                    onClick={() => onViewChange && onViewChange('employees')}
                />
            </div>

            <div className="analytics-section">
                <div className="analytics-card">
                    <h3>Recruitment KPIs</h3>
                    <div className="kpi-row">
                        <span className="kpi-label">Offer Acceptance Rate</span>
                        <span className="kpi-value">{stats.acceptanceRate}%</span>
                    </div>
                    <div className="kpi-row">
                        <span className="kpi-label">Avg. Applications per Job</span>
                        <span className="kpi-value">{stats.avgPerJob}</span>
                    </div>
                    <div className="kpi-row">
                        <span className="kpi-label">Hired Employees</span>
                        <span className="kpi-value" style={{ color: '#10b981' }}>{stats.employees}</span>
                    </div>
                </div>

                <div className="analytics-card">
                    <h3>Pipeline Distribution</h3>
                    <div className="pipeline-bar">
                        <div className="pipeline-segment" style={{ width: `${stats.candidates ? (stats.accepted / stats.candidates) * 100 : 0}%`, background: '#10b981' }} title={`Accepted: ${stats.accepted}`}></div>
                        <div className="pipeline-segment" style={{ width: `${stats.candidates ? (stats.pending / stats.candidates) * 100 : 0}%`, background: '#3b82f6' }} title={`Pending: ${stats.pending}`}></div>
                        <div className="pipeline-segment" style={{ width: `${stats.candidates ? (stats.rejected / stats.candidates) * 100 : 0}%`, background: '#ef4444' }} title={`Rejected: ${stats.rejected}`}></div>
                    </div>
                    <div className="pipeline-legend">
                        <div className="legend-item"><div className="legend-dot" style={{ background: '#10b981' }}></div> Accepted ({stats.accepted})</div>
                        <div className="legend-item"><div className="legend-dot" style={{ background: '#3b82f6' }}></div> In Progress ({stats.pending})</div>
                        <div className="legend-item"><div className="legend-dot" style={{ background: '#ef4444' }}></div> Rejected ({stats.rejected})</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-footer">
                <p>Need help? Visit our <a href="#">documentation</a> or contact support.</p>
            </div>
        </main>
    );
};

const StatCard = ({ icon, label, value, color, onClick }) => (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <div className="stat-icon" style={{ backgroundColor: `${color}15`, color }}>
            {icon}
        </div>
        <div className="stat-details">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
        </div>
    </div>
);

export default Dashboard;
