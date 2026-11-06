/**
 * Single source of truth for the API origin.
 *
 * `VITE_API_URL` always wins (set it in Vercel to use a custom domain). When it
 * is missing in a production build we fall back to the deployed Render API so
 * the SPA never accidentally calls its own origin on Vercel.
 */
const DEFAULT_PRODUCTION_API = 'https://cedrick-portfolia.onrender.com';

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? DEFAULT_PRODUCTION_API : '')
).replace(/\/$/, '');

export default API_BASE_URL;
