import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_blog',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '12h',
  adminSetupKey: process.env.ADMIN_SETUP_KEY || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  sourceMinRelevanceScore: Number(process.env.SOURCE_MIN_RELEVANCE_SCORE || 4),
  requireChinaUsPair: String(process.env.REQUIRE_CHINA_US_PAIR || 'false').toLowerCase() === 'true',
  minWarHits: Number(process.env.MIN_WAR_HITS || 1),
  enableCronSync: String(process.env.ENABLE_CRON_SYNC || 'true').toLowerCase() === 'true',
  syncIntervalHours: Number(process.env.SYNC_INTERVAL_HOURS || 6),
  maxDraftsPerSync: Number(process.env.MAX_DRAFTS_PER_SYNC || 1),
  chinaUsRatioEvery: Number(process.env.CHINA_US_RATIO_EVERY || 5),
  articleMinWords: Number(process.env.ARTICLE_MIN_WORDS || 1100),
  articleMaxWords: Number(process.env.ARTICLE_MAX_WORDS || 1600),
  latestLookbackDays: Number(process.env.LATEST_LOOKBACK_DAYS || 120),
  targetFocusRegion: process.env.TARGET_FOCUS_REGION || 'US,UK',
  defaultAuthor: process.env.DEFAULT_AUTHOR || 'Shamshad',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER || 'ai-blog/drafts',
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || ''
};
