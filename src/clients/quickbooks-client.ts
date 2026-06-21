import dotenv from "dotenv";
import QuickBooks from "node-quickbooks";
import { getRequestCredentials, getRequestStore } from "../request-context.js";

dotenv.config();

// App-level credentials (the QuickBooks app registration). These are shared by
// every tenant that connects through this app and are safe to read once at
// startup. Per-tenant credentials (access token, realm id, refresh token) are
// NOT read here — they arrive per request, see request-context.ts.
const client_id     = process.env.QUICKBOOKS_CLIENT_ID;
const client_secret = process.env.QUICKBOOKS_CLIENT_SECRET;
const environment   = process.env.QUICKBOOKS_ENVIRONMENT || "sandbox";

if (!client_id || !client_secret) {
  throw Error("QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET must be set");
}

class QuickbooksClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly environment: string;

  constructor(config: { clientId: string; clientSecret: string; environment: string }) {
    this.clientId     = config.clientId;
    this.clientSecret = config.clientSecret;
    this.environment  = config.environment;
  }

  /**
   * Build a QuickBooks client for the CURRENT request from the per-request
   * credentials injected by the kan-do MCP proxy. The built client is stashed in
   * the request-scoped store (never on this singleton) so concurrent requests
   * from different orgs can never share a connection.
   */
  async authenticate(): Promise<QuickBooks> {
    const credentials = getRequestCredentials();

    if (!credentials?.accessToken || !credentials?.realmId) {
      throw new Error(
        "No QuickBooks credentials were provided for this request. Connect QuickBooks " +
          "in your organization settings (Settings → MCP servers → QuickBooks) and try again."
      );
    }

    // kan-do refreshes the access token before forwarding it, so it is valid for
    // the lifetime of this request. The refresh token is passed through to
    // node-quickbooks only as a fallback for auto-refresh on a mid-call 401.
    const quickbooks = new QuickBooks(
      this.clientId,
      this.clientSecret,
      credentials.accessToken,
      false, // no token secret (OAuth 2.0)
      credentials.realmId,
      this.environment === "sandbox",
      false, // enableDebugging
      null, // minorversion
      "2.0", // OAuth version
      credentials.refreshToken
    );

    const store = getRequestStore();
    if (store) store.quickbooks = quickbooks;
    return quickbooks;
  }

  getQuickbooks(): QuickBooks {
    const quickbooks = getRequestStore()?.quickbooks;
    if (!quickbooks) {
      throw new Error("Quickbooks not authenticated. Call authenticate() first");
    }
    return quickbooks;
  }
}

export const quickbooksClient = new QuickbooksClient({
  clientId:     client_id,
  clientSecret: client_secret,
  environment:  environment,
});
