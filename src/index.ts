#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { type NextFunction, type Request, type Response } from "express";
import { runWithRequestContext, type QboCredentials } from "./request-context.js";
import { createQuickbooksMcpServer } from "./server/qbo-mcp-server.js";
// import { ListInvoicesTool } from "./tools/list-invoices.tool.js";
// import { CreateCustomerTool } from "./tools/create-customer.tool.js";
import { RegisterTool } from "./helpers/register-tool.js";
import { CreateAccountTool } from "./tools/create-account.tool.js";
import { CreateInvoiceTool } from "./tools/create-invoice.tool.js";
import { CreateItemTool } from "./tools/create-item.tool.js";
import { ReadInvoiceTool } from "./tools/read-invoice.tool.js";
import { ReadItemTool } from "./tools/read-item.tool.js";
import { SearchAccountsTool } from "./tools/search-accounts.tool.js";
import { SearchInvoicesTool } from "./tools/search-invoices.tool.js";
import { SearchItemsTool } from "./tools/search-items.tool.js";
import { UpdateAccountTool } from "./tools/update-account.tool.js";
import { UpdateInvoiceTool } from "./tools/update-invoice.tool.js";
import { UpdateItemTool } from "./tools/update-item.tool.js";
// import { ListAccountsTool } from "./tools/list-accounts.tool.js";
// import { UpdateCustomerTool } from "./tools/update-customer.tool.js";
import { CreateBillTool } from "./tools/create-bill.tool.js";
import { CreateCustomerTool } from "./tools/create-customer.tool.js";
import { CreateEstimateTool } from "./tools/create-estimate.tool.js";
import { CreateVendorTool } from "./tools/create-vendor.tool.js";
import { DeleteBillTool } from "./tools/delete-bill.tool.js";
import { DeleteCustomerTool } from "./tools/delete-customer.tool.js";
import { DeleteEstimateTool } from "./tools/delete-estimate.tool.js";
import { DeleteVendorTool } from "./tools/delete-vendor.tool.js";
import { GetBillTool } from "./tools/get-bill.tool.js";
import { GetCustomerTool } from "./tools/get-customer.tool.js";
import { GetEstimateTool } from "./tools/get-estimate.tool.js";
import { GetVendorTool } from "./tools/get-vendor.tool.js";
import { SearchBillsTool } from "./tools/search-bills.tool.js";
import { SearchCustomersTool } from "./tools/search-customers.tool.js";
import { SearchEstimatesTool } from "./tools/search-estimates.tool.js";
import { SearchVendorsTool } from "./tools/search-vendors.tool.js";
import { UpdateBillTool } from "./tools/update-bill.tool.js";
import { UpdateCustomerTool } from "./tools/update-customer.tool.js";
import { UpdateEstimateTool } from "./tools/update-estimate.tool.js";
import { UpdateVendorTool } from "./tools/update-vendor.tool.js";

// Employee tools
import { CreateEmployeeTool } from "./tools/create-employee.tool.js";
import { GetEmployeeTool } from "./tools/get-employee.tool.js";
import { SearchEmployeesTool } from "./tools/search-employees.tool.js";
import { UpdateEmployeeTool } from "./tools/update-employee.tool.js";

// Journal Entry tools
import { CreateJournalEntryTool } from "./tools/create-journal-entry.tool.js";
import { DeleteJournalEntryTool } from "./tools/delete-journal-entry.tool.js";
import { GetJournalEntryTool } from "./tools/get-journal-entry.tool.js";
import { SearchJournalEntriesTool } from "./tools/search-journal-entries.tool.js";
import { UpdateJournalEntryTool } from "./tools/update-journal-entry.tool.js";

// Bill Payment tools
import { CreateBillPaymentTool } from "./tools/create-bill-payment.tool.js";
import { DeleteBillPaymentTool } from "./tools/delete-bill-payment.tool.js";
import { GetBillPaymentTool } from "./tools/get-bill-payment.tool.js";
import { SearchBillPaymentsTool } from "./tools/search-bill-payments.tool.js";
import { UpdateBillPaymentTool } from "./tools/update-bill-payment.tool.js";

// Purchase tools
import { CreatePurchaseTool } from "./tools/create-purchase.tool.js";
import { DeletePurchaseTool } from "./tools/delete-purchase.tool.js";
import { GetPurchaseTool } from "./tools/get-purchase.tool.js";
import { SearchPurchasesTool } from "./tools/search-purchases.tool.js";
import { UpdatePurchaseTool } from "./tools/update-purchase.tool.js";

