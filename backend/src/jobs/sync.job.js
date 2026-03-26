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
      const maxDrafts = Math.max(1, Number(env.maxDraftsPerSync || 1));
      const candidateCount = Math.max(maxDrafts * Math.max(3, Number(env.chinaUsRatioEvery || 5)), maxDrafts + 6);
      const imported = await syncSources(candidateCount);
      console.log(`[CRON] Fetched ${imported.length} new sources. Processing one-by-one...`);

      const total = imported;
      let createdCount = 0;
      let skippedCount = 0;
      for (let i = 0; i < total.length && createdCount < maxDrafts; i++) {
        const source = total[i];
        console.log(`[CRON] [${i + 1}/${total.length}] Generating AI draft for: "${source.title}"`);
        
        const draft = await createDraftFromSource(source, env.defaultAuthor);
        if (!draft) {
          skippedCount += 1;
          console.log(`[CRON] [${i + 1}/${total.length}] SKIP duplicate/similar/cadence.`);
        } else {
          createdCount += 1;
          console.log(`[CRON] [${i + 1}/${total.length}] DONE: "${draft.title}" | ${draft.readingTime} min read | ${draft.category}`);
        }

        // Wait 5 seconds before processing the next source
        // This gives the AI proper time and avoids rate limits
        if (i < total.length - 1 && createdCount < maxDrafts) {
          console.log(`[CRON] Waiting 5 seconds before next draft...`);
          await wait(5000);
        }
      }

      console.log(`[CRON] Sync complete. Created ${createdCount} drafts, skipped ${skippedCount}.`);
    } catch (err) {
      console.error('[CRON] Sync failed', err.message);
    }
  });

  console.log(`[CRON] Scheduled every ${hours}h (${expr})`);
}
