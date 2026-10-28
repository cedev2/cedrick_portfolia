import { Router } from 'express';
import {
  Achievement,
  Blog,
  BlogCategory,
  Certificate,
  Education,
  Experience,
  Project,
  Service,
  Skill,
  SocialLink,
  Testimonial,
} from '../models/index.js';
import { createCrudController } from '../controllers/crud.controller.js';
import { getDashboard } from '../controllers/dashboard.controller.js';
import {
  deleteMessage,
  getMessage,
  listMessages,
  markMessageRead,
} from '../controllers/contact.controller.js';
import {
  activateResume,
  deleteResume,
  listResumes,
  uploadResume as uploadResumeController,
} from '../controllers/resume.controller.js';
import {
  getAiSettings,
  getSiteInfo,
  updateAiSettings,
  updateSiteInfo,
} from '../controllers/settings.controller.js';
import { uploadDocumentFile, uploadImageFile } from '../controllers/upload.controller.js';
import {
  deleteAiDocument,
  listAiDocuments,
  uploadAiDocument,
} from '../controllers/aiDocument.controller.js';
import {
  uploadDocument,
  uploadImage,
  uploadResume as uploadResumeMiddleware,
  uploadTrainingDocument,
} from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/error.js';
import {
  achievementSchema,
  aiSettingsSchema,
  blogCategorySchema,
  blogSchema,
  certificateSchema,
  educationSchema,
  experienceSchema,
  projectSchema,
  serviceSchema,
  siteInfoSchema,
  skillSchema,
  socialLinkSchema,
  testimonialSchema,
} from '../validators/schemas.js';

const router = Router();

/* Multer instances are created once so the disk storage is not rebuilt per request. */
const resumeUpload = uploadResumeMiddleware().single('cv_file');
const imageUpload = uploadImage('projects').single('image');
const documentUpload = uploadDocument('documents').single('file');
const trainingUpload = uploadTrainingDocument('ai-training').single('file');

/* Every admin route requires a valid session. */
router.use(requireAuth);

/* ------------------------------------------------------------------ *
 * Dashboard
 * ------------------------------------------------------------------ */
router.get('/dashboard', getDashboard);

/* ------------------------------------------------------------------ *
 * Projects
 * ------------------------------------------------------------------ */
const projects = createCrudController(Project, {
  label: 'Project',
  fields: [
    'title',
    'category',
    'description',
    'technologies',
    'thumbnail',
    'images',
    'github_url',
    'live_url',
    'pdf_file',
    'status',
    'is_featured',
    'is_primary',
    'sort_order',
    'start_date',
    'end_date',
  ],
  flags: ['is_featured', 'is_primary'],
  dates: ['start_date', 'end_date'],
  json: ['images'],
  filters: ['category', 'status', 'is_featured'],
  search: ['title', 'description', 'technologies', 'category'],
  sort: { sort_order: 1, created_at: -1 },
});

router.get('/projects', projects.list);
router.get('/projects/:id', projects.getOne);
router.post('/projects', validate(projectSchema), projects.create);
router.put('/projects/:id', validate(projectSchema), projects.update);
router.delete('/projects/:id', projects.remove);

/* ------------------------------------------------------------------ *
 * Skills
 * ------------------------------------------------------------------ */
const skills = createCrudController(Skill, {
  label: 'Skill',
  fields: ['name', 'category', 'percentage', 'icon', 'icon_color', 'sort_order'],
  filters: ['category'],
  search: ['name', 'category'],
  sort: { sort_order: 1, name: 1 },
});

router.get('/skills', skills.list);
router.get('/skills/:id', skills.getOne);
router.post('/skills', validate(skillSchema), skills.create);
router.put('/skills/:id', validate(skillSchema), skills.update);
router.delete('/skills/:id', skills.remove);

/* ------------------------------------------------------------------ *
 * Services
 * ------------------------------------------------------------------ */
