import React, { useState, useEffect } from 'react';
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
    Search as SearchIcon,
    FilterList as FilterIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api.ts';
import toast from 'react-hot-toast';
import StudentForm from '../../components/StudentForm.js';

const StudentsList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [facultyFilter, setFacultyFilter] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [facultyList, setFacultyList] = useState([]);

    const queryClient = useQueryClient();

    const { data: students = [], isLoading } = useQuery(
        ['admin-students', searchTerm, facultyFilter],
        () => adminAPI.getStudents({ search: searchTerm, faculty: facultyFilter }),
        {
            select: (response) => response.data,
        }
    );

    const { data: faculty = [] } = useQuery(
        'admin-faculty',
        () => adminAPI.getFaculty(),
        {
            select: (response) => response.data,
            onSuccess: (data) => setFacultyList(data),
        }
    );

    const updateStudentMutation = useMutation(
        ({ id, data }) => adminAPI.updateStudent(id, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('admin-students');
                toast.success('Student updated successfully');
                setEditDialogOpen(false);
                setSelectedStudent(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to update student');
            },
        }
    );

    const deleteStudentMutation = useMutation(
        (id) => adminAPI.deleteStudent(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('admin-students');
                toast.success('Student deleted successfully');
                setDeleteDialogOpen(false);
                setSelectedStudent(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete student');
            },
        }
    );

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setEditDialogOpen(true);
    };

    const handleDelete = (student) => {
        setSelectedStudent(student);
        setDeleteDialogOpen(true);
    };

    const handleUpdateStudent = (data) => {
        if (selectedStudent) {
            updateStudentMutation.mutate({ id: selectedStudent._id, data });
        }
    };

    const handleConfirmDelete = () => {
        if (selectedStudent) {
            deleteStudentMutation.mutate(selectedStudent._id);
        }
    };

    const filteredStudents = students.filter((student) => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.regNo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFaculty = !facultyFilter || student.assignedFaculty._id === facultyFilter;
        return matchesSearch && matchesFaculty;
    });

    if (isLoading) {
        return <Box>Loading...</Box>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Students List
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Search by name or registration number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{ minWidth: 300 }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Faculty</InputLabel>
                    <Select
                        value={facultyFilter}
                        onChange={(e) => setFacultyFilter(e.target.value)}
                        label="Filter by Faculty"
                    >
                        <MenuItem value="">All Faculty</MenuItem>
                        {facultyList.map((fac) => (
                            <MenuItem key={fac._id} value={fac._id}>
                                {fac.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>S.No.</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Reg. No.</TableCell>
                            <TableCell>Assignment Title</TableCell>
                            <TableCell>Assigned Faculty</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents.map((student, index) => (
                            <TableRow key={student._id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.regNo}</TableCell>
                                <TableCell>{student.assignmentTitle}</TableCell>
                                <TableCell>
                                    <Chip label={student.assignedFaculty.name} size="small" />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(student)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(student)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {filteredStudents.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No students found matching your criteria.
                </Alert>
            )}

            {/* Edit Student Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Student</DialogTitle>
                <DialogContent>
                    {selectedStudent && (
                        <StudentForm
                            student={selectedStudent}
                            facultyList={facultyList}
                            onSubmit={handleUpdateStudent}
                            loading={updateStudentMutation.isLoading}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete student "{selectedStudent?.name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        disabled={deleteStudentMutation.isLoading}
                    >
                        {deleteStudentMutation.isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudentsList;