import React, { useState } from 'react';
import {
    Box,
    Typography,
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
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Alert,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api.ts';
import toast from 'react-hot-toast';

const FacultyManagement = () => {
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    assignedStudents: [],
});

    const queryClient = useQueryClient();

    const { data: faculty = [], isLoading } = useQuery(
        'admin-faculty',
        () => adminAPI.getFaculty(),
        {
            select: (response) => response.data,
        }
    );

    const { data: students = [] } = useQuery(
        'admin-students',
        () => adminAPI.getStudents(),
        {
            select: (response) => response.data,
        }
    );

    const updateFacultyMutation = useMutation(
        ({ id, data }) => adminAPI.updateFaculty(id, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('admin-faculty');
                toast.success('Faculty updated successfully');
                setEditDialogOpen(false);
                setSelectedFaculty(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to update faculty');
            },
        }
    );

    const deleteFacultyMutation = useMutation(
        (id) => adminAPI.deleteFaculty(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('admin-faculty');
                toast.success('Faculty deleted successfully');
                setDeleteDialogOpen(false);
                setSelectedFaculty(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete faculty');
            },
        }
    );

    const handleEdit = (faculty) => {
        setSelectedFaculty(faculty);
        setEditForm({
            name: faculty.name,
            email: faculty.email,
            assignedStudents: faculty.assignedStudents.map(s => s._id),
        });
        setEditDialogOpen(true);
    };

    const handleDelete = (faculty) => {
        setSelectedFaculty(faculty);
        setDeleteDialogOpen(true);
    };

    const handleUpdateFaculty = () => {
        if (selectedFaculty) {
            updateFacultyMutation.mutate({ id: selectedFaculty._id, data: editForm });
        }
    };

    const handleConfirmDelete = () => {
        if (selectedFaculty) {
            deleteFacultyMutation.mutate(selectedFaculty._id);
        }
    };

    if (isLoading) {
        return <Box>Loading...</Box>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Faculty Management
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Assigned Students</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {faculty.map((fac) => (
                            <TableRow key={fac._id}>
                                <TableCell>{fac.name}</TableCell>
                                <TableCell>{fac.email}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {fac.assignedStudents.map((student) => (
                                            <Chip
                                                key={student._id}
                                                label={`${student.name} (${student.regNo})`}
                                                size="small"
                                            />
                                        ))}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(fac)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(fac)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {faculty.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No faculty members found.
                </Alert>
            )}

            {/* Edit Faculty Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Faculty</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Assigned Students</InputLabel>
                            <Select
                                multiple
                                value={editForm.assignedStudents}
                                onChange={(e) => setEditForm({ ...editForm, assignedStudents: e.target.value })}
                                label="Assigned Students"
                            >
                                {students.map((student) => (
                                <MenuItem key={student._id} value={student._id}>
                                    {student.name} ({student.regNo})
                                </MenuItem>
                                 ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleUpdateFaculty}
                        variant="contained"
                        disabled={updateFacultyMutation.isLoading}
                    >
                        {updateFacultyMutation.isLoading ? 'Updating...' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete faculty member "{selectedFaculty?.name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        disabled={deleteFacultyMutation.isLoading}
                    >
                        {deleteFacultyMutation.isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FacultyManagement;
