const express = require('express');
const router = express.Router();
const { getActivities, updateActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getActivities);
router.post('/', protect, updateActivity);

module.exports = router;