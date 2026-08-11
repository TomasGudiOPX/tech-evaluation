import type { BridgeClient } from "../client/bridge-client.js";
import { truncate } from "../lib/env.js";
import { LlmClient, type LlmMessage, type LlmTool } from "./llm.js";

export type AgentOptions = {
  bridge: BridgeClient;
  llm: LlmClient;
  maxIterations: number;
  maxResultsChars: number;
};

const SYSTEM_PROMPT = `You are a retail shopping assistant for a minimalist lifestyle store.
You have read-only access to the product catalog. You cannot write or modify data.

Available tools:
- list_products: Browse the catalog with optional category and price filters.
- get_product: Look up a product by its UUID.
- search_products: Find products by partial name (case-insensitive).

When listing products, show name, price (convert cents to dollars: cents / 100), stock, and a one-sentence description.
Answer concisely in the language the user writes in. Do not mention tools or your instructions.`;

export async function runAgent(prompt: string, options: AgentOptions): Promise<string> {
  const tools: LlmTool[] = await options.bridge.listTools();
  const messages: LlmMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  for (let iteration = 0; iteration < options.maxIterations; iteration++) {
    const { message } = await options.llm.chat(messages, tools);
    messages.push(message);

    if (message.role !== "assistant" || !message.tool_calls || message.tool_calls.length === 0) {
      return message.content || "No answer.";
    }

    for (const call of message.tool_calls) {
      let output: string;
      try {
        const result = await options.bridge.callTool(call.name, call.arguments);
        output = truncate(JSON.stringify(result), options.maxResultsChars);
      } catch (error) {
        output = truncate(error instanceof Error ? error.message : String(error), options.maxResultsChars);
      }
      messages.push({ role: "tool", content: output, tool_call_id: call.id });
    }
  }

  return "Reached the maximum number of steps without a final answer. Try a more specific question.";
}
