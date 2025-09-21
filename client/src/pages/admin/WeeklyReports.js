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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Alert,
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { adminAPI, reportsAPI } from '../../services/api.ts';
import toast from 'react-hot-toast';

const WeeklyReports = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [facultyFilter, setFacultyFilter] = useState('');
    const [selectedStudentSheetData, setSelectedStudentSheetData] = useState(null);
    const [viewReportDialogOpen, setViewReportDialogOpen] = useState(false);
    const [googleSheetsData, setGoogleSheetsData] = useState([]);
    const [tableHeaders, setTableHeaders] = useState([]);

    // Fetches all students from the database
    const { data: students = [], isLoading: isStudentsLoading } = useQuery(
        ['admin-students', searchTerm, facultyFilter],
        () => adminAPI.getStudents({ search: searchTerm, faculty: facultyFilter }),
        {
            select: (response) => response.data,
            // Fetch Google Sheets data on initial load
            onSuccess: (studentData) => {
                if (studentData.length > 0) {
                    refetchSheets();
                }
            },
        }
    );

    const { data: faculty = [] } = useQuery(
        'admin-faculty',
        () => adminAPI.getFaculty(),
        {
            select: (response) => response.data,
        }
    );

    // Fetches all Google Sheets data in the background
    const { isLoading: isSheetsLoading, refetch: refetchSheets } = useQuery(
        'google-sheets',
        () => reportsAPI.getGoogleSheets(),
        {
            select: (response) => response.data,
            onSuccess: (data) => {
                if (data.data && data.data.length > 0) {
                    setTableHeaders(data.data[0]);
                    setGoogleSheetsData(data.data.slice(1) || []);
                } else {
                    setTableHeaders([]);
                    setGoogleSheetsData([]);
                }
            },
        }
    );

    // Function to handle viewing a specific student's report
    const handleViewReport = (studentRegNo) => {
        // Find the row in Google Sheets data that contains the student's registration number
        const studentSheetRow = googleSheetsData.find(row => 
            row.includes(studentRegNo)
        );

        if (studentSheetRow) {
            setSelectedStudentSheetData(studentSheetRow);
            setViewReportDialogOpen(true);
        } else {
            toast.error('No Google Sheets data found for this student.');
        }
    };

    const filteredStudents = students.filter((student) => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.regNo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFaculty = !facultyFilter || student.assignedFaculty._id === facultyFilter;
        return matchesSearch && matchesFaculty;
    });

    if (isStudentsLoading) {
        return <Box>Loading students...</Box>;
    }
    
    // Function to check if a student has a filled report
    const hasFilledReport = (regNo) => {
        if (!googleSheetsData || googleSheetsData.length === 0) return false;
        return googleSheetsData.some(row => row.includes(regNo));
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Weekly Reports
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
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
                        {faculty.map((fac) => (
                            <MenuItem key={fac._id} value={fac._id}>
                                {fac.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={refetchSheets}
                    disabled={isSheetsLoading}
                >
                    {isSheetsLoading ? 'Fetching Sheets...' : 'Refresh Sheets Data'}
                </Button>
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
                            <TableCell>Report Status</TableCell>
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
                                    {hasFilledReport(student.regNo) ? (
                                        <Alert severity="success" sx={{ py: 0 }}>
                                            Filled
                                        </Alert>
                                    ) : (
                                        <Alert severity="warning" sx={{ py: 0 }}>
                                            Not Filled
                                        </Alert>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<ViewIcon />}
                                        onClick={() => handleViewReport(student.regNo)}
                                        disabled={!hasFilledReport(student.regNo)}
                                    >
                                        View Report
                                    </Button>
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

            {/* Dialog to display a single student's report data from Google Sheets */}
            <Dialog open={viewReportDialogOpen} onClose={() => setViewReportDialogOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>Student Report from Google Sheets</DialogTitle>
                <DialogContent>
                    {selectedStudentSheetData && tableHeaders.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {tableHeaders.map((header, index) => (
                                            <TableCell key={index} sx={{ fontWeight: 'bold' }}>{header}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        {selectedStudentSheetData.map((cell, cellIndex) => (
                                            <TableCell key={cellIndex}>{cell}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Alert severity="info">No data to display for this student.</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewReportDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WeeklyReports;