const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    bodyWeight: { type: Number }, // <--- NEW FIELD
    tasks: [
        { 
            name: { type: String },
            completed: { type: Boolean, default: false },
            reps: { type: String },
            weight: { type: String }
        }
    ],
    note: { type: String, default: '' }
}, { timestamps: true });

activitySchema.index({ user: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('Activity', activitySchema);