const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    // Only admins can view all users
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true, 
        lastName: true,
        isAdmin: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: req.user?.isAdmin || req.user?.id === id, // Only show email to self or admin
        firstName: true,
        lastName: true,
        bio: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, bio, email, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only allow self or admin to update profile
    if (id !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own profile' });
    }
    
    // Build update data
    const updateData = {};
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    
    // Only allow email change if it's the user's own profile or admin
    if (email !== undefined && (id === req.user.id || req.user.isAdmin)) {
      // Check if email is already taken
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id }
        }
      });
      
      if (emailExists) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      
      updateData.email = email;
    }
    
    // Handle password update
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: req.user?.isAdmin || req.user?.id === id,
        firstName: true,
        lastName: true,
        bio: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (self or admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only allow self or admin to delete profile
    if (id !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own profile' });
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};