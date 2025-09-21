import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    register: (name: string, email: string, password: string, role: string) =>
        api.post('/auth/register', { name, email, password, role }),
    getMe: () => api.get('/auth/me'),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) =>
        api.post('/auth/reset-password', { token, password }),
};

export const adminAPI = {
    getStudents: (params?: any) => api.get('/admin/students', { params }),
    getStudentReports: (id: string) => api.get(`/admin/students/${id}/reports`),
    updateStudent: (id: string, data: any) => api.put(`/admin/students/${id}`, data),
    deleteStudent: (id: string) => api.delete(`/admin/students/${id}`),
    getFaculty: () => api.get('/admin/faculty'),
    updateFaculty: (id: string, data: any) => api.put(`/admin/faculty/${id}`, data),
    deleteFaculty: (id: string) => api.delete(`/admin/faculty/${id}`),
    getDashboard: () => api.get('/admin/dashboard'),
};

export const facultyAPI = {
    addStudent: (data: any) => api.post('/faculty/students', data),
    getStudents: () => api.get('/faculty/students'),
    getAvailableStudents: () => api.get('/faculty/students/available'),
    createGroup: (data: any) => api.post('/faculty/groups', data),
    getGroups: () => api.get('/faculty/groups'),
    updateGroup: (id: string, data: any) => api.put(`/faculty/groups/${id}`, data),
    deleteGroup: (id: string) => api.delete(`/faculty/groups/${id}`),
    getDashboard: () => api.get('/faculty/dashboard'),
};

export const studentsAPI = {
    getStudents: () => api.get('/students'),
    getStudent: (id: string) => api.get(`/students/${id}`),
};

export const groupsAPI = {
    getGroups: () => api.get('/groups'),
    getGroup: (id: string) => api.get(`/groups/${id}`),
};

export const reportsAPI = {
    getStudentReports: (id: string) => api.get(`/reports/student/${id}`),
    addReport: (id: string, data: any) => api.post(`/reports/student/${id}`, data),
    updateReport: (id: string, week: number, data: any) =>
        api.put(`/reports/student/${id}/week/${week}`, data),
    deleteReport: (id: string, week: number) =>
        api.delete(`/reports/student/${id}/week/${week}`),
    getGoogleSheets: () => api.get('/reports/google-sheets'),
};

export default api;
