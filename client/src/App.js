import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.js';
import Login from './pages/Login.js';
import AdminDashboard from './pages/admin/AdminDashboard.js';
import FacultyDashboard from './pages/faculty/FacultyDashboard.js';
import LoadingSpinner from './components/LoadingSpinner.js';

const App = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/faculty'} /> : <Login />}
            />
            <Route
                path="/admin/*"
                element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
            />
            <Route
                path="/faculty/*"
                element={user?.role === 'faculty' ? <FacultyDashboard /> : <Navigate to="/login" />}
            />
            <Route
                path="/"
                element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/faculty') : '/login'} />}
            />
        </Routes>
    );
};

export default App;
