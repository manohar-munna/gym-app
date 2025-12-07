const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    subscription: {
        plan: { type: String, default: null },
        startDate: { type: Date },
        endDate: { type: Date },
        status: { type: String, default: 'inactive' } // active, inactive
    },
    profile: {
        weight: Number,
        height: Number,
        phone: String
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);