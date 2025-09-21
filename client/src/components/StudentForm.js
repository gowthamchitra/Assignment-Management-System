import React, { useEffect } from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';

const StudentForm = ({ student, facultyList, onSubmit, loading }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (student) {
            reset({
                name: student.name,
                regNo: student.regNo,
                assignmentTitle: student.assignmentTitle,
                assignedFaculty: student.assignedFaculty?._id || '',
            });
        }
    }, [student, reset]);

    return (
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
                disabled={loading}
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
                disabled={loading}
            />
            <TextField
                margin="normal"
                required
                fullWidth
                label="Assignment Title"
                autoComplete="assignmentTitle"
                {...register('assignmentTitle', { required: 'Assignment title is required' })}
                error={!!errors.assignmentTitle}
                helperText={errors.assignmentTitle?.message}
                disabled={loading}
            />
            <FormControl fullWidth margin="normal" required>
                <InputLabel>Assigned Faculty</InputLabel>
                <Select
                    {...register('assignedFaculty', { required: 'Faculty is required' })}
                    label="Assigned Faculty"
                    error={!!errors.assignedFaculty}
                    disabled={loading}
                >
                    {facultyList.map((faculty) => (
                        <MenuItem key={faculty._id} value={faculty._id}>
                            {faculty.name} ({faculty.email})
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default StudentForm;
