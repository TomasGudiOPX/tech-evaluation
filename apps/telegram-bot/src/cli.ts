import { LlmClient } from "./agent/llm.js";
import { runAgent } from "./agent/loop.js";
import { BridgeClient } from "./client/bridge-client.js";
import { loadAgentConfig } from "./config.js";
import { loadDotEnvIfPresent } from "./lib/env.js";

async function main(): Promise<void> {
  loadDotEnvIfPresent();
  const args = process.argv.slice(2);
  const listOnly = args.includes("--tools");
  const prompt = args.filter((arg) => arg !== "--tools").join(" ");

  const config = loadAgentConfig();
  const bridge = new BridgeClient({ bridgeUrl: config.bridgeUrl, mcpApiToken: config.mcpApiToken });

  if (listOnly) {
    const tools = await bridge.listTools();
    console.log(JSON.stringify(tools, null, 2));
    return;
  }

  if (!prompt) {
    console.error("usage: npm run cli -- <question>   |   npm run cli -- --tools");
    process.exit(1);
  }

  const apiKey = config.llmApiKey;
  if (!apiKey) {
    console.error("LLM_API_KEY is required for question mode");
    process.exit(1);
  }

  const llm = new LlmClient({ apiKey, apiBase: config.llmApiBase, model: config.llmModel, timeoutMs: config.llmTimeoutMs });
  const answer = await runAgent(prompt, {
    bridge,
    llm,
    maxIterations: config.maxIterations,
    maxResultsChars: config.maxResultsChars,
  });
  console.log(answer);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
