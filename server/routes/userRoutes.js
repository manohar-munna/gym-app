const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { registerUser, loginUser, getAllUsers, deleteUser, updateUserByAdmin, updateUserProfile, getUserProfile } = require('../controllers/userController');

// ... other routes
router.route('/profile')
    .get(protect, getUserProfile)   // <--- NEW: Fetch latest data
    .put(protect, updateUserProfile); // <--- Existing: Update data

// ... rest of routes
router.post('/', registerUser);
router.post('/login', loginUser);
// router.put('/profile', protect, updateUserProfile);
router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id', protect, admin, updateUserByAdmin); // <--- NEW ROUTE

module.exports = router;