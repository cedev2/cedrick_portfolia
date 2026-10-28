#!/usr/bin/env node
/**
 * Seeds MongoDB from `scripts/seed-data.json`.
 *
 * The portfolio is MongoDB only: the content lives in a plain JSON snapshot
 * that is upserted into the Mongoose collections. The admin account is created
 * from the environment so the credentials always match `.env`.
 *
 * Usage:
 *   npm run seed          # upsert, keeps existing documents
 *   npm run seed:fresh    # wipe the collections first
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import env from '../src/config/env.js';
import connectDB, { disconnectDatabase } from '../src/config/db.js';
import {
  Achievement,
  AiConversation,
  AiMessage,
  AiSetting,
  Blog,
  BlogCategory,
  Certificate,
  Download,
  Education,
  Experience,
  Message,
  Project,
  Resume,
  Service,
  Setting,
  SiteInformation,
  Skill,
  SocialLink,
  Testimonial,
  User,
  Visitor,
} from '../src/models/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.resolve(__dirname, 'seed-data.json');

/* ------------------------------------------------------------------ *
 * Collection wiring: model, unique key(s) and the source dataset.
 * ------------------------------------------------------------------ */

const COLLECTIONS = [
  { name: 'settings', model: Setting, key: ['setting_key'] },
  { name: 'site_information', model: SiteInformation, key: ['key_name'] },
  { name: 'ai_settings', model: AiSetting, key: ['setting_key'] },
  { name: 'skills', model: Skill, key: ['name'] },
  { name: 'services', model: Service, key: ['title'] },
  { name: 'projects', model: Project, key: ['title'] },
  { name: 'experience', model: Experience, key: ['title', 'company'] },
  { name: 'education', model: Education, key: ['title', 'institution'] },
  { name: 'certificates', model: Certificate, key: ['title'] },
  { name: 'blog_categories', model: BlogCategory, key: ['slug'] },
  { name: 'blogs', model: Blog, key: ['slug'] },
  { name: 'testimonials', model: Testimonial, key: ['name'] },
  { name: 'achievements', model: Achievement, key: ['title'] },
  { name: 'social_links', model: SocialLink, key: ['platform', 'url'] },
  { name: 'resume', model: Resume, key: ['file_path'] },
];

const toDate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const DATE_FIELDS = new Set([
  'start_date',
  'end_date',
  'issue_date',
  'expiry_date',
  'published_date',
  'deleted_at',
]);

const toPlainObject = (document) => {
  const plain = {};
  Object.entries(document).forEach(([field, value]) => {
    if (DATE_FIELDS.has(field)) {
      plain[field] = toDate(value);
      return;
    }
    plain[field] = value;
  });
  return plain;
};

const filterFor = (row, keys) => keys.reduce((filter, key) => ({ ...filter, [key]: row[key] }), {});

const readDataset = () => {
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(`seed data file not found: ${DATA_FILE}`);
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

/* ------------------------------------------------------------------ *
 * Seed
 * ------------------------------------------------------------------ */

const run = async () => {
  const shouldDrop = process.argv.includes('--drop');
  const dataset = readDataset();

  await connectDB();

  if (shouldDrop) {
    console.log('[seed] dropping existing documents...');
    await Promise.all([
      ...COLLECTIONS.map(({ model }) => model.deleteMany({})),
      User.deleteMany({}),
      Message.deleteMany({}),
      Visitor.deleteMany({}),
      Download.deleteMany({}),
      AiConversation.deleteMany({}),
      AiMessage.deleteMany({}),
    ]);
  }

  const summary = [];

  /* --- Admin account (always recreated from the environment) ------ */
  const passwordHash = await bcrypt.hash(env.admin.password, 10);
  await User.findOneAndUpdate(
    { username: env.admin.username },
    {
      $set: {
        username: env.admin.username,
        email: env.admin.email,
        password: passwordHash,
        full_name: env.admin.fullName,
        role: 'admin',
        deleted_at: null,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  summary.push(['users', 1]);
  console.log(`[seed] admin user "${env.admin.username}" ready`);

  /* --- Content collections --------------------------------------- */
  for (const { name, model, key } of COLLECTIONS) {
    const rows = dataset[name] ?? [];
    if (rows.length === 0) continue;

    await model.bulkWrite(
      rows.map((row) => ({
        updateOne: {
          filter: filterFor(row, key),
          update: { $set: toPlainObject(row) },
          upsert: true,
        },
      })),
    );

    summary.push([name, rows.length]);
  }

  /* --- Blog categories are referenced by slug -------------------- */
  const categories = await BlogCategory.find({}).lean();
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category._id]));
  const blogRows = dataset.blogs ?? [];

  for (const row of blogRows) {
    if (!row.category) continue;
    const categoryId = categoryBySlug.get(row.category);
    if (!categoryId) continue;
    await Blog.updateOne({ slug: row.slug }, { $set: { category_id: categoryId } });
  }

  /* --- Report ---------------------------------------------------- */
  console.log('\n[seed] imported:');
  summary.forEach(([collection, count]) => console.log(`  ${collection.padEnd(20)} ${count}`));
  console.log(`\n[seed] done. Admin login: ${env.admin.username} / ${env.admin.password}\n`);

  await disconnectDatabase();
};

run()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('[seed] failed:', error);
    try {
      await disconnectDatabase();
    } catch {
      /* ignore */
    }
    process.exit(1);
  });
