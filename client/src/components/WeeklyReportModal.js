import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Alert,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Edit as EditIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { reportsAPI } from '../services/api.ts';
import toast from 'react-hot-toast';

const WeeklyReportModal = ({ student, onClose }) => {
    const [addReportOpen, setAddReportOpen] = useState(false);
    const [editReportOpen, setEditReportOpen] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState(0);
    const [reportForm, setReportForm] = useState({
        week: 1,
        report: '',
    });

    const queryClient = useQueryClient();

    const addReportMutation = useMutation(
        (data) => reportsAPI.addReport(student._id, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('admin-students');
                toast.success('Report added successfully');
                setAddReportOpen(false);
                setReportForm({ week: 1, report: '' });
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to add report');
            },
        }
    );

    const updateReportMutation = useMutation(
        ({ week, data }) =>
            reportsAPI.updateReport(student._id, week, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('admin-students');
                toast.success('Report updated successfully');
                setEditReportOpen(false);
                setReportForm({ week: 1, report: '' });
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to update report');
            },
        }
    );

    const handleAddReport = () => {
        setReportForm({ week: 1, report: '' });
        setAddReportOpen(true);
    };

    const handleEditReport = (week) => {
        const existingReport = student.weeklyReports.find(r => r.week === week);
        setSelectedWeek(week);
        setReportForm({
            week,
            report: existingReport?.report || '',
        });
        setEditReportOpen(true);
    };

    const handleSubmitReport = () => {
        if (editReportOpen) {
            updateReportMutation.mutate({
                week: selectedWeek,
                data: { report: reportForm.report },
            });
        } else {
            addReportMutation.mutate(reportForm);
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Student: {student.name} ({student.regNo})
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Assignment: {student.assignmentTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Faculty: {student.assignedFaculty.name}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 2 }}>
                <Typography variant="h6">Weekly Reports</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddReport}
                >
                    Add Report
                </Button>
            </Box>

            {student.weeklyReports.length === 0 ? (
                <Alert severity="info">No reports submitted yet.</Alert>
            ) : (
                <Box>
                    {student.weeklyReports
                        .sort((a, b) => a.week - b.week)
                        .map((report) => (
                            <Card key={report.week} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="h6">
                                            Week {report.week}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditReport(report.week)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Submitted: {new Date(report.submittedAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body1">
                                        {report.report}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                </Box>
            )}

            {/* Add Report Dialog */}
            <Dialog open={addReportOpen} onClose={() => setAddReportOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Weekly Report</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Week</InputLabel>
                            <Select
                                value={reportForm.week}
                                onChange={(e) => setReportForm({ ...reportForm, week: parseInt(e.target.value) })}
                                label="Week"
                            >
                                {Array.from({ length: 20 }, (_, i) => i + 1).map(week => (
                                    <MenuItem key={week} value={week}>
                                        Week {week}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Report Content"
                            multiline
                            rows={6}
                            fullWidth
                            value={reportForm.report}
                            onChange={(e) => setReportForm({ ...reportForm, report: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddReportOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubmitReport}
                        variant="contained"
                        disabled={addReportMutation.isLoading || !reportForm.report.trim()}
                    >
                        {addReportMutation.isLoading ? 'Adding...' : 'Add Report'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Report Dialog */}
            <Dialog open={editReportOpen} onClose={() => setEditReportOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Weekly Report - Week {selectedWeek}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Report Content"
                            multiline
                            rows={6}
                            fullWidth
                            value={reportForm.report}
                            onChange={(e) => setReportForm({ ...reportForm, report: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditReportOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubmitReport}
                        variant="contained"
                        disabled={updateReportMutation.isLoading || !reportForm.report.trim()}
                    >
                        {updateReportMutation.isLoading ? 'Updating...' : 'Update Report'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WeeklyReportModal;
