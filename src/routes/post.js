const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate, isAuthorOrAdmin } = require('../middleware/auth');
const { commentValidation } = require('../middleware/validation');

/**
 * @route   GET /api/comments/:id
 * @desc    Get a single comment
 * @access  Public (with restrictions on unpublished posts)
 */
router.get('/:id', commentController.getCommentById);

/**
 * @route   GET /api/comments/post/:postId
 * @desc    Get all comments for a post
 * @access  Public (with restrictions on unpublished posts)
 */
router.get('/post/:postId', commentController.getCommentsByPost);

/**
 * @route   POST /api/comments/post/:postId
 * @desc    Create a new comment on a post
 * @access  Private
 */
router.post('/post/:postId', authenticate, commentValidation, commentController.createComment);

/**
 * @route   PUT /api/comments/:id
 * @desc    Update a comment
 * @access  Private (author or admin only)
 */
router.put('/:id', authenticate, isAuthorOrAdmin, commentValidation, commentController.updateComment);

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment
 * @access  Private (author or admin only)
 */
router.delete('/:id', authenticate, isAuthorOrAdmin, commentController.deleteComment);

module.exports = router;