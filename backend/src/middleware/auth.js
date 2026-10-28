import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { User } from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const signToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiry });

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    return null;
  }
};

const extractToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return req.headers['x-access-token'] || null;
};

/**
 * Verifies the JWT and attaches the resolved user document to `req.user`.
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Authentication required');

  const payload = verifyToken(token);
  if (!payload) throw ApiError.unauthorized('Invalid or expired token');

  const user = await User.findOne({ _id: payload.user_id, deleted_at: null });
  if (!user) throw ApiError.unauthorized('Account no longer exists');

  req.user = user;
  req.auth = payload;
  return next();
});

/**
 * Attaches the user when a valid token is present, but never blocks the request.
 */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = await User.findOne({ _id: payload.user_id, deleted_at: null });
      if (user) {
        req.user = user;
        req.auth = payload;
      }
    }
  }
  return next();
});

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    return next();
  };

export default requireAuth;