const services = createCrudController(Service, {
  label: 'Service',
  fields: ['title', 'description', 'icon', 'pricing', 'pricing_note', 'sort_order'],
  search: ['title', 'description'],
  sort: { sort_order: 1, title: 1 },
});

router.get('/services', services.list);
router.get('/services/:id', services.getOne);
router.post('/services', validate(serviceSchema), services.create);
router.put('/services/:id', validate(serviceSchema), services.update);
router.delete('/services/:id', services.remove);

/* ------------------------------------------------------------------ *
 * Experience
 * ------------------------------------------------------------------ */
const experiences = createCrudController(Experience, {
  label: 'Experience',
  fields: [
    'title',
    'company',
    'location',
    'image',
    'start_date',
    'end_date',
    'is_current',
    'description',
    'sort_order',
  ],
  flags: ['is_current'],
  dates: ['start_date', 'end_date'],
  search: ['title', 'company', 'description'],
  sort: { sort_order: 1, start_date: -1 },
});

router.get('/experience', experiences.list);
router.get('/experience/:id', experiences.getOne);
router.post('/experience', validate(experienceSchema), experiences.create);
router.put('/experience/:id', validate(experienceSchema), experiences.update);
router.delete('/experience/:id', experiences.remove);

/* ------------------------------------------------------------------ *
 * Education
 * ------------------------------------------------------------------ */
const educations = createCrudController(Education, {
  label: 'Education',
  fields: [
    'title',
    'institution',
    'location',
    'image',
    'start_date',
    'end_date',
    'description',
    'sort_order',
  ],
  dates: ['start_date', 'end_date'],
  search: ['title', 'institution', 'description'],
  sort: { sort_order: 1, start_date: -1 },
});

router.get('/education', educations.list);
router.get('/education/:id', educations.getOne);
router.post('/education', validate(educationSchema), educations.create);
router.put('/education/:id', validate(educationSchema), educations.update);
router.delete('/education/:id', educations.remove);

/* ------------------------------------------------------------------ *
 * Certificates
 * ------------------------------------------------------------------ */
const certificates = createCrudController(Certificate, {
  label: 'Certificate',
  fields: [
    'title',
    'organization',
    'issue_date',
    'expiry_date',
    'description',
    'certificate_number',
    'category',
    'preview_image',
    'certificate_url',
    'credential_url',
    'sort_order',
    'files',
  ],
  dates: ['issue_date', 'expiry_date'],
  json: ['files'],
  filters: ['category'],
  search: ['title', 'organization', 'description'],
  sort: { sort_order: 1, issue_date: -1 },
});

router.get('/certificates', certificates.list);
router.get('/certificates/:id', certificates.getOne);
router.post('/certificates', validate(certificateSchema), certificates.create);
router.put('/certificates/:id', validate(certificateSchema), certificates.update);
router.delete('/certificates/:id', certificates.remove);

/* ------------------------------------------------------------------ *
 * Blog
 * ------------------------------------------------------------------ */
const blogs = createCrudController(Blog, {
  label: 'Blog post',
  fields: [
    'title',
    'slug',
    'category_id',
    'image',
    'content',
    'author',
    'reading_time',
    'meta_title',
    'meta_description',
    'published_date',
    'status',
    'sort_order',
  ],
  dates: ['published_date'],
  filters: ['status', 'category_id'],
  search: ['title', 'content', 'slug'],
  sort: { published_date: -1, created_at: -1 },
});

router.get('/blogs', blogs.list);
router.get('/blogs/:id', blogs.getOne);
router.post('/blogs', validate(blogSchema), blogs.create);
router.put('/blogs/:id', validate(blogSchema), blogs.update);
router.delete('/blogs/:id', blogs.remove);

const blogCategories = createCrudController(BlogCategory, {
  label: 'Blog category',
  fields: ['name', 'slug', 'description'],
  search: ['name', 'slug'],
  sort: { name: 1 },
});

