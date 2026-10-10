import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { forgotPasswordAPI } from '../../utils/api';
import './Auth.css';
import logo from '../../assets/medianet_logo.png';

const Auth = ({ initialView = 'login' }) => {
    const { login, register } = useAuth();
    const [view, setView] = useState(initialView || 'login'); // 'login', 'register', 'forgot'
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        password_confirmation: '',
        role: 'candidate' 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            if (view === 'login') {
                await login({ email: formData.email, password: formData.password });
            } else if (view === 'register') {
                if (formData.password !== formData.password_confirmation) {
                    throw new Error("Passwords do not match");
                }
                await register(formData);
            } else if (view === 'forgot') {
                const response = await forgotPasswordAPI(formData.email);
                setSuccessMessage(response.status || 'Password reset link sent to your email.');
            }
        } catch (err) {
            let msg = err.message || 'An error occurred. Please try again.';
            if (err.errors) {
                // Formatting Laravel validation errors
                msg = Object.values(err.errors).flat().join(' ');
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-premium-container">
            <div className="auth-visual-side">
                <div className="visual-overlay"></div>
                <div className="visual-content">
                    <div className="text-logo-premium visual-logo-text">
                        Media<span>Net</span>
                    </div>
                    <h1>Shape the future of technology with us.</h1>
                    <p>Join a community of innovators and world-class talent building the next generation of digital solutions.</p>
                    

                </div>
            </div>

            <div className="auth-form-side">
                <div className="auth-card-premium">
                    <div className="auth-header-mobile">
                         <div className="text-logo-premium dark">
                             Media<span>Net</span>
                         </div>
                    </div>
                    
                    <div className="auth-titles">
                        <h2>
                            {view === 'login' && 'Welcome Back'}
                            {view === 'register' && 'Join MediaNet'}
                            {view === 'forgot' && 'Reset Password'}
                        </h2>
                        <p>
                            {view === 'login' && 'Sign in to access your talent dashboard.'}
                            {view === 'register' && 'Start your career journey with a few clicks.'}
                            {view === 'forgot' && 'Enter your email to receive a recovery link.'}
                        </p>
                    </div>

                    {error && <div className="premium-auth-error">{error}</div>}
                    {successMessage && <div className="premium-auth-success">{successMessage}</div>}

                    <form className="premium-auth-form" onSubmit={handleSubmit}>
                        {view === 'register' && (
                            <>
                                <div className="form-group-premium">
                                    <label>I want to join as</label>
                                    <div className="role-selector-grid">
                                        <div 
                                            className={`role-option ${formData.role === 'candidate' ? 'active' : ''}`}
                                            onClick={() => setFormData({...formData, role: 'candidate'})}
                                        >
                                            Candidate
                                        </div>
                                        <div 
                                            className={`role-option ${formData.role === 'admin' ? 'active' : ''}`}
                                            onClick={() => setFormData({...formData, role: 'admin'})}
                                        >
                                            Recruiter
                                        </div>
                                        <div 
                                            className={`role-option ${formData.role === 'super-admin' ? 'active' : ''}`}
                                            onClick={() => setFormData({...formData, role: 'super-admin'})}
                                        >
                                            Super Admin
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group-premium">
                                    <label>Full Name</label>
                                    <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleInputChange} required />
                                </div>
                            </>
                        )}
                        
                        <div className="form-group-premium">
                            <label>Email Address</label>
                            <input type="email" name="email" placeholder="name@company.com" value={formData.email} onChange={handleInputChange} required />
                        </div>

                        {view !== 'forgot' && (
                            <div className="form-group-premium">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label>Password</label>
                                    {view === 'login' && (
                                        <a className="inline-link" onClick={() => setView('forgot')}>Forgot?</a>
                                    )}
                                </div>
                                <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
                            </div>
                        )}

                        {view === 'register' && (
                            <div className="form-group-premium">
                                <label>Confirm Password</label>
                                <input type="password" name="password_confirmation" placeholder="••••••••" value={formData.password_confirmation} onChange={handleInputChange} required />
                            </div>
                        )}

                        <button type="submit" className="premium-auth-button" disabled={loading}>
                            {loading ? (
                                <div className="btn-loader"></div>
                            ) : (
                                <>
                                    {view === 'login' ? 'Sign In to Dashboard' :
                                     view === 'register' ? 'Create Free Account' : 'Send Reset Instructions'}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer-links">
                        {view === 'login' && (
                            <p>New to MediaNet? <a onClick={() => setView('register')}>Create an account</a></p>
                        )}
                        {(view === 'register' || view === 'forgot') && (
                            <p>Already have an account? <a onClick={() => setView('login')}>Sign in</a></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
