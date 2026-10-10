import { Home, Layers, Briefcase, Users, Shield, Zap, Search, User, Building, FileText } from 'lucide-react';
import './Sidebar.css';
import logo from '../assets/medianet_logo.png';

const Sidebar = ({ currentView, onViewChange, permissions = [], isSuperAdmin, isCandidate }) => {
    const hasPermission = (p) => isSuperAdmin || permissions.includes(p);

    if (isCandidate) {
        return (
            <aside className="sidebar">
                <nav className="sidebar-nav">
                    <div className="nav-group">
                        <NavItem
                            icon={<Home size={20} />}
                            label="Home"
                            active={currentView === 'home'}
                            onClick={() => onViewChange('home')}
                        />
                        <NavItem
                            icon={<Search size={20} />}
                            label="Job Offers"
                            active={currentView === 'jobs'}
                            onClick={() => onViewChange('jobs')}
                        />
                        <NavItem
                            icon={<Zap size={20} />}
                            label="Job Matching"
                            active={currentView === 'matching'}
                            onClick={() => onViewChange('matching')}
                        />
                        <NavItem
                            icon={<User size={20} />}
                            label="Profile"
                            active={currentView === 'profile'}
                            onClick={() => onViewChange('profile')}
                        />
                    </div>
                </nav>
            </aside>
        );
    }

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <div className="nav-group">
                    <NavItem
                        icon={<Home size={20} />}
                        label="Home"
                        active={currentView === 'home'}
                        onClick={() => onViewChange('home')}
                    />
                    <NavItem
                        icon={<Layers size={20} />}
                        label="Departments"
                        active={currentView === 'departments'}
                        onClick={() => onViewChange('departments')}
                    />
                    <NavItem
                        icon={<FileText size={20} />}
                        label="Job Templates"
                        active={currentView === 'templates'}
                        onClick={() => onViewChange('templates')}
                    />
                    <NavItem
                        icon={<Briefcase size={20} />}
                        label="Jobs"
                        active={currentView === 'jobs'}
                        onClick={() => onViewChange('jobs')}
                    />
                    <NavItem
                        icon={<Users size={20} />}
                        label="Candidates"
                        active={currentView === 'candidates'}
                        onClick={() => onViewChange('candidates')}
                    />
                    <NavItem
                        icon={<Building size={20} />}
                        label="Employees"
                        active={currentView === 'employees'}
                        onClick={() => onViewChange('employees')}
                    />
                    
                    {isSuperAdmin && (
                        <div style={{ marginTop: '2rem' }}>
                            <div className="nav-label" style={{ padding: '0.75rem 1rem', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Administration</div>
                            <NavItem
                                icon={<Shield size={20} />}
                                label="Permissions"
                                active={currentView === 'permissions'}
                                onClick={() => onViewChange('permissions')}
                            />
                        </div>
                    )}
                </div>
            </nav>
        </aside>
    );
};

const NavItem = ({ icon, label, active, onClick }) => {
    return (
        <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
        </div>
    );
};

export default Sidebar;
