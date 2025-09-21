const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Student = require('../models/Student');
const { google } = require('googleapis');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Google Sheets configuration
const getGoogleSheetsClient = async () => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_SHEETS_CREDENTIALS_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        return sheets;
    } catch (error) {
        console.error('Google Sheets authentication error:', error);
        throw new Error('Failed to authenticate with Google Sheets');
    }
};

// @route   GET /api/reports/student/:id
// @desc    Get student details for reporting
// @access  Private
router.get('/student/:id', async (req, res) => {
    try {
        let query = { _id: req.params.id };

        if (req.user.role === 'faculty') {
            query.assignedFaculty = req.user._id;
        }

        const student = await Student.findOne(query)
            .populate('assignedFaculty', 'name email')
            .select('name regNo assignmentTitle assignedFaculty filledGoogleSheet');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Get student reports error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/reports/student/:id
// @desc    Add a filled Google Sheet URL for a student
// @access  Private
router.post('/student/:id', [
    body('filledGoogleSheet').trim().isURL().withMessage('Filled Google Sheet must be a valid URL')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { filledGoogleSheet } = req.body;

        let query = { _id: req.params.id };

        if (req.user.role === 'faculty') {
            query.assignedFaculty = req.user._id;
        }

        const student = await Student.findOne(query);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.filledGoogleSheet = filledGoogleSheet;
        await student.save();

        res.json(student);
    } catch (error) {
        console.error('Add report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reports/google-sheets
// @desc    Get data from Google Sheets
// @access  Private
router.get('/google-sheets', async (req, res) => {
    try {
        if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
            console.error('GOOGLE_SHEETS_SPREADSHEET_ID not configured in environment variables.');
            return res.status(500).json({ message: 'Server is not configured to fetch Google Sheets data.' });
        }
        
        const sheets = await getGoogleSheetsClient();
        const range = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A1:Z1000'; 

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
            range: range,
        });

        if (!response.data || !response.data.values || response.data.values.length === 0) {
            console.warn(`No data found in Google Sheets at range: ${range}`);
            return res.json({
                data: [],
                message: 'No data available in Google Sheets'
            });
        }

        res.json({
            data: response.data.values,
            message: 'Successfully fetched Google Sheets data'
        });
    } catch (error) {
        console.error('Get Google Sheets data error:', error);
        res.status(500).json({ message: 'Failed to fetch Google Sheets data. Check server logs for details.' });
    }
});

module.exports = router;