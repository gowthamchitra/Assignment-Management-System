const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    assignmentTitle: {
        type: String,
        required: true,
        trim: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    }],
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    googleFormLink: {
        type: String,
        default: 'https://docs.google.com/forms/d/e/1FAIpQLScbBUjXVj2N5X4R102bULi01cOy9fslasJTHbQgAkTomxAK9w/viewform?usp=header'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// The custom validator is removed, as validation is handled at the route level.
// You no longer need the `arrayLimit` function.

module.exports = mongoose.model('Group', groupSchema);