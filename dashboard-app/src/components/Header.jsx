import React, { useState, useEffect } from 'react';
import { Search, Plus, Gift, HelpCircle, Bell, LogOut } from 'lucide-react';
import './Header.css';
import logo from '../assets/medianet_logo.png';
import { useAuth } from '../context/AuthContext';
import { fetchNotifications, markNotificationsRead } from '../utils/api';

const Header = ({ onViewChange }) => {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications().then(data => setNotifications(data)).catch(console.error);
        }
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read_at).length;

    const handleNotificationsClick = async () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications && unreadCount > 0) {
            await markNotificationsRead();
            setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
        }
    };

    return (
        <header className="app-header-premium">
            <div className="header-glass-layer"></div>
            <div className="header-content-wrapper">
                <div className="header-left">
                    <div className="text-logo-premium">
                        Media<span>Net</span>
                    </div>
                </div>

                <div className="header-search-container">
                    {/* Search bar removed per request */}
                </div>

                <div className="header-actions">
                    <div className="action-buttons-group">
                        <div style={{ position: 'relative' }}>
                            <button className="premium-icon-btn notification-btn" title="Notifications" onClick={handleNotificationsClick}>
                                <Bell size={20} />
                                {unreadCount > 0 && <span className="notification-indicator" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', fontSize: '9px', fontWeight: 'bold' }}>{unreadCount}</span>}
                            </button>

                            {showNotifications && (
                                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', width: '320px', zIndex: 100, maxHeight: '400px', overflowY: 'auto' }}>
                                    <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b' }}>
                                        Notifications
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                                            No new notifications
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {notifications.map(notif => (
                                                <div key={notif.id} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', background: notif.read_at ? 'white' : '#f8fafc', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: notif.read_at ? 'transparent' : '#3b82f6', marginTop: '0.35rem', flexShrink: 0 }}></div>
                                                    <div>
                                                        <div style={{ fontSize: '0.875rem', color: '#1e293b', marginBottom: '0.25rem' }}>{notif.data.message}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(notif.created_at).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="header-divider"></div>

                    <div className="user-profile-premium">
                        <div className="user-text-info">
                            <span className="user-name">{user?.name || 'Recruiter'}</span>
                            <span className="user-role">{user?.role === 'super-admin' ? 'Super Admin' : user?.role === 'admin' ? 'Recruiter' : 'Candidate'}</span>
                        </div>
                        <div className="avatar-dropdown-wrapper">
                            <div className="premium-user-avatar" onClick={() => onViewChange && onViewChange('profile')} style={{ cursor: 'pointer' }}>
                                <span>{user?.name?.substring(0, 2).toUpperCase() || 'TM'}</span>
                            </div>
                            <button className="sign-out-trigger" onClick={logout} title="Sign Out">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
