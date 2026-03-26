import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { startSyncJob } from './jobs/sync.job.js';
import { assertAuthConfig } from './services/auth.service.js';

async function bootstrap() {
  assertAuthConfig();
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`[API] Running on http://localhost:${env.port}`);
  });
  if (env.enableCronSync) {
    startSyncJob();
  } else {
    console.log('[CRON] Disabled by ENABLE_CRON_SYNC=false');
  }
}

bootstrap().catch((err) => {
  console.error('Startup failed', err);
  process.exit(1);
});
