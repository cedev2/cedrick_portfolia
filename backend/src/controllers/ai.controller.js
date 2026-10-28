import crypto from 'node:crypto';
import { AiConversation, AiMessage } from '../models/index.js';
import { runChatTurn, resolveAiSettings } from '../services/ai.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const MAX_MESSAGE_LENGTH = 2000;

/**
 * POST /api/ai/chat
 */
export const chat = asyncHandler(async (req, res) => {
  const { message, session_id: sessionIdFromBody, history = [], language = 'auto' } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw ApiError.badRequest('Message is required');
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw ApiError.badRequest(`Message must be ${MAX_MESSAGE_LENGTH} characters or less`);
  }

  const sessionId =
    typeof sessionIdFromBody === 'string' && sessionIdFromBody.trim() !== ''
      ? sessionIdFromBody.trim()
      : crypto.randomUUID();

  const safeHistory = Array.isArray(history)
    ? history
        .filter((entry) => entry && (entry.role === 'user' || entry.role === 'assistant'))
        .slice(-10)
        .map((entry) => ({ role: entry.role, content: String(entry.content ?? '').slice(0, MAX_MESSAGE_LENGTH) }))
    : [];

  const preferredLanguage = ['auto', 'en', 'rw'].includes(String(language).toLowerCase())
    ? String(language).toLowerCase()
    : 'auto';

  const result = await runChatTurn({
    message: message.trim(),
    history: safeHistory,
    sessionId,
    ipAddress: req.ip || 'unknown',
    preferredLanguage,
  });

  return res.json({
    success: true,
    message: 'Success',
    data: {
      response: result.response,
      provider: result.provider,
      session_id: result.session_id,
      language: result.language,
      latency_ms: result.latency_ms,
    },
  });
});

/**
 * GET /api/ai/settings
 * Public settings for the chat widget (no secrets).
 */
export const getPublicAiSettings = asyncHandler(async (_req, res) => {
  const settings = await resolveAiSettings();

  return res.json({
    success: true,
    message: 'Success',
    data: {
      enabled: settings.ai_enabled === '1',
      name: settings.ai_name || 'Cedrick AI',
      greeting: settings.ai_greeting || '',
      owner_name: settings.owner_name || 'NIBISHAKA CEDRICK',
    },
  });
});

/**
 * GET /api/ai/history?session_id=...
 */
export const getHistory = asyncHandler(async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) throw ApiError.badRequest('session_id is required');

  const conversation = await AiConversation.findOne({ session_id: sessionId }).lean();
  if (!conversation) {
    return res.json({ success: true, message: 'Success', data: [] });
  }

  const rows = await AiMessage.find({ conversation_id: conversation._id })
    .sort({ created_at: 1 })
    .select('role content provider created_at')
    .lean();

  return res.json({ success: true, message: 'Success', data: rows });
});

/**
 * DELETE /api/ai/history
 * Clears the conversation for the given session.
 */
export const clearHistory = asyncHandler(async (req, res) => {
  const sessionId = req.body?.session_id ?? req.query.session_id;
  if (!sessionId) throw ApiError.badRequest('session_id is required');

  const conversation = await AiConversation.findOne({ session_id: sessionId });
  if (conversation) {
    await AiMessage.deleteMany({ conversation_id: conversation._id });
    await AiConversation.deleteOne({ _id: conversation._id });
  }

  return res.json({ success: true, message: 'Conversation history cleared.', data: null });
});
