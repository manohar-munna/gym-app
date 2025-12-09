const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // Format: "YYYY-MM-DD"
    tasks: [
        { 
            name: { type: String },
            completed: { type: Boolean, default: false }
        }
    ],
    note: { type: String, default: '' }
}, { timestamps: true });

// Ensure one log per user per day
activitySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Activity', activitySchema);