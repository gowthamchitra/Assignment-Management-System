const express = require('express');
const { auth } = require('../middleware/auth');
const Group = require('../models/Group');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/groups
// @desc    Get all groups (for admin) or faculty groups (for faculty)
// @access  Private
router.get('/', async (req, res) => {
    try {
        let query = {};

        // If user is faculty, only show their groups
        if (req.user.role === 'faculty') {
            query.faculty = req.user._id;
        }

        const groups = await Group.find(query)
            .populate('students', 'name regNo assignmentTitle')
            .populate('faculty', 'name email')
            .sort({ createdAt: -1 });

        res.json(groups);
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/groups/:id
// @desc    Get single group
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        let query = { _id: req.params.id };

        // If user is faculty, only allow access to their groups
        if (req.user.role === 'faculty') {
            query.faculty = req.user._id;
        }

        const group = await Group.findOne(query)
            .populate('students', 'name regNo assignmentTitle')
            .populate('faculty', 'name email');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group);
    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
