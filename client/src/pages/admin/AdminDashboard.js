import React, { useState } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    useMediaQuery,
    useTheme,
    CssBaseline,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    School as SchoolIcon,
    Assessment as AssessmentIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import StudentsList from './StudentsList.js';
import FacultyManagement from './FacultyManagement.js';
import WeeklyReports from './WeeklyReports.js';
import { useQuery } from 'react-query';
import { adminAPI } from '../../services/api.ts';

const drawerWidth = 240;

const AdminDashboard = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard');
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, view: 'dashboard' },
        { text: 'Students List', icon: <PeopleIcon />, view: 'students' },
        { text: 'Faculty Management', icon: <SchoolIcon />, view: 'faculty' },
        { text: 'Weekly Reports', icon: <AssessmentIcon />, view: 'reports' },
    ];

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    Admin Panel
                </Typography>
            </Toolbar>
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => {
                            setCurrentView(item.view);
                            if (isMobile) {
                                setMobileOpen(false);
                            }
                        }}
                        selected={currentView === item.view}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                <ListItem button onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </div>
    );

    const renderContent = () => {
        switch (currentView) {
            case 'students':
                return <StudentsList />;
            case 'faculty':
                return <FacultyManagement />;
            case 'reports':
                return <WeeklyReports />;
            default:
                return <AdminOverview />;
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Welcome, {user?.name}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                <Toolbar />
                {renderContent()}
            </Box>
        </Box>
    );
};

// Admin Overview Component
const AdminOverview = () => {
    // Fetch dashboard stats using useQuery
    const { data: stats = {}, isLoading } = useQuery(
        'admin-dashboard-stats',
        () => adminAPI.getDashboard(),
        {
            select: (response) => response.data,
        }
    );

    if (isLoading) {
        return <Box>Loading dashboard stats...</Box>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 4 }}>
                <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="h6">Total Students</Typography>
                    <Typography variant="h3">{stats.totalStudents || 0}</Typography>
                </Box>
                <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="h6">Total Faculty</Typography>
                    <Typography variant="h3">{stats.totalFaculty || 0}</Typography>
                </Box>
                <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="h6">Total Groups</Typography>
                    <Typography variant="h3">{stats.totalGroups || 0}</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default AdminDashboard;