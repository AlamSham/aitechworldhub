import { env } from '../config/env.js';
import { syncSources } from '../services/rss.service.js';
import { createDraftFromSource } from '../services/draft.service.js';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function manualSync(req, res, next) {
  try {
    const max = Math.max(1, Number(req.body?.maxItems || env.maxDraftsPerSync));
    const candidateCount = Math.max(max * Math.max(3, Number(env.chinaUsRatioEvery || 5)), max + 6);
    const imported = await syncSources(candidateCount);

    const sources = imported;
    const drafts = [];
    let skippedDuplicates = 0;

    for (let i = 0; i < sources.length && drafts.length < max; i++) {
      const source = sources[i];
      console.log(`[SYNC] [${i + 1}/${sources.length}] Generating AI draft for: "${source.title}"`);
      
      const draft = await createDraftFromSource(source, env.defaultAuthor);
      if (!draft) {
        skippedDuplicates += 1;
        console.log(`[SYNC] [${i + 1}/${sources.length}] SKIP duplicate/similar/cadence.`);
      } else {
        drafts.push(draft);
        console.log(`[SYNC] [${i + 1}/${sources.length}] DONE: "${draft.title}" | ${draft.readingTime} min | ${draft.category}`);
      }

      // Wait 5 seconds before processing the next one
      if (i < sources.length - 1 && drafts.length < max) {
        console.log(`[SYNC] Cooling down 5s before next draft...`);
        await wait(5000);
      }
    }

    return res.json({
      message: 'Sync completed',
      importedSources: imported.length,
      createdDrafts: drafts.length,
      skippedDuplicates,
      draftIds: drafts.map((d) => d._id)
    });
  } catch (err) {
    return next(err);
  }
}
