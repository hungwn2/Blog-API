const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (admin)
 */
router.get('/', authenticate, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public (with limited data) / Private (full data for self/admin)
 */
router.get('/:id', userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private (self or admin)
 */
router.put('/:id', authenticate, userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (self or admin)
 */
router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router;