import { Router } from 'express';
import {
  chat,
  clearHistory,
  getHistory,
  getPublicAiSettings,
} from '../controllers/ai.controller.js';
import { validate } from '../middleware/error.js';
import { chatSchema } from '../validators/schemas.js';

const router = Router();

router.get('/settings', getPublicAiSettings);
router.post('/chat', validate(chatSchema), chat);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

export default router;
