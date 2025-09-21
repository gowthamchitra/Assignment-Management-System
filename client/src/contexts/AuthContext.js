import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.ts';

const AuthContext = createContext(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            authAPI.getMe()
                .then(response => {
                    setUser(response.data.user);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            setUser(user);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const response = await authAPI.register(name, email, password, role);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            setUser(user);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const forgotPassword = async (email) => {
        try {
            await authAPI.forgotPassword(email);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to send reset email');
        }
    };

    const resetPassword = async (token, password) => {
        try {
            await authAPI.resetPassword(token, password);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to reset password');
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
