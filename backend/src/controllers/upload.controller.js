import { uploadImage, uploadDocument, uploadAny } from '../middleware/upload.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { removeUploadedFile } from '../middleware/upload.js';

/**
 * POST /api/admin/upload/image
 * Field: image
 */
export const uploadImageFile = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image file was uploaded.');

  const subdir = String(req.body?.folder ?? 'projects').replace(/[^a-z0-9_-]/gi, '') || 'projects';

  return res.status(201).json({
    success: true,
    message: 'Image uploaded successfully!',
    data: {
      filename: req.file.filename,
      original_name: req.file.originalname,
      path: `/uploads/${subdir}/${req.file.filename}`,
      size: req.file.size,
      mime_type: req.file.mimetype,
    },
  });
});

/**
 * POST /api/admin/upload/document
 * Field: file
 */
export const uploadDocumentFile = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No document was uploaded.');

  return res.status(201).json({
    success: true,
    message: 'Document uploaded successfully!',
    data: {
      filename: req.file.filename,
      original_name: req.file.originalname,
      path: `/uploads/documents/${req.file.filename}`,
      size: req.file.size,
      mime_type: req.file.mimetype,
    },
  });
});

export { uploadImage, uploadDocument, uploadAny, removeUploadedFile };
