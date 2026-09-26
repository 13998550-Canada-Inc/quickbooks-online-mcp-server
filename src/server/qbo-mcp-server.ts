import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Create a fresh MCP server instance. The HTTP transport builds one per request
 * (stateless), so the server holds no cross-request — and therefore no
 * cross-tenant — state.
 */
export function createQuickbooksMcpServer(): McpServer {
  return new McpServer(
    {
      name: "QuickBooks Online MCP Server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );
}
