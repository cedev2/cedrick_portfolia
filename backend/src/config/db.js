import mongoose from 'mongoose';
import env from './env.js';

mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true);

export const connectDatabase = async () => {
  const connection = await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 20,
  });

  console.log(`[db] MongoDB connected -> ${connection.connection.host}/${connection.connection.name}`);
  return connection;
};

export const disconnectDatabase = async () => {
  await mongoose.connection.close();
};

export default connectDatabase;
