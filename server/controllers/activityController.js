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
const updateActivity = async (req, res) => {
    const { date, tasks, note } = req.body;
    try {
        let log = await Activity.findOne({ user: req.user._id, date });

        if (log) {
            // Update existing
            log.tasks = tasks || log.tasks;
            log.note = note !== undefined ? note : log.note;
            await log.save();
        } else {
            // Create new
            log = await Activity.create({
                user: req.user._id,
                date,
                tasks,
                note
            });
        }
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getActivities, updateActivity };