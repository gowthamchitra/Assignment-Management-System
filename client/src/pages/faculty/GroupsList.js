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
    Chip,
    Alert,
    Card,
    CardContent,
    Link,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Link as LinkIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { facultyAPI } from '../../services/api.ts';
import toast from 'react-hot-toast';

const GroupsList = () => {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        assignmentTitle: '',
    });

    const queryClient = useQueryClient();

    const { data: groups = [], isLoading } = useQuery(
        'faculty-groups',
        () => facultyAPI.getGroups(),
        {
            select: (response) => response.data,
        }
    );

    const updateGroupMutation = useMutation(
        ({ id, data }) => facultyAPI.updateGroup(id, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('faculty-groups');
                toast.success('Group updated successfully');
                setEditDialogOpen(false);
                setSelectedGroup(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to update group');
            },
        }
    );

    const deleteGroupMutation = useMutation(
        (id) => facultyAPI.deleteGroup(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('faculty-groups');
                queryClient.invalidateQueries('available-students');
                toast.success('Group deleted successfully');
                setDeleteDialogOpen(false);
                setSelectedGroup(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete group');
            },
        }
    );

    const handleEdit = (group) => {
        setSelectedGroup(group);
        setEditForm({
            assignmentTitle: group.assignmentTitle,
        });
        setEditDialogOpen(true);
    };

    const handleDelete = (group) => {
        setSelectedGroup(group);
        setDeleteDialogOpen(true);
    };

    const handleUpdateGroup = () => {
        if (selectedGroup) {
            updateGroupMutation.mutate({ id: selectedGroup._id, data: editForm });
        }
    };

    const handleConfirmDelete = () => {
        if (selectedGroup) {
            deleteGroupMutation.mutate(selectedGroup._id);
        }
    };

    if (isLoading) {
        return <Box>Loading...</Box>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Groups List
            </Typography>

            {groups.length === 0 ? (
                <Card>
                    <CardContent>
                        <Alert severity="info">
                            No groups created yet. Go to "Create Groups" to create your first group.
                        </Alert>
                    </CardContent>
                </Card>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Assignment Title</TableCell>
                                <TableCell>Students</TableCell>
                                <TableCell>Google Form</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {groups.map((group) => (
                                <TableRow key={group._id}>
                                    <TableCell>{group.assignmentTitle}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            {group.students.map((student) => (
                                                <Chip
                                                    key={student._id}
                                                    label={`${student.name} (${student.regNo})`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<LinkIcon />}
                                            component={Link}
                                            href={group.googleFormLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Open Form
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(group.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEdit(group)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(group)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Edit Group Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Group</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Assignment Title"
                            value={editForm.assignmentTitle}
                            onChange={(e) => setEditForm({ ...editForm, assignmentTitle: e.target.value })}
                            fullWidth
                        />
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Student assignments cannot be changed after group creation.
                            To change students, delete this group and create a new one.
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleUpdateGroup}
                        variant="contained"
                        disabled={updateGroupMutation.isLoading}
                    >
                        {updateGroupMutation.isLoading ? 'Updating...' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the group "{selectedGroup?.assignmentTitle}"?
                        This will make the students available for new group assignments.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        disabled={deleteGroupMutation.isLoading}
                    >
                        {deleteGroupMutation.isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GroupsList;
