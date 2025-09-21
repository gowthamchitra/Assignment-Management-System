const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    regNo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    assignmentTitle: {
        type: String,
        trim: true // The 'required' property is removed
    },
    assignedFaculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null
    },
    weeklyReports: [{
        week: {
            type: Number,
            required: true
        },
        report: {
            type: String,
            required: true
        },
        submittedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);