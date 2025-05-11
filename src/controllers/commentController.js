const prisma = require('../config/database');

/**
 * Get all comments for a post
 */
const getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    
    // Check if post exists and is published (or user is admin/author)
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // If post is not published and user is not admin or author, return 404
    if (!post.published && !req.user?.isAdmin && post.authorId !== req.user?.id) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Get comments with pagination
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (parsedPage - 1) * parsedLimit,
      take: parsedLimit
    });
    
    // Get total count for pagination
    const totalComments = await prisma.comment.count({
      where: { postId }
    });
    
    res.json({
      data: comments,
      meta: {
        total: totalComments,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalComments / parsedLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new comment
 */
const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    
    // Check if post exists and is published
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // If post is not published and user is not admin or author, return 404
    if (!post.published && !req.user?.isAdmin && post.authorId !== req.user?.id) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Create comment
    const newComment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: req.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a comment
 */
const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id }
    });
    
    if (!existingComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is author or admin
    if (existingComment.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own comments' });
    }
    
    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    res.json(updatedComment);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a comment
 */
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id }
    });
    
    if (!existingComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is author or admin
    if (existingComment.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own comments' });
    }
    
    // Delete comment
    await prisma.comment.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single comment
 */
const getCommentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            published: true,
            authorId: true
          }
        }
      }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // If the post is not published and user is not admin or post author, return 404
    if (!comment.post.published && !req.user?.isAdmin && comment.post.authorId !== req.user?.id) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  getCommentById
};