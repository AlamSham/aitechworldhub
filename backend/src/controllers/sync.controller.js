import { env } from '../config/env.js';
import { syncSources } from '../services/rss.service.js';
import { createDraftFromSource } from '../services/draft.service.js';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function manualSync(req, res, next) {
  try {
    const max = Number(req.body?.maxItems || env.maxDraftsPerSync);
    const imported = await syncSources(max);

    const sources = imported.slice(0, env.maxDraftsPerSync);
    const drafts = [];

    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      console.log(`[SYNC] [${i + 1}/${sources.length}] Generating AI draft for: "${source.title}"`);
      
      const draft = await createDraftFromSource(source, env.defaultAuthor);
      drafts.push(draft);
      
      console.log(`[SYNC] [${i + 1}/${sources.length}] ✅ Done: "${draft.title}" | ${draft.readingTime} min | ${draft.category}`);

      // Wait 5 seconds before processing the next one
      if (i < sources.length - 1) {
        console.log(`[SYNC] Cooling down 5s before next draft...`);
        await wait(5000);
      }
    }

    return res.json({
      message: 'Sync completed',
      importedSources: imported.length,
      createdDrafts: drafts.length,
      draftIds: drafts.map((d) => d._id)
    });
  } catch (err) {
    return next(err);
  }
}
