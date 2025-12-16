import asyncWrapper from '../middleware/asyncWrapper.js';
import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies
} from '../utils/generateTokens.js';
import { sendResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncWrapper(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  
  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return sendResponse(res, 400, false, 'User already exists');
  }
  
  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    phone
  });
  
  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  
  // Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  
  // Set tokens in cookies
  setTokenCookies(res, accessToken, refreshToken);
  
  // Log registration
  logger.info(`User registered: ${user.email} (${user.role})`);
  
  return sendResponse(res, 201, true, 'Registration successful', {
    user: user.toJSON(),
    accessToken,
    refreshToken
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  
  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return sendResponse(res, 401, false, 'Invalid credentials');
  }
  
  // Check if account is active
  if (!user.isActive) {
    return sendResponse(res, 401, false, 'Account is deactivated');
  }
  
  // Check password
  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    return sendResponse(res, 401, false, 'Invalid credentials');
  }
  
  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  
  // Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  
  // Set tokens in cookies
  setTokenCookies(res, accessToken, refreshToken);
  
  // Log login
  logger.info(`User logged in: ${user.email}`);
  
  return sendResponse(res, 200, true, 'Login successful', {
    user: user.toJSON(),
    accessToken,
    refreshToken
  });
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshToken = asyncWrapper(async (req, res) => {
  const { refreshToken: token } = req.body;
  
  if (!token) {
    return sendResponse(res, 401, false, 'Refresh token is required');
  }
  
  // Verify refresh token
  const decoded = verifyRefreshToken(token);
  if (!decoded) {
    return sendResponse(res, 401, false, 'Invalid refresh token');
  }
  
  // Find user with refresh token
  const user = await User.findOne({ 
    _id: decoded.id,
    refreshToken: token
  });
  
  if (!user) {
    return sendResponse(res, 401, false, 'Invalid refresh token');
  }
  
  // Generate new tokens
  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);
  
  // Update refresh token in database
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });
  
  // Set new tokens in cookies
  setTokenCookies(res, newAccessToken, newRefreshToken);
  
  return sendResponse(res, 200, true, 'Token refreshed', {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  });
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = asyncWrapper(async (req, res) => {
  // Clear refresh token from database
  await User.findByIdAndUpdate(req.user._id, {
    refreshToken: null
  });
  
  // Clear cookies
  clearTokenCookies(res);
  
  // Log logout
  logger.info(`User logged out: ${req.user.email}`);
  
  return sendResponse(res, 200, true, 'Logout successful');
});