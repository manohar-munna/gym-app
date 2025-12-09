const Activity = require('../models/ActivityModel');

// @desc    Get User Activity Logs
// @route   GET /api/activity
const getActivities = async (req, res) => {
    try {
        const logs = await Activity.find({ user: req.user._id });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update/Create Daily Log
// @route   POST /api/activity
// @desc    Update/Create Daily Log
// @route   POST /api/activity
const updateActivity = async (req, res) => {
    const { date, tasks, note, bodyWeight } = req.body; // <--- ADD bodyWeight HERE

    try {
        let log = await Activity.findOne({ user: req.user._id, date });
        
        const updateData = {
            tasks: tasks || [],
            note: note !== undefined ? note : '',
            // Ensure bodyWeight is recorded even if 0. Use null if not provided.
            bodyWeight: (bodyWeight === undefined || bodyWeight === '') ? null : bodyWeight
        };

        if (log) {
            // Update existing
            if (tasks) log.tasks = tasks;
            if (note !== undefined) log.note = note;
            // Allow saving 0 or null, check against undefined
            if (bodyWeight !== undefined) log.bodyWeight = bodyWeight; 
            
            await log.save();
        } else {
            // Create new
            log = await Activity.create({
                user: req.user._id,
                date,
                ...updateData
            });
        }
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getActivities, updateActivity };