import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const PDF_EXTENSIONS = ['pdf'];
const TRAINING_EXTENSIONS = ['csv', 'pdf', 'doc', 'docx', 'txt'];

const UPLOAD_SUBDIRS = [
  'projects',
  'certificates',
  'certificate-images',
  'profile',
  'blog',
  'blogs',
  'documents',
  'ai-training',
  'resume',
  'experience',
  'education',
  'testimonials',
];

UPLOAD_SUBDIRS.forEach((dir) => {
  const target = path.join(env.uploadRoot, dir);
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
});

const storageFor = (subdir) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const target = path.join(env.uploadRoot, subdir);
      if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
      cb(null, target);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      const prefix =
        subdir === 'resume' ? 'cv' : subdir === 'ai-training' ? 'training' : 'file';
      const unique = `${prefix}_${crypto.randomBytes(8).toString('hex')}.${ext}`;
      cb(null, unique);
    },
  });

const extensionOf = (file) =>
  path.extname(file.originalname || '').toLowerCase().replace('.', '');

const fileFilterFactory = (allowed) => (_req, file, cb) => {
  const ext = extensionOf(file);
  if (!allowed.includes(ext)) {
    return cb(
      ApiError.badRequest(
        `Invalid file type ".${ext}". Allowed: ${allowed.join(', ')}`,
      ),
    );
  }
  return cb(null, true);
};

export const uploadImage = (subdir = 'projects') =>
  multer({
    storage: storageFor(subdir),
    limits: { fileSize: env.uploadMaxSize },
    fileFilter: fileFilterFactory(IMAGE_EXTENSIONS),
  });

export const uploadDocument = (subdir = 'documents') =>
  multer({
    storage: storageFor(subdir),
    limits: { fileSize: env.uploadMaxSize },
    fileFilter: fileFilterFactory(PDF_EXTENSIONS),
  });

export const uploadTrainingDocument = (subdir = 'ai-training') =>
  multer({
    storage: storageFor(subdir),
    limits: { fileSize: env.uploadMaxSize },
    fileFilter: fileFilterFactory(TRAINING_EXTENSIONS),
  });

export const uploadResume = () =>
  multer({
    storage: storageFor('resume'),
    limits: { fileSize: env.uploadMaxSize },
    fileFilter: fileFilterFactory(PDF_EXTENSIONS),
  });

export const uploadAny = (subdir = 'documents') =>
  multer({
    storage: storageFor(subdir),
    limits: { fileSize: env.uploadMaxSize },
    fileFilter: fileFilterFactory(ALLOWED_EXTENSIONS),
  });

/**
 * Removes a previously uploaded file given its public path (`/uploads/...`).
 */
export const removeUploadedFile = (publicPath) => {
  if (!publicPath || !publicPath.startsWith('/uploads/')) return;
  const relative = publicPath.replace(/^\/uploads\//, '');
  const target = path.resolve(env.uploadRoot, relative);
  if (!target.startsWith(path.resolve(env.uploadRoot))) return;
  if (fs.existsSync(target)) fs.rmSync(target, { force: true });
};

export default uploadImage;
