const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Student = require('../models/Student');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/students
// @desc    Get all students (for admin) or assigned students (for faculty)
// @access  Private
router.get('/', async (req, res) => {
    try {
        let query = {};

        // If user is faculty, only show their assigned students
        if (req.user.role === 'faculty') {
            query.assignedFaculty = req.user._id;
        }

        const students = await Student.find(query)
            .populate('assignedFaculty', 'name email')
            .populate('groupId', 'assignmentTitle')
            .sort({ createdAt: -1 });

        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/students/:id
// @desc    Get single student
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        let query = { _id: req.params.id };

        // If user is faculty, only allow access to their assigned students
        if (req.user.role === 'faculty') {
            query.assignedFaculty = req.user._id;
        }

        const student = await Student.findOne(query)
            .populate('assignedFaculty', 'name email')
            .populate('groupId', 'assignmentTitle students');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
