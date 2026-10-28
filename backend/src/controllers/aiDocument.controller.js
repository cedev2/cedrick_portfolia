import path from 'node:path';
import mongoose from 'mongoose';
import { AiDocument } from '../models/index.js';
import {
  extractDocumentText,
  normalizeExtractedText,
  SUPPORTED_EXTENSIONS,
} from '../services/document-parser.service.js';
import { removeUploadedFile } from '../middleware/upload.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const LIST_FIELDS =
  'title original_name stored_path mime_type extension size char_count status error_message created_at updatedAt';

const toPublicDocument = (document) => {
  const row = document.toObject ? document.toObject() : { ...document };
  delete row.text;
  return row;
};

/**
 * GET /api/admin/ai-documents
 */
export const listAiDocuments = asyncHandler(async (_req, res) => {
  const documents = await AiDocument.find({})
    .sort({ created_at: -1 })
    .select(LIST_FIELDS)
    .lean();

  return res.json({ success: true, message: 'Success', data: documents });
});

/**
 * POST /api/admin/ai-documents
 * Field: file (multipart/form-data)
 */
export const uploadAiDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file was uploaded.');

  const extension = path
    .extname(req.file.originalname || req.file.filename)
    .toLowerCase()
    .replace('.', '');

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    removeUploadedFile(`/uploads/ai-training/${req.file.filename}`);
    throw ApiError.badRequest(
      `Invalid file type ".${extension}". Allowed: ${SUPPORTED_EXTENSIONS.join(', ')}`,
    );
  }

  let text = '';
  let status = 'ready';
  let errorMessage = '';

  try {
    text = normalizeExtractedText(await extractDocumentText(req.file.path, extension));
  } catch (error) {
    status = 'failed';
    errorMessage = error?.message || 'Unable to read this file.';
  }

  if (status === 'ready' && !text.trim()) {
    status = 'empty';
    errorMessage = 'No readable text was found in this file.';
  }

  const fallbackTitle = path.parse(req.file.originalname || req.file.filename).name;
  const requestedTitle = String(req.body?.title ?? '').trim();
  const title = (requestedTitle || fallbackTitle || 'Training document').slice(0, 200);

  const document = await AiDocument.create({
    title,
    original_name: req.file.originalname || req.file.filename,
    stored_path: `/uploads/ai-training/${req.file.filename}`,
    mime_type: req.file.mimetype || '',
    extension,
    size: req.file.size || 0,
    char_count: text.length,
    text,
    status,
    error_message: errorMessage,
  });

  return res.status(201).json({
    success: true,
    message:
      status === 'ready'
        ? 'Training document uploaded successfully!'
        : status === 'empty'
          ? 'File uploaded, but no readable text was found.'
          : 'File uploaded, but its text could not be extracted.',
    data: toPublicDocument(document),
  });
});

/**
 * DELETE /api/admin/ai-documents/:id
 */
export const deleteAiDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest('Invalid training document id.');
  }

  const document = await AiDocument.findById(id);
  if (!document) throw ApiError.notFound('Training document not found.');

  removeUploadedFile(document.stored_path);
  await document.deleteOne();

  return res.json({
    success: true,
    message: 'Training document deleted successfully!',
    data: null,
  });
});

export default { listAiDocuments, uploadAiDocument, deleteAiDocument };
