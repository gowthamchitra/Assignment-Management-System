const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, facultyAuth } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Group = require('../models/Group');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(facultyAuth);

// @route   POST /api/faculty/students
// @desc    Add new student
// @access  Private (Faculty)
router.post('/students', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('regNo').trim().notEmpty().withMessage('Registration number is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, regNo } = req.body;

        // Check if regNo already exists
        const existingStudent = await Student.findOne({ regNo });
        if (existingStudent) {
            return res.status(400).json({ message: 'Registration number already exists' });
        }

        // Create new student without an assignment title initially
        const student = new Student({
            name,
            regNo,
            assignedFaculty: req.user._id
        });

        await student.save();

        // Add student to faculty's assigned students
        await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { assignedStudents: student._id } }
        );

        const populatedStudent = await Student.findById(student._id)
            .populate('assignedFaculty', 'name email');

        res.status(201).json(populatedStudent);
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/faculty/students
// @desc    Get students assigned to current faculty
// @access  Private (Faculty)
router.get('/students', async (req, res) => {
    try {
        const students = await Student.find({ assignedFaculty: req.user._id })
            .populate('assignedFaculty', 'name email')
            .populate('groupId')
            .sort({ createdAt: -1 });

        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/faculty/students/available
// @desc    Get available students for group creation
// @access  Private (Faculty)
router.get('/students/available', async (req, res) => {
    try {
        const students = await Student.find({
            assignedFaculty: req.user._id,
            $or: [
                { groupId: { $exists: false } },
                { groupId: null }
            ]
        }).select('name regNo assignmentTitle');

        res.json(students);
    } catch (error) {
        console.error('Get available students error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/faculty/groups
// @desc    Create new group
// @access  Private (Faculty)
router.post('/groups', [
    body('assignmentTitle').trim().notEmpty().withMessage('Assignment title is required'),
    body('students').isArray({ min: 2, max: 2 }).withMessage('Exactly 2 students must be selected')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { assignmentTitle, students } = req.body;

        // Validate that students exist, are assigned to this faculty, and are available
        const validStudents = await Student.find({
    _id: { $in: students },
    assignedFaculty: req.user._id,
    $or: [
        { groupId: { $exists: false } },
        { groupId: null }
    ]
});

        if (validStudents.length !== 2) {
            return res.status(400).json({
                message: 'Invalid students or students already in a group'
            });
        }

        // Create new group
        const group = new Group({
            assignmentTitle,
            students,
            faculty: req.user._id
        });

        await group.save();

        // Update students with group ID and assignment title
        await Student.updateMany(
            { _id: { $in: students } },
            { groupId: group._id, assignmentTitle }
        );

        const populatedGroup = await Group.findById(group._id)
            .populate('students', 'name regNo assignmentTitle')
            .populate('faculty', 'name email');

        res.status(201).json(populatedGroup);
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/faculty/groups
// @desc    Get groups created by current faculty
// @access  Private (Faculty)
router.get('/groups', async (req, res) => {
    try {
        const groups = await Group.find({ faculty: req.user._id })
            .populate('students', 'name regNo assignmentTitle')
            .populate('faculty', 'name email')
            .sort({ createdAt: -1 });

        res.json(groups);
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/faculty/groups/:id
// @desc    Update group details
// @access  Private (Faculty)
router.put('/groups/:id', [
    body('assignmentTitle').optional().trim().notEmpty().withMessage('Assignment title cannot be empty'),
    body('students').optional().isArray({ min: 2, max: 2 }).withMessage('Exactly 2 students must be selected')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { assignmentTitle, students } = req.body;

        const group = await Group.findOne({
            _id: req.params.id,
            faculty: req.user._id
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // If updating students, validate them
        if (students) {
            const validStudents = await Student.find({
                _id: { $in: students },
                assignedFaculty: req.user._id
            });

            if (validStudents.length !== 2) {
                return res.status(400).json({
                    message: 'Invalid students'
                });
            }

            // Remove old students from group
            await Student.updateMany(
                { groupId: req.params.id },
                { $unset: { groupId: 1 } }
            );

            // Add new students to group
            await Student.updateMany(
                { _id: { $in: students } },
                { groupId: req.params.id }
            );

            group.students = students;
        }

        if (assignmentTitle) {
            group.assignmentTitle = assignmentTitle;
        }

        await group.save();

        const populatedGroup = await Group.findById(group._id)
            .populate('students', 'name regNo assignmentTitle')
            .populate('faculty', 'name email');

        res.json(populatedGroup);
    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/faculty/groups/:id
// @desc    Delete group
// @access  Private (Faculty)
router.delete('/groups/:id', async (req, res) => {
    try {
        const group = await Group.findOne({
            _id: req.params.id,
            faculty: req.user._id
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Remove group ID from students
        await Student.updateMany(
            { groupId: req.params.id },
            { $unset: { groupId: 1 } }
        );

        await Group.findByIdAndDelete(req.params.id);

        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/faculty/dashboard
// @desc    Get faculty dashboard data
// @access  Private (Faculty)
router.get('/dashboard', async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments({ assignedFaculty: req.user._id });
        const totalGroups = await Group.countDocuments({ faculty: req.user._id });
        const recentStudents = await Student.find({ assignedFaculty: req.user._id })
            .sort({ createdAt: -1 })
            .limit(5);
        const recentGroups = await Group.find({ faculty: req.user._id })
            .populate('students', 'name regNo')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalStudents,
            totalGroups,
            recentStudents,
            recentGroups
        });
    } catch (error) {
        console.error('Get faculty dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;