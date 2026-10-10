import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAPI, registerAPI, logoutAPI, getUserAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const userData = await getUserAPI();
            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch user', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const response = await loginAPI(credentials);
        localStorage.setItem('auth_token', response.access_token);
        setUser(response.user);
    };

    const register = async (userData) => {
        const response = await registerAPI(userData);
        localStorage.setItem('auth_token', response.access_token);
        setUser(response.user);
    };

    const logout = async () => {
        try {
            await logoutAPI();
        } catch (e) {
            // Ignore token expiration errors
        }
        localStorage.removeItem('auth_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
