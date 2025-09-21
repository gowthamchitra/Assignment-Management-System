const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Group = require('../models/Group');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(adminAuth);

// @route   GET /api/admin/students
// @desc    Get all students with optional filtering
// @access  Private (Admin)
router.get('/students', async (req, res) => {
    try {
        const { search, faculty } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { regNo: { $regex: search, $options: 'i' } }
            ];
        }

        if (faculty) {
            query.assignedFaculty = faculty;
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

// @route   GET /api/admin/students/:id/reports
// @desc    Get weekly reports for a specific student
// @access  Private (Admin)
router.get('/students/:id/reports', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('assignedFaculty', 'name email')
            .select('name regNo assignmentTitle assignedFaculty weeklyReports');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Get student reports error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/students/:id
// @desc    Update student details
// @access  Private (Admin)
router.put('/students/:id', [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('regNo').optional().trim().notEmpty().withMessage('Registration number cannot be empty'),
    body('assignmentTitle').optional().trim().notEmpty().withMessage('Assignment title cannot be empty'),
    body('assignedFaculty').optional().isMongoId().withMessage('Invalid faculty ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, regNo, assignmentTitle, assignedFaculty } = req.body;

        // Check if regNo is being changed and if it already exists
        if (regNo) {
            const existingStudent = await Student.findOne({
                regNo,
                _id: { $ne: req.params.id }
            });
            if (existingStudent) {
                return res.status(400).json({ message: 'Registration number already exists' });
            }
        }

        // Check if faculty exists
        if (assignedFaculty) {
            const faculty = await User.findById(assignedFaculty);
            if (!faculty || faculty.role !== 'faculty') {
                return res.status(400).json({ message: 'Invalid faculty' });
            }
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { name, regNo, assignmentTitle, assignedFaculty },
            { new: true, runValidators: true }
        ).populate('assignedFaculty', 'name email');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/students/:id
// @desc    Delete student
// @access  Private (Admin)
router.delete('/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Remove student from any groups
        await Group.updateMany(
            { students: req.params.id },
            { $pull: { students: req.params.id } }
        );

        await Student.findByIdAndDelete(req.params.id);

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/faculty
// @desc    Get all faculty members
// @access  Private (Admin)
router.get('/faculty', async (req, res) => {
    try {
        const faculty = await User.find({ role: 'faculty' })
            .select('-password')
            .populate('assignedStudents', 'name regNo')
            .sort({ createdAt: -1 });

        res.json(faculty);
    } catch (error) {
        console.error('Get faculty error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/faculty/:id
// @desc    Update faculty details
// @access  Private (Admin)
router.put('/faculty/:id', [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('assignedStudents').optional().isArray().withMessage('Assigned students must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, assignedStudents } = req.body;

        // Check if email is being changed and if it already exists
        if (email) {
            const existingUser = await User.findOne({
                email,
                _id: { $ne: req.params.id }
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        // Validate assigned students
        if (assignedStudents) {
            const validStudents = await Student.find({
                _id: { $in: assignedStudents }
            });
            if (validStudents.length !== assignedStudents.length) {
                return res.status(400).json({ message: 'Invalid student IDs' });
            }
        }

        const faculty = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, assignedStudents },
            { new: true, runValidators: true }
        ).select('-password').populate('assignedStudents', 'name regNo');

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        res.json(faculty);
    } catch (error) {
        console.error('Update faculty error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/faculty/:id
// @desc    Delete faculty member
// @access  Private (Admin)
router.delete('/faculty/:id', async (req, res) => {
    try {
        const faculty = await User.findById(req.params.id);
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Remove faculty from all students
        await Student.updateMany(
            { assignedFaculty: req.params.id },
            { $unset: { assignedFaculty: 1 } }
        );

        // Delete all groups created by this faculty
        await Group.deleteMany({ faculty: req.params.id });

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error('Delete faculty error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalFaculty = await User.countDocuments({ role: 'faculty' });
        const totalGroups = await Group.countDocuments();
        const recentStudents = await Student.find()
            .populate('assignedFaculty', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalStudents,
            totalFaculty,
            totalGroups,
            recentStudents
        });
    } catch (error) {
        console.error('Get dashboard data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
