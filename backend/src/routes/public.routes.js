import { Router } from 'express';
import {
  getAchievements,
  getBlogBySlug,
  getBlogCategories,
  getBlogs,
  getCertificates,
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getServices,
  getSettings,
  getSkills,
  getSocialLinks,
  getTestimonials,
} from '../controllers/portfolio.controller.js';
import { submitContact, trackVisit } from '../controllers/contact.controller.js';
import { downloadResume } from '../controllers/resume.controller.js';
import { validate } from '../middleware/error.js';
import { contactSchema } from '../validators/schemas.js';

const router = Router();

router.get('/health', (_req, res) =>
  res.json({ success: true, message: 'API is running', data: { status: 'ok' } }),
);

router.get('/portfolio/profile', getProfile);
router.get('/portfolio/settings', getSettings);
router.get('/portfolio/skills', getSkills);
router.get('/portfolio/services', getServices);
router.get('/portfolio/projects', getProjects);
router.get('/portfolio/experience', getExperience);
router.get('/portfolio/education', getEducation);
router.get('/portfolio/certificates', getCertificates);
router.get('/portfolio/testimonials', getTestimonials);
router.get('/portfolio/achievements', getAchievements);
router.get('/portfolio/social-links', getSocialLinks);
router.get('/portfolio/blogs', getBlogs);
router.get('/portfolio/blogs/:slug', getBlogBySlug);
router.get('/portfolio/blog-categories', getBlogCategories);

router.post('/contact', validate(contactSchema), submitContact);
router.post('/visitors', trackVisit);

router.get('/download/resume/:id', downloadResume);

export default router;
