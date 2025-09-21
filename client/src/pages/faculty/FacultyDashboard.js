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
    Group as GroupIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import AddStudents from './AddStudents.js';
import CreateGroups from './CreateGroups.js';
import GroupsList from './GroupsList.js';
import { useQuery } from 'react-query';
import { facultyAPI } from '../../services/api.ts';
import toast from 'react-hot-toast';

const drawerWidth = 240;

const FacultyDashboard = () => {
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
        { text: 'Add Students', icon: <PeopleIcon />, view: 'add-students' },
        { text: 'Create Groups', icon: <GroupIcon />, view: 'create-groups' },
        { text: 'Groups List', icon: <GroupIcon />, view: 'groups-list' },
    ];

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    Faculty Panel
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
            case 'add-students':
                return <AddStudents />;
            case 'create-groups':
                return <CreateGroups />;
            case 'groups-list':
                return <GroupsList />;
            default:
                return <FacultyOverview />;
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

// Faculty Overview Component
const FacultyOverview = () => {
    // Fetch dashboard stats using useQuery
    const { data: stats = {}, isLoading } = useQuery(
        'faculty-dashboard-stats',
        () => facultyAPI.getDashboard(),
        {
            select: (response) => response.data,
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to fetch dashboard stats');
            },
        }
    );

    if (isLoading) {
        return <Box>Loading dashboard stats...</Box>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Faculty Dashboard
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 4 }}>
                <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="h6">Total Students</Typography>
                    <Typography variant="h3">{stats.totalStudents || 0}</Typography>
                </Box>
                <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="h6">Total Groups</Typography>
                    <Typography variant="h3">{stats.totalGroups || 0}</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default FacultyDashboard; 