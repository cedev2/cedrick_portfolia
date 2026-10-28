import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: toInt(process.env.PORT, 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  mongoUri:
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_db',

  jwtSecret: process.env.JWT_SECRET || 'cedrick_portfolio_jwt_secret_key_2024',
  jwtExpiry: toInt(process.env.JWT_EXPIRY, 86400),

  ejolabsApiKey: process.env.EJOLABS_API_KEY || '',

  uploadMaxSize: toInt(process.env.UPLOAD_MAX_SIZE, 20 * 1024 * 1024),
  uploadRoot: path.resolve(__dirname, '../../uploads'),
  publicRoot: path.resolve(__dirname, '../../public'),

  admin: {
    username: process.env.ADMIN_USERNAME || 'cedev',
    email: process.env.ADMIN_EMAIL || 'cedrickrwa@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'Pcoding52!',
    fullName: process.env.ADMIN_FULL_NAME || 'NIBISHAKA CEDRICK',
  },
};

export default env;
