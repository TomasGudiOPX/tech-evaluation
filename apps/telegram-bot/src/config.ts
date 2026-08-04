import { z } from "zod";

export const agentConfigSchema = z.object({
  bridgeUrl: z.string().url().default("http://127.0.0.1:3000/mcp"),
  mcpApiToken: z.string().min(1, "MCP_API_TOKEN is required"),
  llmApiKey: z.string().optional(),
  llmApiBase: z.string().url().default("https://api.openai.com/v1"),
  llmModel: z.string().min(1).default("gpt-4o-mini"),
  llmTimeoutMs: z.coerce.number().int().min(10_000).max(600_000).default(120_000),
  maxIterations: z.coerce.number().int().min(1).max(20).default(8),
  maxResultsChars: z.coerce.number().int().min(100).max(200_000).default(20_000),
});

export type AgentConfig = z.infer<typeof agentConfigSchema>;

export const botConfigSchema = agentConfigSchema.extend({
  llmApiKey: z.string().min(1, "LLM_API_KEY is required"),
  telegramBotToken: z.string().min(1, "TELEGRAM_BOT_TOKEN is required"),
  allowedChatIds: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((chatId) => chatId.trim())
        .filter((chatId) => chatId.length > 0),
    )
    .refine((chatIds) => chatIds.length > 0, "TELEGRAM_ALLOWED_CHAT_IDS must list at least one chat id"),
});

export type BotConfig = z.infer<typeof botConfigSchema>;

type Env = Record<string, string | undefined>;

export function loadAgentConfig(env: Env = process.env): AgentConfig {
  return agentConfigSchema.parse({
    bridgeUrl: env.BRIDGE_URL,
    mcpApiToken: env.MCP_API_TOKEN,
    llmApiKey: env.LLM_API_KEY,
    llmApiBase: env.LLM_API_BASE,
    llmModel: env.LLM_MODEL,
    llmTimeoutMs: env.LLM_TIMEOUT_MS,
    maxIterations: env.MAX_ITERATIONS,
    maxResultsChars: env.MAX_RESULTS_CHARS,
  });
}

export function loadBotConfig(env: Env = process.env): BotConfig {
  return botConfigSchema.parse({
    bridgeUrl: env.BRIDGE_URL,
    mcpApiToken: env.MCP_API_TOKEN,
    llmApiKey: env.LLM_API_KEY,
    llmApiBase: env.LLM_API_BASE,
    llmModel: env.LLM_MODEL,
    llmTimeoutMs: env.LLM_TIMEOUT_MS,
    maxIterations: env.MAX_ITERATIONS,
    maxResultsChars: env.MAX_RESULTS_CHARS,
    telegramBotToken: env.TELEGRAM_BOT_TOKEN,
    allowedChatIds: env.TELEGRAM_ALLOWED_CHAT_IDS,
  });
}
