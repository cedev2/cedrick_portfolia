/**
 * Standardised API response envelope.
 * Mirrors the legacy PHP `sendSuccess` / `sendError` contract so the
 * frontend data layer keeps a single, predictable shape.
 */
export const sendSuccess = (res, data = null, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

export const sendError = (res, message = 'An error occurred', status = 400, errors = undefined) =>
  res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });

export default sendSuccess;
