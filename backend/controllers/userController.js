import asyncWrapper from '../middleware/asyncWrapper.js';
import User from '../models/User.js';
import { sendResponse } from '../utils/apiResponse.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

// @desc    Get current user profile
// @route   GET /api/v1/users/me
// @access  Private
export const getMe = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  return sendResponse(res, 200, true, 'User profile retrieved', {
    user
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/users/me
// @access  Private
export const updateProfile = asyncWrapper(async (req, res) => {
  const { name, phone, avatar, lat, lng, address } = req.body;
  
  const updateData = {};
  
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (avatar) updateData.avatar = avatar;
  
  // Update location if provided
  if (lat !== undefined && lng !== undefined) {
    updateData.location = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)],
      address: address || ''
    };
  } else if (address) {
    updateData.location = {
      ...req.user.location,
      address
    };
  }
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );
  
  logger.info(`User profile updated: ${user.email}`);
  
  return sendResponse(res, 200, true, 'Profile updated successfully', {
    user
  });
});

// @desc    Change password
// @route   PUT /api/v1/users/change-password
// @access  Private
export const changePassword = asyncWrapper(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  
  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return sendResponse(res, 401, false, 'Current password is incorrect');
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Invalidate refresh tokens
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });
  
  logger.info(`Password changed for user: ${user.email}`);
  
  return sendResponse(res, 200, true, 'Password changed successfully');
});

// @desc    Get user by ID (admin only)
// @route   GET /api/v1/users/:id
// @access  Private/Admin
export const getUserById = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }
  
  return sendResponse(res, 200, true, 'User retrieved', {
    user
  });
});

export const getUsers = async (req, res, next) => {
    // Your logic to find users based on limit/sort/etc.
    const users = await User.find().limit(req.query.limit).sort(req.query.sort); 
    res.status(200).json({ success: true, count: users.length, data: users });
};

// @desc    Update user (admin only)
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
export const updateUser = asyncWrapper(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }
  
  logger.info(`User updated by admin: ${user.email}`);
  
  return sendResponse(res, 200, true, 'User updated successfully', {
    user
  });
});

// @desc    Delete user (admin only)
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = asyncWrapper(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  
  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }
  
  logger.warn(`User deactivated: ${user.email}`);
  
  return sendResponse(res, 200, true, 'User deactivated successfully');
});