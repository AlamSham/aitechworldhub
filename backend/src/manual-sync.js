import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { syncSources } from './services/rss.service.js';
import { createDraftFromSource } from './services/draft.service.js';
import mongoose from 'mongoose';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runManualSync() {
  try {
    console.log('[MANUAL] Connecting to DB...');
    await connectDatabase();

    const maxDrafts = Math.max(1, Number(env.maxDraftsPerSync || 1));
    const candidateCount = Math.max(maxDrafts * Math.max(3, Number(env.chinaUsRatioEvery || 5)), maxDrafts + 6);
    console.log(`[MANUAL] Starting manual sync for max ${maxDrafts} drafts...`);
    
    const imported = await syncSources(candidateCount);
    console.log(`[MANUAL] Fetched ${imported.length} new sources. Processing one-by-one...`);

    const total = imported;
    let createdCount = 0;
    let skippedCount = 0;
    if (total.length === 0) {
      console.log('[MANUAL] No new sources found. Exiting.');
    }

    for (let i = 0; i < total.length && createdCount < maxDrafts; i++) {
      const source = total[i];
      console.log(`[MANUAL] [${i + 1}/${total.length}] Generating AI draft for: "${source.title}"`);
      
      const draft = await createDraftFromSource(source, env.defaultAuthor);
      
      if (draft) {
        createdCount += 1;
        console.log(`[MANUAL] [${i + 1}/${total.length}] DONE: "${draft.title}" | ${draft.readingTime} min read`);
      } else {
        skippedCount += 1;
        console.log(`[MANUAL] [${i + 1}/${total.length}] SKIP duplicate/similar/cadence.`);
      }

      if (i < total.length - 1 && createdCount < maxDrafts) {
        console.log(`[MANUAL] Waiting 5 seconds before next draft...`);
        await wait(5000);
      }
    }

    console.log(`[MANUAL] Sync complete. Created ${createdCount} drafts, skipped ${skippedCount}.`);
  } catch (err) {
    console.error('[MANUAL] Sync failed:', err.message);
  } finally {
    console.log('[MANUAL] Disconnecting DB...');
    await mongoose.disconnect();
    process.exit(0);
  }
}

runManualSync();
