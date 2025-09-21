import React, { useState } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Tab,
    Tabs,
    Alert,
    CircularProgress,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext.js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [resetPassword, setResetPassword] = useState('');
    const [confirmResetPassword, setConfirmResetPassword] = useState('');
    const [searchParams] = useSearchParams();

    const { login, register, forgotPassword: sendForgotPassword, resetPassword: sendResetPassword } = useAuth();
    const navigate = useNavigate();

    const loginForm = useForm();
    const registerForm = useForm();

    React.useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            setResetToken(token);
            setResetPasswordOpen(true);
        }
    }, [searchParams]);

    const handleLogin = async (data) => {
        setLoading(true);
        try {
            await login(data.email, data.password);
            toast.success('Login successful!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (data) => {
        if (data.password !== data.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await register(data.name, data.email, data.password, data.role);
            toast.success('Registration successful!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!forgotEmail) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);
        try {
            await sendForgotPassword(forgotEmail);
            toast.success('Password reset email sent!');
            setForgotPasswordOpen(false);
            setForgotEmail('');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetPassword || !confirmResetPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (resetPassword !== confirmResetPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await sendResetPassword(resetToken, resetPassword);
            toast.success('Password reset successful!');
            setResetPasswordOpen(false);
            setResetToken('');
            setResetPassword('');
            setConfirmResetPassword('');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        Assignment Management System
                    </Typography>

                    <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} centered>
                        <Tab label="Login" />
                        <Tab label="Register" />
                    </Tabs>

                    {tabValue === 0 && (
                        <Box component="form" onSubmit={loginForm.handleSubmit(handleLogin)} sx={{ mt: 2 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                autoComplete="email"
                                autoFocus
                                {...loginForm.register('email', { required: 'Email is required' })}
                                error={!!loginForm.formState.errors.email}
                                helperText={loginForm.formState.errors.email?.message}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                {...loginForm.register('password', { required: 'Password is required' })}
                                error={!!loginForm.formState.errors.password}
                                helperText={loginForm.formState.errors.password?.message}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Sign In'}
                            </Button>
                            <Box textAlign="center">
                                <Link
                                    component="button"
                                    type="button"
                                    variant="body2"
                                    onClick={() => setForgotPasswordOpen(true)}
                                >
                                    Forgot password?
                                </Link>
                            </Box>
                        </Box>
                    )}

                    {tabValue === 1 && (
                        <Box component="form" onSubmit={registerForm.handleSubmit(handleRegister)} sx={{ mt: 2 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Full Name"
                                autoComplete="name"
                                autoFocus
                                {...registerForm.register('name', { required: 'Name is required' })}
                                error={!!registerForm.formState.errors.name}
                                helperText={registerForm.formState.errors.name?.message}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                autoComplete="email"
                                {...registerForm.register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                                error={!!registerForm.formState.errors.email}
                                helperText={registerForm.formState.errors.email?.message}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                {...registerForm.register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters'
                                    }
                                })}
                                error={!!registerForm.formState.errors.password}
                                helperText={registerForm.formState.errors.password?.message}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                id="confirmPassword"
                                autoComplete="new-password"
                                {...registerForm.register('confirmPassword', { required: 'Please confirm password' })}
                                error={!!registerForm.formState.errors.confirmPassword}
                                helperText={registerForm.formState.errors.confirmPassword?.message}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                select
                                label="Role"
                                id="role"
                                {...registerForm.register('role', { required: 'Role is required' })}
                                error={!!registerForm.formState.errors.role}
                                helperText={registerForm.formState.errors.role?.message}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="faculty">Faculty</option>
                            </TextField>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* Forgot Password Dialog */}
            <Dialog open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)}>
                <DialogTitle>Forgot Password</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setForgotPasswordOpen(false)}>Cancel</Button>
                    <Button onClick={handleForgotPassword} disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : 'Send Reset Email'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={resetPasswordOpen} onClose={() => setResetPasswordOpen(false)}>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Confirm New Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={confirmResetPassword}
                        onChange={(e) => setConfirmResetPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResetPasswordOpen(false)}>Cancel</Button>
                    <Button onClick={handleResetPassword} disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : 'Reset Password'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Login;
