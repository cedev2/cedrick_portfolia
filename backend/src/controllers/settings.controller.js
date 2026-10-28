import { AiSetting, Setting, SiteInformation } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import env from '../config/env.js';

// Values stored in the `site_information` collection.
const SITE_INFO_FIELDS = [
  'owner_name',
  'owner_email',
  'owner_phone',
  'owner_location',
  'owner_languages',
  'owner_experience_years',
  'owner_bio',
  'owner_story',
  'owner_hobbies',
  'owner_goals',
  'owner_fun_facts',
  'typing_texts',
  'hero_greeting',
];

// Values stored in the `settings` collection.
const SETTING_FIELDS = [
  'site_name',
  'site_title',
  'site_description',
  'hero_title',
  'hero_description',
  'hero_image',
  'about_image',
  'footer_email',
  'footer_phone',
  'footer_address',
  'footer_copyright',
];

const PRICING_FIELDS = [
  'pricing_info',
  'pricing_min',
  'pricing_payment',
  'pricing_note',
  'availability_status',
];

// Every field the admin form may write, and where it has to be persisted.
// `settings` and `site_information` are merged by the public profile
// endpoint with `site_information` taking precedence, so each field is
// written to the single collection that actually drives the website.
const FIELD_TARGETS = {
  ...Object.fromEntries(SITE_INFO_FIELDS.map((field) => [field, ['site_information']])),
  ...Object.fromEntries(SETTING_FIELDS.map((field) => [field, ['settings']])),
  ...Object.fromEntries(PRICING_FIELDS.map((field) => [field, ['settings']])),
  // Seeded in both collections, so it is kept in sync in both.
  hero_greeting: ['site_information', 'settings'],
};

/**
 * GET /api/admin/site-info
 *
 * Mirrors the merge order of the public profile endpoint so the admin form
 * always shows the values that are actually rendered on the website.
 */
export const getSiteInfo = asyncHandler(async (_req, res) => {
  const [info, settings] = await Promise.all([
    SiteInformation.getAllMap(),
    Setting.getAllMap(),
  ]);

  const merged = { ...settings, ...info };

  const data = {};
  Object.keys(FIELD_TARGETS).forEach((field) => {
    data[field] = merged[field] ?? '';
  });

  return res.json({
    success: true,
    message: 'Success',
    data,
  });
});

/**
 * PUT /api/admin/site-info
 *
 * Each field is persisted to the collection that drives the website, so a
 * save can never shadow a value with a stale duplicate.
 */
export const updateSiteInfo = asyncHandler(async (req, res) => {
  const body = req.body ?? {};

  const writes = Object.entries(FIELD_TARGETS)
    .filter(([field]) => field in body)
    .flatMap(([field, targets]) => {
      const value = body[field] ?? '';
      return targets.map((target) =>
        target === 'site_information'
          ? SiteInformation.setValue(field, value)
          : Setting.setValue(field, value),
      );
    });

  await Promise.all(writes);

  const [info, settings] = await Promise.all([
    SiteInformation.getAllMap(),
    Setting.getAllMap(),
  ]);

  const merged = { ...settings, ...info };

  const data = {};
  Object.keys(FIELD_TARGETS).forEach((field) => {
    data[field] = merged[field] ?? '';
  });

  return res.json({
    success: true,
    message: 'Site information updated successfully!',
    data,
  });
});

/**
 * GET /api/admin/ai-settings
 */
export const getAiSettings = asyncHandler(async (_req, res) => {
  const aiSettings = await AiSetting.getAllMap();
  const settings = await Setting.getAllMap();

  const merged = { ...settings, ...aiSettings };

  // The API key is never returned - only whether one is configured.
  const hasEnvKey = Boolean(env.ejolabsApiKey);
  const hasStoredKey = Boolean(aiSettings.ejolabs_api_key);

  delete merged.ejolabs_api_key;

  return res.json({
    success: true,
    message: 'Success',
    data: {
      ...merged,
      ejolabs_api_key_configured: hasEnvKey || hasStoredKey,
      ejolabs_api_key_source: hasEnvKey ? 'environment' : hasStoredKey ? 'database' : 'none',
    },
  });
});

/**
 * PUT /api/admin/ai-settings
 */
export const updateAiSettings = asyncHandler(async (req, res) => {
  const body = req.body ?? {};

  const aiEnabled = body.ai_enabled ? '1' : '0';

  const entries = {
    ai_enabled: aiEnabled,
    ai_name: body.ai_name ?? 'Cedrick AI',
    ai_greeting: body.ai_greeting ?? '',
    system_prompt: body.system_prompt ?? '',
    temperature: String(body.temperature ?? '0.7'),
    max_tokens: String(body.max_tokens ?? '2048'),
    conversation_length: String(body.conversation_length ?? '10'),
    fallback_provider: body.fallback_provider ?? 'builtin',
  };

  await Promise.all(
    Object.entries(entries).map(([key, value]) => AiSetting.setValue(key, value)),
  );

  // Optional third-party keys.
  if (body.groq_api_key) await AiSetting.setValue('groq_api_key', String(body.groq_api_key));
  if (body.gemini_api_key) await AiSetting.setValue('gemini_api_key', String(body.gemini_api_key));

  // An API key supplied through the form is only accepted when one is not
  // already provided through the environment.
  if (body.ejolabs_api_key && !env.ejolabsApiKey) {
    await AiSetting.setValue('ejolabs_api_key', String(body.ejolabs_api_key).trim());
  }

  return res.json({
    success: true,
    message: 'AI settings updated successfully!',
    data: await AiSetting.getAllMap(),
  });
});