router.get('/blog-categories', blogCategories.list);
router.get('/blog-categories/:id', blogCategories.getOne);
router.post('/blog-categories', validate(blogCategorySchema), blogCategories.create);
router.put('/blog-categories/:id', validate(blogCategorySchema), blogCategories.update);
router.delete('/blog-categories/:id', blogCategories.remove);

/* ------------------------------------------------------------------ *
 * Testimonials
 * ------------------------------------------------------------------ */
const testimonials = createCrudController(Testimonial, {
  label: 'Testimonial',
  fields: ['name', 'company', 'position', 'content', 'rating', 'avatar', 'sort_order'],
  search: ['name', 'company', 'content'],
  sort: { sort_order: 1, _id: 1 },
});

router.get('/testimonials', testimonials.list);
router.get('/testimonials/:id', testimonials.getOne);
router.post('/testimonials', validate(testimonialSchema), testimonials.create);
router.put('/testimonials/:id', validate(testimonialSchema), testimonials.update);
router.delete('/testimonials/:id', testimonials.remove);

/* ------------------------------------------------------------------ *
 * Achievements
 * ------------------------------------------------------------------ */
const achievements = createCrudController(Achievement, {
  label: 'Achievement',
  fields: ['title', 'count', 'icon', 'sort_order'],
  search: ['title'],
  sort: { sort_order: 1, _id: 1 },
});

router.get('/achievements', achievements.list);
router.get('/achievements/:id', achievements.getOne);
router.post('/achievements', validate(achievementSchema), achievements.create);
router.put('/achievements/:id', validate(achievementSchema), achievements.update);
router.delete('/achievements/:id', achievements.remove);

/* ------------------------------------------------------------------ *
 * Social links
 * ------------------------------------------------------------------ */
const socialLinks = createCrudController(SocialLink, {
  label: 'Social link',
  fields: ['platform', 'url', 'icon', 'sort_order', 'is_active'],
  flags: ['is_active'],
  filters: ['platform', 'is_active'],
  search: ['platform', 'url'],
  sort: { sort_order: 1, _id: 1 },
});

router.get('/social-links', socialLinks.list);
router.get('/social-links/:id', socialLinks.getOne);
router.post('/social-links', validate(socialLinkSchema), socialLinks.create);
router.put('/social-links/:id', validate(socialLinkSchema), socialLinks.update);
router.delete('/social-links/:id', socialLinks.remove);

/* ------------------------------------------------------------------ *
 * Messages
 * ------------------------------------------------------------------ */
router.get('/messages', listMessages);
router.get('/messages/:id', getMessage);
router.patch('/messages/:id/read', markMessageRead);
router.delete('/messages/:id', deleteMessage);

/* ------------------------------------------------------------------ *
 * Resume / CV
 * ------------------------------------------------------------------ */
router.get('/resume', listResumes);
router.post('/resume', resumeUpload, uploadResumeController);
router.patch('/resume/:id/activate', activateResume);
router.delete('/resume/:id', deleteResume);

/* ------------------------------------------------------------------ *
 * Site information + AI settings
 * ------------------------------------------------------------------ */
router.get('/site-info', getSiteInfo);
router.put('/site-info', validate(siteInfoSchema), updateSiteInfo);

router.get('/ai-settings', getAiSettings);
router.put('/ai-settings', validate(aiSettingsSchema), updateAiSettings);

/* AI training documents (CSV / PDF / DOC / DOCX / TXT). */
router.get('/ai-documents', listAiDocuments);
router.post('/ai-documents', trainingUpload, uploadAiDocument);
router.delete('/ai-documents/:id', deleteAiDocument);

/* ------------------------------------------------------------------ *
 * Uploads
 * ------------------------------------------------------------------ */
router.post('/upload/image', imageUpload, uploadImageFile);
router.post('/upload/document', documentUpload, uploadDocumentFile);

export default router;
