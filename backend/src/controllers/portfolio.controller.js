import {
  Achievement,
  Blog,
  BlogCategory,
  Certificate,
  Education,
  Experience,
  Project,
  Resume,
  Service,
  Setting,
  SiteInformation,
  Skill,
  SocialLink,
  Testimonial,
} from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';

const asMap = (rows) =>
  rows.reduce((acc, row) => {
    acc[row.setting_key ?? row.key_name] = row.setting_value ?? row.value;
    return acc;
  }, {});

/**
 * GET /api/portfolio/profile
 * Merges settings + owner information into the single payload the SPA boots with.
 */
export const getProfile = asyncHandler(async (_req, res) => {
  const [settings, info] = await Promise.all([
    Setting.find({}).lean(),
    SiteInformation.find({}).lean(),
  ]);

  const profile = { ...asMap(settings), ...asMap(info) };

  const activeResume = await Resume.findOne({ is_active: 1 }).lean();

  if (activeResume) {
    profile.resume = activeResume;
    profile.cv = activeResume;
    profile.resume_url = activeResume.file_path;
  } else if (profile.cv_url) {
    profile.resume = { file_path: profile.cv_url, title: 'Curriculum Vitae (CV)' };
    profile.cv = profile.resume;
    profile.resume_url = profile.cv_url;
  }

  return res.json({ success: true, message: 'Success', data: profile });
});

/**
 * GET /api/portfolio/settings
 */
export const getSettings = asyncHandler(async (_req, res) => {
  const [settings, info] = await Promise.all([
    Setting.getAllMap(),
    SiteInformation.getAllMap(),
  ]);

  return res.json({
    success: true,
    message: 'Success',
    data: { ...settings, ...info },
  });
});

/**
 * Builds a simple "list every active document" handler.
 */
const listHandler = (Model, sort, limit) =>
  asyncHandler(async (req, res) => {
    const query = Model.find({ deleted_at: null }).sort(sort);

    const requestedLimit = Number.parseInt(req.query.limit ?? '', 10);
    if (Number.isFinite(requestedLimit)) {
      query.limit(Math.min(Math.max(requestedLimit, 1), 500));
    } else if (limit) {
      query.limit(limit);
    }

    const rows = await query.lean();
    return res.json({ success: true, message: 'Success', data: rows });
  });

export const getSkills = listHandler(Skill, { sort_order: 1, name: 1 });
export const getServices = listHandler(Service, { sort_order: 1, title: 1 });
export const getExperience = listHandler(Experience, { start_date: -1 });
export const getEducation = listHandler(Education, { start_date: -1 });
export const getTestimonials = listHandler(Testimonial, { sort_order: 1, _id: 1 });
export const getAchievements = listHandler(Achievement, { sort_order: 1, _id: 1 });
export const getCertificates = listHandler(Certificate, { issue_date: -1 });

export const getSocialLinks = asyncHandler(async (_req, res) => {
  const rows = await SocialLink.find({ is_active: 1 }).sort({ sort_order: 1 }).lean();
  return res.json({ success: true, message: 'Success', data: rows });
});

export const getProjects = asyncHandler(async (req, res) => {
  const requestedLimit = Number.parseInt(req.query.limit ?? '6', 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 6;

  const filter = { deleted_at: null };
  if (req.query.featured === '1') filter.is_featured = 1;

  const rows = await Project.find(filter).sort({ created_at: -1 }).limit(limit).lean();
  return res.json({ success: true, message: 'Success', data: rows });
});

export const getBlogs = asyncHandler(async (req, res) => {
  const requestedLimit = Number.parseInt(req.query.limit ?? '100', 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 100;

  const filter = { status: 'published', deleted_at: null };
  if (req.query.category) filter.category_id = req.query.category;

  const rows = await Blog.find(filter).sort({ published_date: -1 }).limit(limit).lean();
  return res.json({ success: true, message: 'Success', data: rows });
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const post = await Blog.findOne({
    slug: req.params.slug,
    status: 'published',
    deleted_at: null,
  }).lean();

  if (!post) {
    return res.status(404).json({ success: false, message: 'Blog post not found' });
  }
  return res.json({ success: true, message: 'Success', data: post });
});

export const getBlogCategories = asyncHandler(async (_req, res) => {
  const rows = await BlogCategory.find({}).sort({ name: 1 }).lean();
  return res.json({ success: true, message: 'Success', data: rows });
});
