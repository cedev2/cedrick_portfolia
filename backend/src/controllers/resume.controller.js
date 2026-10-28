import fs from 'node:fs';
import path from 'node:path';
import { Download, Resume } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';
import { removeUploadedFile } from '../middleware/upload.js';
import { SiteInformation } from '../models/index.js';

/**
 * GET /api/admin/resume
 */
export const listResumes = asyncHandler(async (_req, res) => {
  const rows = await Resume.find({}).sort({ created_at: -1 }).lean();
  return res.json({ success: true, message: 'Success', data: rows });
});

/**
 * POST /api/admin/resume  (multipart/form-data, field: cv_file)
 */
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Please select a PDF file to upload.');

  const title = String(req.body.title ?? '').trim() || 'Resume';
  const filePath = `/uploads/resume/${req.file.filename}`;
  const fileSize = req.file.size;

  await Resume.updateMany({}, { $set: { is_active: 0 } });

  const created = await Resume.create({
    title,
    file_path: filePath,
    file_type: 'pdf',
    file_size: fileSize,
    is_active: 1,
    doc_type: 'cv',
  });

  await SiteInformation.setValue('cv_url', filePath);

  return res
    .status(201)
    .json({ success: true, message: 'CV uploaded successfully!', data: created });
});

/**
 * PATCH /api/admin/resume/:id/activate
 */
export const activateResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) throw ApiError.notFound('CV not found');

  await Resume.updateMany({}, { $set: { is_active: 0 } });
  resume.is_active = 1;
  await resume.save();

  await SiteInformation.setValue('cv_url', resume.file_path);

  return res.json({ success: true, message: 'CV activated successfully!', data: resume });
});

/**
 * DELETE /api/admin/resume/:id
 */
export const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) throw ApiError.notFound('CV not found');

  removeUploadedFile(resume.file_path);
  await resume.deleteOne();

  return res.json({ success: true, message: 'CV deleted successfully!', data: null });
});

/**
 * GET /api/download/resume/:id
 * Serves the CV and increments the download counter.
 */
export const downloadResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) throw ApiError.notFound('CV not found');

  const absolute = path.resolve(env.uploadRoot, resume.file_path.replace(/^\/uploads\//, ''));
  if (!absolute.startsWith(path.resolve(env.uploadRoot)) || !fs.existsSync(absolute)) {
    throw ApiError.notFound('CV file is missing');
  }

  await Resume.updateOne({ _id: resume._id }, { $inc: { download_count: 1 } });
  await Download.create({
    item_type: 'resume',
    item_id: resume._id,
    downloader_ip: req.ip || null,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${resume.title.replace(/[^\w.-]+/g, '_')}.pdf"`,
  );
  return res.sendFile(absolute);
});
