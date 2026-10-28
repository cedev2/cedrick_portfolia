import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();

/* ------------------------------------------------------------------ *
 * Core middleware
 * ------------------------------------------------------------------ */
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: env.isProduction ? undefined : false,
  }),
);

app.use(
  cors({
    origin: env.isProduction ? env.clientOrigin : true,
    credentials: true,
  }),
);

app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

if (!env.isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/* ------------------------------------------------------------------ *
 * Rate limiting
 * ------------------------------------------------------------------ */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many messages, please slow down.' },
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/ai/chat', chatLimiter);

/* ------------------------------------------------------------------ *
 * Static files
 * ------------------------------------------------------------------ */
app.use('/uploads', express.static(env.uploadRoot, { maxAge: '7d' }));
app.use('/public', express.static(env.publicRoot, { maxAge: '7d' }));

/* ------------------------------------------------------------------ *
 * API
 * ------------------------------------------------------------------ */
app.get('/', (_req, res) =>
  res.json({
    success: true,
    message: 'Cedrick Portfolio API',
    data: { version: '2.0.0', docs: '/api/health' },
  }),
);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