function registerAllTools(server: McpServer) {
  // Add tools for customers
  RegisterTool(server, CreateCustomerTool);
  RegisterTool(server, GetCustomerTool);
  RegisterTool(server, UpdateCustomerTool);
  RegisterTool(server, DeleteCustomerTool);
  RegisterTool(server, SearchCustomersTool);
  // Add tools for estimates
  RegisterTool(server, CreateEstimateTool);
  RegisterTool(server, GetEstimateTool);
  RegisterTool(server, UpdateEstimateTool);
  RegisterTool(server, DeleteEstimateTool);
  RegisterTool(server, SearchEstimatesTool);
  
  // Add tools for bills
  RegisterTool(server, CreateBillTool);
  RegisterTool(server, UpdateBillTool);
  RegisterTool(server, DeleteBillTool);
  RegisterTool(server, GetBillTool);
  RegisterTool(server, SearchBillsTool);


  // Add tool to read a single invoice
  RegisterTool(server, ReadInvoiceTool);

  // Add tool to search invoices
  RegisterTool(server, SearchInvoicesTool);

  // Add tool to create invoice
  RegisterTool(server, CreateInvoiceTool);

  // Add tool to update invoice
  RegisterTool(server, UpdateInvoiceTool);

  // Chart of accounts tools
  RegisterTool(server, CreateAccountTool);
  RegisterTool(server, UpdateAccountTool);
  RegisterTool(server, SearchAccountsTool);

  // Add tool to read item
  RegisterTool(server, ReadItemTool);
  RegisterTool(server, SearchItemsTool);
  RegisterTool(server, CreateItemTool);
  RegisterTool(server, UpdateItemTool);

  // // Add a tool to create a customer
  // RegisterTool(server, CreateCustomerTool);

  // // Add tool to list accounts
  // RegisterTool(server, ListAccountsTool);

  // // Add tool to update a customer
  // RegisterTool(server, UpdateCustomerTool);

  // Add tools for vendors
  RegisterTool(server, CreateVendorTool);
  RegisterTool(server, UpdateVendorTool);
  RegisterTool(server, DeleteVendorTool);
  RegisterTool(server, GetVendorTool);
  RegisterTool(server, SearchVendorsTool);

  // Add tools for employees
  RegisterTool(server, CreateEmployeeTool);
  RegisterTool(server, GetEmployeeTool);
  RegisterTool(server, UpdateEmployeeTool);
  RegisterTool(server, SearchEmployeesTool);

  // Add tools for journal entries
  RegisterTool(server, CreateJournalEntryTool);
  RegisterTool(server, GetJournalEntryTool);
  RegisterTool(server, UpdateJournalEntryTool);
  RegisterTool(server, DeleteJournalEntryTool);
  RegisterTool(server, SearchJournalEntriesTool);

  // Add tools for bill payments
  RegisterTool(server, CreateBillPaymentTool);
  RegisterTool(server, GetBillPaymentTool);
  RegisterTool(server, UpdateBillPaymentTool);
  RegisterTool(server, DeleteBillPaymentTool);
  RegisterTool(server, SearchBillPaymentsTool);

  // Add tools for purchases
  RegisterTool(server, CreatePurchaseTool);
  RegisterTool(server, GetPurchaseTool);
  RegisterTool(server, UpdatePurchaseTool);
  RegisterTool(server, DeletePurchaseTool);
  RegisterTool(server, SearchPurchasesTool);
}

/**
 * Resolve the per-request QuickBooks credentials from the incoming request. The
 * kan-do MCP proxy forwards each org's credentials per request:
 *   - Authorization: Bearer <access_token>   (required)
 *   - X-QB-Realm-Id: <company_id>             (required)
 *   - X-QB-Refresh-Token: <refresh_token>     (optional, for mid-call refresh)
 * Header names follow the emerging community convention (see LibreChat's QBO
 * HTTP server). Returns undefined when the mandatory credentials are absent.
 */
function getRequestCredentials(req: Request): QboCredentials | undefined {
  const authHeader = req.headers.authorization;
  const realmId = req.headers["x-qb-realm-id"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) return undefined;
  if (typeof realmId !== "string" || realmId.length === 0) return undefined;

  const refreshToken = req.headers["x-qb-refresh-token"];

  return {
    accessToken: authHeader.substring(7),
    realmId,
    refreshToken: typeof refreshToken === "string" && refreshToken.length > 0 ? refreshToken : undefined,
  };
}

/**
 * Reject any /mcp request that does not carry the mandatory per-request
 * credentials, so a misconfigured request can never silently fall through to
 * another tenant's connection.
 */
const requireQboCredentials = (
  req: Request & { qboCredentials?: QboCredentials },
  res: Response,
  next: NextFunction
): void => {
  const credentials = getRequestCredentials(req);
  if (!credentials) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Missing QuickBooks credentials (Authorization bearer token and X-QB-Realm-Id headers are required)" },
      id: null,
    });
    return;
  }
  req.qboCredentials = credentials;
  next();
};

const main = async () => {
  const port = Number(process.env.QBO_MCP_PORT ?? 3000);
  const host = process.env.QBO_MCP_HOST ?? "0.0.0.0";

  const app = express();
  app.use(express.json());

  const handleMcp = async (req: Request & { qboCredentials?: QboCredentials }, res: Response) => {
    // Fresh server + stateless transport per request: no session is retained, so
    // one tenant's request can never reuse another tenant's server state.
    const server = createQuickbooksMcpServer();
    registerAllTools(server);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      // POST carries the JSON-RPC body; GET opens an SSE stream with no body.
      const body = req.method === "POST" ? req.body : undefined;
      await runWithRequestContext(req.qboCredentials, () =>
        transport.handleRequest(req, res, body)
      );
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  };

  app.post("/mcp", requireQboCredentials, handleMcp);
  app.get("/mcp", requireQboCredentials, handleMcp);

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  app.listen(port, host, () => {
    console.error(`QuickBooks MCP server listening on http://${host}:${port}/mcp`);
  });
};

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});