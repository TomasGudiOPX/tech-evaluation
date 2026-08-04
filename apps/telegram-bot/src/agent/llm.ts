export type ToolCall = { id: string; name: string; arguments: Record<string, unknown> };

export type LlmMessage =
  | { role: "system" | "user" | "assistant"; content: string; tool_calls?: ToolCall[] }
  | { role: "tool"; content: string; tool_call_id: string };

export type LlmTool = { name: string; description: string; inputSchema: Record<string, unknown> };

export type LlmClientOptions = { apiKey: string; apiBase: string; model: string; timeoutMs: number };
export type ChatResult = { message: LlmMessage };

type ApiToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };
type ApiMessage = { role: string; content?: string | null; tool_calls?: ApiToolCall[]; tool_call_id?: string };
type ApiChoice = { message: ApiMessage };
type ChatCompletionResponse = { choices: ApiChoice[] };

export class LlmClient {
  private readonly options: LlmClientOptions;

  constructor(options: LlmClientOptions) {
    this.options = options;
  }

  async chat(messages: LlmMessage[], tools: LlmTool[]): Promise<ChatResult> {
    const url = `${this.options.apiBase.replace(/\/+$/, "")}/chat/completions`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.options.apiKey}`,
      },
      body: JSON.stringify({
        model: this.options.model,
        messages: messages.map(toApiMessage),
        ...(tools.length > 0 ? { tools: tools.map(toApiTool) } : {}),
      }),
      signal: AbortSignal.timeout(this.options.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`LLM request failed (${response.status})`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const message = data.choices[0]?.message;
    if (!message) {
      throw new Error("LLM returned no message");
    }

    const toolCalls: ToolCall[] = (message.tool_calls ?? []).map((call) => ({
      id: call.id,
      name: call.function.name,
      arguments: parseArguments(call.function.arguments),
    }));

    const out: LlmMessage = { role: "assistant", content: message.content ?? "" };
    if (toolCalls.length > 0) {
      out.tool_calls = toolCalls;
    }
    return { message: out };
  }
}

function toApiMessage(message: LlmMessage): ApiMessage {
  if (message.role === "tool") {
    return { role: "tool", content: message.content, tool_call_id: message.tool_call_id };
  }
  const apiMessage: ApiMessage = { role: message.role, content: message.content };
  if (message.role === "assistant" && message.tool_calls && message.tool_calls.length > 0) {
    apiMessage.tool_calls = message.tool_calls.map((call) => ({
      id: call.id,
      type: "function",
      function: { name: call.name, arguments: JSON.stringify(call.arguments) },
    }));
  }
  return apiMessage;
}

function toApiTool(tool: LlmTool): { type: "function"; function: { name: string; description: string; parameters: Record<string, unknown> } } {
  return {
    type: "function",
    function: { name: tool.name, description: tool.description, parameters: tool.inputSchema },
  };
}

function parseArguments(raw: string | undefined): Record<string, unknown> {
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}
