/**
 * Formats values coming from the API for display.
 */

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Formats a date the way the legacy site did (`M d, Y`).
 */
export const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  return `${month} ${day}, ${date.getFullYear()}`;
};

/**
 * Formats a date range, collapsing an open end into "Present".
 */
export const formatDateRange = (start, end, isCurrent) => {
  const from = formatDate(start);
  const to = isCurrent ? 'Present' : formatDate(end);
  if (!from && !to) return '';
  if (!from) return to;
  if (!to) return from;
  return `${from} — ${to}`;
};

/**
 * Splits a comma separated technology list into a clean array.
 */
export const splitList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

/**
 * Truncates text on a word boundary.
 */
export const truncate = (value, length = 120) => {
  const text = String(value ?? '').trim();
  if (text.length <= length) return text;
  const sliced = text.slice(0, length);
  const lastSpace = sliced.lastIndexOf(' ');
  return `${sliced.slice(0, lastSpace > 0 ? lastSpace : length)}...`;
};

/**
 * Parses the JSON encoded `typing_texts` setting.
 */
export const parseTypingTexts = (value) => {
  if (!value) return ['Software Developer', 'Full Stack Developer', 'Frontend Developer'];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    /* fall through to the plain-text split */
  }

  const fallback = String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return fallback.length > 0
    ? fallback
    : ['Software Developer', 'Full Stack Developer', 'Frontend Developer'];
};

/**
 * Builds a resolvable URL for a stored asset path.
 */
export const assetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/uploads') || path.startsWith('/public')) {
    return `${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}${path}`;
  }
  return path;
};
