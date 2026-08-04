import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export type BridgeClientOptions = { bridgeUrl: string; mcpApiToken: string };
export type BridgeTool = { name: string; description: string; inputSchema: Record<string, unknown> };

export class BridgeClient {
  private readonly client: Client;
  private readonly transport: StreamableHTTPClientTransport;
  private connected = false;
  private connecting: Promise<void> | null = null;

  constructor(options: BridgeClientOptions) {
    this.transport = new StreamableHTTPClientTransport(new URL(options.bridgeUrl), {
      requestInit: {
        headers: { Authorization: `Bearer ${options.mcpApiToken}` },
      },
    });
    this.client = new Client({ name: "telegram-db-bridge-agent", version: "0.1.0" });
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }
    if (!this.connecting) {
      this.connecting = this.client.connect(this.transport).then(() => {
        this.connected = true;
        this.connecting = null;
      });
    }
    await this.connecting;
  }

  async close(): Promise<void> {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
    }
  }

  async listTools(): Promise<BridgeTool[]> {
    await this.connect();
    const result = await this.client.listTools();
    return result.tools.map((tool) => ({
      name: tool.name,
      description: tool.description ?? "",
      inputSchema: tool.inputSchema as Record<string, unknown>,
    }));
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    await this.connect();
    const result = await this.client.callTool({ name, arguments: args });
    const text = contentToText(result.content);
    if (result.isError) {
      throw new Error(text || `tool ${name} failed`);
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}

function contentToText(content: unknown): string {
  if (!Array.isArray(content)) {
    return "";
  }
  return content
    .map((item) => (item && typeof item === "object" && "text" in item ? String(item.text) : ""))
    .join("\n");
}
