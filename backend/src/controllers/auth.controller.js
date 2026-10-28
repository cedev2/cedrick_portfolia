import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { signToken } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, deleted_at: null }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid username or password');

  const valid = await user.verifyPassword(password);
  if (!valid) throw ApiError.unauthorized('Invalid username or password');

  user.last_login = new Date();
  await user.save();

  const token = signToken({ user_id: user._id.toString(), username: user.username, role: user.role });

  return res.json({
    success: true,
    message: 'Login successful',
    data: { token, user: user.toPublicJSON() },
  });
});

/**
 * GET /api/auth/me
 */
export const me = asyncHandler(async (req, res) =>
  res.json({ success: true, message: 'Success', data: req.user.toPublicJSON() }),
);

/**
 * POST /api/auth/logout
 * Stateless JWT: the client discards the token, the endpoint exists so the
 * SPA has a single logout flow to call.
 */
export const logout = asyncHandler(async (_req, res) =>
  res.json({ success: true, message: 'Logged out successfully', data: null }),
);

export const verifyTokenForUser = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};
