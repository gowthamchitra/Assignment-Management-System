import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Alert,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Checkbox,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { facultyAPI } from '../../services/api.ts';
import toast from 'react-hot-toast';

const CreateGroups = () => {
    const [selectedStudents, setSelectedStudents] = useState([]);

    const queryClient = useQueryClient();

    const { data: availableStudents = [], isLoading } = useQuery(
        'available-students',
        () => facultyAPI.getAvailableStudents(),
        {
            select: (response) => response.data,
        }
    );
    console.log('availableStudents:', availableStudents);
    const createGroupMutation = useMutation(
        (data) => facultyAPI.createGroup(data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('available-students');
                queryClient.invalidateQueries('faculty-groups');
                toast.success('Group created successfully');
                setSelectedStudents([]);
                reset();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to create group');
            },
        }
    );

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        if (selectedStudents.length !== 2) {
            toast.error('Please select exactly 2 students');
            return;
        }

        createGroupMutation.mutate({
            ...data,
            students: selectedStudents,
        });
    };

    const handleStudentToggle = (studentId) => {
        setSelectedStudents(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId);
            } else if (prev.length < 2) {
                return [...prev, studentId];
            } else {
                toast.error('You can only select 2 students per group');
                return prev;
            }
        });
    };

    if (isLoading) {
        return <Box>Loading...</Box>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Create Groups
            </Typography>

            {availableStudents.length < 2 ? (
                <Card>
                    <CardContent>
                        <Alert severity="warning">
                            You need at least 2 available students to create a group.
                            Please add more students first.
                        </Alert>
                    </CardContent>
                </Card>
            ) : (
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Group Details
                            </Typography>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Assignment Title"
                                autoComplete="assignmentTitle"
                                autoFocus
                                {...register('assignmentTitle', { required: 'Assignment title is required' })}
                                error={!!errors.assignmentTitle}
                                helperText={errors.assignmentTitle?.message}
                            />
                        </CardContent>
                    </Card>

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Select Students (Exactly 2)
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Selected: {selectedStudents.length}/2
                            </Typography>

                            {selectedStudents.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Selected Students:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {selectedStudents.map(studentId => {
                                            const student = availableStudents.find((s) => s._id === studentId);
                                            return student ? (
                                                <Chip
                                                    key={studentId}
                                                    label={`${student.name} (${student.regNo})`}
                                                    onDelete={() => handleStudentToggle(studentId)}
                                                    color="primary"
                                                />
                                            ) : null;
                                        })}
                                    </Box>
                                </Box>
                            )}

                            <List>
                                {availableStudents.map((student) => (
                                    <ListItem key={student._id} divider>
                                        <Checkbox
                                            checked={selectedStudents.includes(student._id)}
                                            onChange={() => handleStudentToggle(student._id)}
                                            disabled={!selectedStudents.includes(student._id) && selectedStudents.length >= 2}
                                        />
                                        <ListItemText
                                            primary={`${student.name} (${student.regNo})`}
                                            secondary={student.assignmentTitle}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={selectedStudents.length !== 2 || createGroupMutation.isLoading}
                        >
                            {createGroupMutation.isLoading ? 'Creating...' : 'Create Group'}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setSelectedStudents([]);
                                reset();
                            }}
                        >
                            Reset
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default CreateGroups;
