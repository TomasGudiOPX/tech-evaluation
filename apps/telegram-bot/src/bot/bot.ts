import { pathToFileURL } from "node:url";
import { Bot } from "grammy";
import { LlmClient } from "../agent/llm.js";
import { runAgent } from "../agent/loop.js";
import { BridgeClient } from "../client/bridge-client.js";
import { loadBotConfig } from "../config.js";
import { loadDotEnvIfPresent } from "../lib/env.js";

export async function main(): Promise<void> {
  loadDotEnvIfPresent();
  const config = loadBotConfig();

  const bridge = new BridgeClient({ bridgeUrl: config.bridgeUrl, mcpApiToken: config.mcpApiToken });
  const llm = new LlmClient({ apiKey: config.llmApiKey, apiBase: config.llmApiBase, model: config.llmModel, timeoutMs: config.llmTimeoutMs });

  const bot = new Bot(config.telegramBotToken);

  bot.on("message:text", async (ctx) => {
    if (!config.allowedChatIds.includes(String(ctx.chat.id))) {
      return;
    }
    if (ctx.message.text.startsWith("/")) {
      return;
    }
    try {
      await ctx.api.sendChatAction(ctx.chat.id, "typing");
      const answer = await runAgent(ctx.message.text, {
        bridge,
        llm,
        maxIterations: config.maxIterations,
        maxResultsChars: config.maxResultsChars,
      });
      await ctx.reply(answer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("failed to answer:", error);
      await ctx.reply(`Error: ${message}`).catch(() => undefined);
    }
  });

  bot.catch((error) => {
    console.error("bot error:", error.error);
  });

  console.log("telegram-db-bridge bot started (long polling)");
  await bot.start();
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
