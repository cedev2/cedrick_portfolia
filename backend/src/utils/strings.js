/**
 * Small string helpers shared across the API.
 */

/**
 * Converts an arbitrary title into a URL-safe slug.
 * Mirrors the legacy PHP behaviour: whitespace runs collapse to a single hyphen.
 */
export const slugify = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Normalises truthy-ish input into a 0/1 integer for MongoDB flags.
 */
export const toFlag = (value) => {
  if (value === true || value === 1 || value === '1' || value === 'true') return 1;
  if (value === false || value === 0 || value === '0' || value === 'false') return 0;
  return undefined;
};

/**
 * Converts "" / null / undefined into an actual null so optional fields stay clean.
 */
export const emptyToNull = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
};

/**
 * Parses a comma separated list into a trimmed array.
 */
export const toList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

/**
 * Truncates text for card previews.
 */
export const truncate = (value = '', length = 120) => {
  const text = String(value ?? '');
  return text.length > length ? `${text.slice(0, length)}...` : text;
};
