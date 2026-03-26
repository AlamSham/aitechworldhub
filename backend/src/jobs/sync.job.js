import cron from 'node-cron';
import { env } from '../config/env.js';
import { syncSources } from '../services/rss.service.js';
import { createDraftFromSource } from '../services/draft.service.js';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function startSyncJob() {
  const hours = Math.max(1, Number(env.syncIntervalHours || 6));
  const expr = `0 */${hours} * * *`;

  cron.schedule(expr, async () => {
    try {
      console.log('[CRON] Starting sync...');
      const imported = await syncSources(env.maxDraftsPerSync);
      console.log(`[CRON] Fetched ${imported.length} new sources. Processing one-by-one...`);

      const total = imported.slice(0, env.maxDraftsPerSync);
      for (let i = 0; i < total.length; i++) {
        const source = total[i];
        console.log(`[CRON] [${i + 1}/${total.length}] Generating AI draft for: "${source.title}"`);
        
        const draft = await createDraftFromSource(source, env.defaultAuthor);
        
        console.log(`[CRON] [${i + 1}/${total.length}] ✅ Draft created: "${draft.title}" | ${draft.readingTime} min read | ${draft.category}`);

        // Wait 5 seconds before processing the next source
        // This gives the AI proper time and avoids rate limits
        if (i < total.length - 1) {
          console.log(`[CRON] Waiting 5 seconds before next draft...`);
          await wait(5000);
        }
      }

      console.log(`[CRON] Sync complete. Created ${total.length} drafts.`);
    } catch (err) {
      console.error('[CRON] Sync failed', err.message);
    }
  });

  console.log(`[CRON] Scheduled every ${hours}h (${expr})`);
}
