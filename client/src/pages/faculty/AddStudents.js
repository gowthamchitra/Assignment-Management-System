import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Card,
    CardContent,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { facultyAPI } from '../../services/api.ts';
import toast from 'react-hot-toast';

const AddStudents = () => {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const queryClient = useQueryClient();

    const { data: students = [], isLoading } = useQuery(
        'faculty-students',
        () => facultyAPI.getStudents(),
        {
            select: (response) => response.data,
        }
    );

    const addStudentMutation = useMutation(
        (data) => facultyAPI.addStudent(data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('faculty-students');
                toast.success('Student added successfully');
                setAddDialogOpen(false);
                reset();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to add student');
            },
        }
    );

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        // Only send 'name' and 'regNo' to the API
        const studentData = {
            name: data.name,
            regNo: data.regNo,
        };
        addStudentMutation.mutate(studentData);
    };

    const handleAddStudent = () => {
        reset();
        setAddDialogOpen(true);
    };

    const handleEditStudent = (student) => {
        setSelectedStudent(student);
        setEditDialogOpen(true);
    };

    if (isLoading) {
        return <Box>Loading...</Box>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    My Students
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddStudent}
                >
                    Add Student
                </Button>
            </Box>
            ---
            {students.length === 0 ? (
                <Card>
                    <CardContent>
                        <Alert severity="info">
                            No students added yet. Click "Add Student" to get started.
                        </Alert>
                    </CardContent>
                </Card>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>S.No.</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Reg. No.</TableCell>
                                <TableCell>Group Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student, index) => (
                                <TableRow key={student._id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.regNo}</TableCell>
                                    <TableCell>
                                        {student.groupId ? (
                                            <Alert severity="success" sx={{ py: 0 }}>
                                                In Group
                                            </Alert>
                                        ) : (
                                            <Alert severity="warning" sx={{ py: 0 }}>
                                                Not in Group
                                            </Alert>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEditStudent(student)}>
                                            <EditIcon />
                                        </IconButton>
                                        {/* You can add the delete functionality here if needed */}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            ---
            {/* Add Student Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Student Name"
                            autoComplete="name"
                            autoFocus
                            {...register('name', { required: 'Name is required' })}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Registration Number"
                            autoComplete="regNo"
                            {...register('regNo', { required: 'Registration number is required' })}
                            error={!!errors.regNo}
                            helperText={errors.regNo?.message}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        variant="contained"
                        disabled={addStudentMutation.isLoading}
                    >
                        {addStudentMutation.isLoading ? 'Adding...' : 'Add Student'}
                    </Button>
                </DialogActions>
            </Dialog>
            ---
            {/* Edit Student Dialog - Placeholder */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Student</DialogTitle>
                <DialogContent>
                    <Alert severity="info">
                        Edit functionality will be implemented here.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddStudents;