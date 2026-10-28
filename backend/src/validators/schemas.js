import { z } from 'zod';

const trimmed = (max) => z.string().trim().max(max);
const optionalText = (max) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (value === undefined || value === null) return null;
      const out = String(value).trim();
      return out === '' ? null : out;
    })
    .refine((value) => value === null || value.length <= max, {
      message: `Must be ${max} characters or less`,
    });

const flag = z
  .union([z.boolean(), z.number(), z.string()])
  .transform((value) => {
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'number') return value ? 1 : 0;
    const str = String(value).trim().toLowerCase();
    return ['1', 'true', 'yes', 'on'].includes(str) ? 1 : 0;
  });

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const contactSchema = z.object({
  name: trimmed(100).min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email address'),
  phone: optionalText(50),
  subject: trimmed(200).min(1, 'Subject is required'),
  message: trimmed(5000).min(1, 'Message is required'),
});

export const chatSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(2000),
  session_id: z.string().trim().max(100).optional(),
  language: z.enum(['auto', 'en', 'rw']).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      }),
    )
    .max(20)
    .optional(),
});

export const projectSchema = z.object({
  title: trimmed(200).min(1, 'Title is required'),
  category: trimmed(50).min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  thumbnail: optionalText(255),
  technologies: optionalText(255),
  images: z.array(z.record(z.string())).optional(),
  github_url: optionalText(500),
  live_url: optionalText(500),
  pdf_file: optionalText(255),
  status: z.enum(['completed', 'in-progress', 'planned']).optional(),
  is_featured: flag.optional(),
  is_primary: flag.optional(),
  sort_order: z.coerce.number().int().optional(),
  start_date: z.union([z.string(), z.date(), z.null()]).optional(),
  end_date: z.union([z.string(), z.date(), z.null()]).optional(),
});

export const skillSchema = z.object({
  name: trimmed(100).min(1, 'Name is required'),
  category: trimmed(50).min(1, 'Category is required'),
  percentage: z.coerce.number().min(0).max(100).optional(),
  icon: optionalText(50),
  icon_color: optionalText(20),
  sort_order: z.coerce.number().int().optional(),
});

export const serviceSchema = z.object({
  title: trimmed(200).min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: optionalText(50),
  pricing: optionalText(100),
  pricing_note: optionalText(500),
  sort_order: z.coerce.number().int().optional(),
});

export const experienceSchema = z.object({
  title: trimmed(200).min(1, 'Title is required'),
  company: trimmed(200).min(1, 'Company is required'),
  location: optionalText(200),
  image: optionalText(255),
  start_date: z.union([z.string(), z.date()]).optional(),
  end_date: z.union([z.string(), z.date(), z.null()]).optional(),
  is_current: flag.optional(),
  description: z.string().min(1, 'Description is required'),
  sort_order: z.coerce.number().int().optional(),
});

export const educationSchema = z.object({
  title: trimmed(200).min(1, 'Title is required'),
  institution: trimmed(200).min(1, 'Institution is required'),
  location: optionalText(200),
  image: optionalText(255),
  start_date: z.union([z.string(), z.date()]).optional(),
  end_date: z.union([z.string(), z.date(), z.null()]).optional(),
  is_current: flag.optional(),
  description: optionalText(1000),
  sort_order: z.coerce.number().int().optional(),
});

export const certificateSchema = z.object({
  title: trimmed(200).min(1, 'Title is required'),
  organization: trimmed(200).min(1, 'Organization is required'),
  issue_date: z.union([z.string(), z.date()]).optional(),
  expiry_date: z.union([z.string(), z.date(), z.null()]).optional(),
  description: optionalText(1000),
  certificate_number: optionalText(100),
  category: optionalText(50),
  preview_image: optionalText(255),
  certificate_url: optionalText(500),
  credential_url: optionalText(500),
  sort_order: z.coerce.number().int().optional(),
  files: z.array(z.record(z.string())).optional(),
});

export const blogSchema = z.object({
  title: trimmed(200).min(1, 'Title is required'),
  slug: trimmed(200).min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  category_id: z.union([z.string(), z.null()]).optional(),
  image: optionalText(255),
  author: optionalText(100),
  reading_time: z.coerce.number().int().optional(),
  meta_title: optionalText(200),
  meta_description: optionalText(500),
  published_date: z.union([z.string(), z.date(), z.null()]).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  sort_order: z.coerce.number().int().optional(),
});

export const blogCategorySchema = z.object({
  name: trimmed(100).min(1, 'Name is required'),
  slug: trimmed(100).min(1, 'Slug is required'),
  description: optionalText(500),
});

export const testimonialSchema = z.object({
  name: trimmed(100).min(1, 'Name is required'),
  company: optionalText(200),
  position: optionalText(200),
  content: z.string().min(1, 'Content is required'),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  avatar: optionalText(255),
  sort_order: z.coerce.number().int().optional(),
});

export const achievementSchema = z.object({
  title: trimmed(200).min(1, 'Title is required'),
  count: z.coerce.number().int().min(0).optional(),
  icon: optionalText(50),
  sort_order: z.coerce.number().int().optional(),
});

export const socialLinkSchema = z.object({
  platform: trimmed(50).min(1, 'Platform is required'),
  url: trimmed(500).min(1, 'URL is required'),
  icon: optionalText(50),
  sort_order: z.coerce.number().int().optional(),
  is_active: flag.optional(),
});

export const siteInfoSchema = z.object({
  site_name: z.string().optional(),
  site_title: z.string().optional(),
  site_description: z.string().optional(),
  hero_greeting: z.string().optional(),
  hero_title: z.string().optional(),
  hero_description: z.string().optional(),
  hero_image: z.string().optional(),
  about_image: z.string().optional(),
  owner_name: z.string().optional(),
  owner_email: z.string().optional(),
  owner_phone: z.string().optional(),
  owner_location: z.string().optional(),
  owner_languages: z.string().optional(),
  owner_experience_years: z.string().optional(),
  owner_bio: z.string().optional(),
  owner_story: z.string().optional(),
  owner_hobbies: z.string().optional(),
  owner_goals: z.string().optional(),
  owner_fun_facts: z.string().optional(),
  typing_texts: z.string().optional(),
  footer_email: z.string().optional(),
  footer_phone: z.string().optional(),
  footer_address: z.string().optional(),
  footer_copyright: z.string().optional(),
  pricing_info: z.string().optional(),
  pricing_min: z.string().optional(),
  pricing_payment: z.string().optional(),
  pricing_note: z.string().optional(),
  availability_status: z.string().optional(),
});

export const aiSettingsSchema = z.object({
  ai_enabled: z.union([z.boolean(), z.number(), z.string()]).optional(),
  ai_name: z.string().optional(),
  ai_greeting: z.string().optional(),
  system_prompt: z.string().optional(),
  temperature: z.union([z.string(), z.number()]).optional(),
  max_tokens: z.union([z.string(), z.number()]).optional(),
  conversation_length: z.union([z.string(), z.number()]).optional(),
  fallback_provider: z.string().optional(),
  ejolabs_api_key: z.string().optional(),
  groq_api_key: z.string().optional(),
  gemini_api_key: z.string().optional(),
});

export const resumeSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
});
