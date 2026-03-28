import { connectDatabase } from './src/config/db.js';
import { createDraftFromSource } from './src/services/draft.service.js';
import { generateSeoDraftFromSource } from './src/services/ai.service.js';
import mongoose from 'mongoose';

async function testDraftGeneration() {
  await connectDatabase();

  const sourceChinaUS = {
    _id: new mongoose.Types.ObjectId(),
    title: "DeepSeek vs OpenAI: The new strict regulations between China and the US",
    summary: "As China pushes Huawei and DeepSeek models, the United States tightens export controls and OpenAI faces new competition. DeepSeek is a huge win for Beijing tech, while Nvidia struggles to sell in the Chinese market.",
    link: "https://example.com/test-china-us-123",
    tags: ["industry", "news"],
    content: "Full content about the rivalry between the two nations."
  };

  const sourceComparison = {
    _id: new mongoose.Types.ObjectId(),
    title: "ChatGPT vs Claude 3.5: Ultimate Comparison for Coders",
    summary: "A head-to-head comparison of OpenAI's ChatGPT and Anthropic's Claude 3.5 Sonnet on programming tasks.",
    link: "https://example.com/test-compare-123",
    tags: ["llm", "coding"],
    content: "Full content of comparison..."
  };

  console.log("-----------------------------------------");
  console.log("Generating China-US Draft...");
  console.log("-----------------------------------------");
  try {
    const draft1 = await createDraftFromSource(sourceChinaUS, "TestAdmin");
    if (draft1) {
      console.log("✅ Success! China-US Draft Result:");
      console.log("Title:", draft1.title);
      console.log("Category:", draft1.category);
      console.log("Tags:", draft1.tags);
    } else {
      console.log("❌ Skipped (Likely Cadence limit blocked it). Passing raw generation directly to AI to test logic:");
      const directAI1 = await generateSeoDraftFromSource(sourceChinaUS);
      console.log("Direct AI Category:", directAI1?.category);
      console.log("Direct AI Title:", directAI1?.title);
    }
  } catch (err) {
    console.error("Error generating China-US draft:", err.message);
  }

  console.log("\n-----------------------------------------");
  console.log("Generating Comparison Draft...");
  console.log("-----------------------------------------");
  try {
    const draft2 = await createDraftFromSource(sourceComparison, "TestAdmin");
    if (draft2) {
      console.log("✅ Success! Comparison Draft Result:");
      console.log("Title:", draft2.title);
      console.log("Category:", draft2.category);
      console.log("Tags:", draft2.tags);
    } else {
      console.log("❌ Skipped by DB filter. Generating raw output to test AI logic:");
      const directAI2 = await generateSeoDraftFromSource(sourceComparison);
      console.log("Direct AI Category:", directAI2?.category);
      console.log("Direct AI Title:", directAI2?.title);
    }
  } catch (err) {
    console.error("Error generating comparison draft:", err.message);
  }

  console.log("\n✅ Test Completed.");
  process.exit(0);
}

testDraftGeneration().catch((e) => {
  console.error(e);
  process.exit(1);
});
