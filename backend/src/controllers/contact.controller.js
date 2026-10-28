import { Message } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { Visitor } from '../models/index.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * POST /api/contact
 * Public contact form endpoint.
 */
export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    throw ApiError.badRequest('All fields are required');
  }

  if (!EMAIL_PATTERN.test(String(email))) {
    throw ApiError.badRequest('Invalid email address');
  }

  const created = await Message.create({
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    phone: phone ? String(phone).trim() : null,
    subject: String(subject).trim(),
    message: String(message).trim(),
  });

  return res.status(201).json({
    success: true,
    message: 'Message sent successfully!',
    data: { id: created._id },
  });
});

/**
 * GET /api/admin/messages
 */
export const listMessages = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status === 'read') filter.is_read = 1;
  if (req.query.status === 'unread') filter.is_read = 0;

  const [rows, unreadCount, total] = await Promise.all([
    Message.find(filter).sort({ created_at: -1 }).lean(),
    Message.countDocuments({ is_read: 0 }),
    Message.countDocuments({}),
  ]);

  return res.json({
    success: true,
    message: 'Success',
    data: rows,
    meta: { unreadCount, total },
  });
});

/**
 * GET /api/admin/messages/:id
 * Viewing a message automatically flags it as read (legacy behaviour).
 */
export const getMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id).lean();
  if (!message) throw ApiError.notFound('Message not found');

  if (!message.is_read) {
    await Message.updateOne({ _id: req.params.id }, { $set: { is_read: 1 } });
    message.is_read = 1;
  }

  return res.json({ success: true, message: 'Success', data: message });
});

/**
 * PATCH /api/admin/messages/:id/read
 */
export const markMessageRead = asyncHandler(async (req, res) => {
  const updated = await Message.findByIdAndUpdate(
    req.params.id,
    { $set: { is_read: 1 } },
    { new: true },
  );
  if (!updated) throw ApiError.notFound('Message not found');
  return res.json({ success: true, message: 'Message marked as read.', data: updated });
});

/**
 * DELETE /api/admin/messages/:id
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  const deleted = await Message.findByIdAndDelete(req.params.id);
  if (!deleted) throw ApiError.notFound('Message not found');
  return res.json({ success: true, message: 'Message deleted successfully!', data: deleted });
});

/**
 * POST /api/visitors
 * Lightweight traffic beacon used by the admin dashboard.
 */
export const trackVisit = asyncHandler(async (req, res) => {
  try {
    await Visitor.create({
      ip_address: req.ip || null,
      user_agent: req.get('user-agent') || null,
      page_url: req.body?.page_url ?? null,
      referrer_url: req.get('referer') ?? null,
    });
  } catch {
    /* analytics must never break the page */
  }
  return res.status(202).json({ success: true, message: 'Recorded', data: null });
});
