import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/afterhour',
  jwtSecret: process.env.JWT_SECRET || 'afterhour_dev_secret',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  mapboxToken: process.env.MAPBOX_TOKEN || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};

export default config;
