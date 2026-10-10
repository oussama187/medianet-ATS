import React, { useState, useEffect } from 'react';
import { resetPasswordAPI } from '../../utils/api';
import './Auth.css';
import logo from '../../assets/medianet_logo.png';

const ResetPassword = () => {
    const [formData, setFormData] = useState({ token: '', email: '', password: '', password_confirmation: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        setFormData({
            ...formData,
            token: queryParams.get('token') || '',
            email: queryParams.get('email') || '',
        });
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        
        if (formData.password !== formData.password_confirmation) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await resetPasswordAPI(formData);
            setSuccessMessage(response.status || 'Password has been successfully reset. You can now login.');
        } catch (err) {
            let msg = err.message || 'An error occurred. Please try again.';
            if (err.errors) {
                msg = Object.values(err.errors).flat().join(' ');
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src={logo} alt="MediaNet Logo" style={{ height: '40px' }} />
                </div>
                <h2>Reset Your Password</h2>

                {error && <div className="auth-error">{error}</div>}
                {successMessage && (
                    <div className="auth-error" style={{ backgroundColor: '#c6f6d5', color: '#276749' }}>
                        {successMessage}
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <a href="/" style={{ color: '#276749', fontWeight: 'bold' }}>Go to Login</a>
                        </div>
                    </div>
                )}

                {!successMessage && (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} readOnly required />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleInputChange} required />
                        </div>
                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Processing...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
