const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, deleteUser, updateUserByAdmin } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id', protect, admin, updateUserByAdmin); // <--- NEW ROUTE

module.exports = router;