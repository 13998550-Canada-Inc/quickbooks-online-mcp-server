import dotenv from "dotenv";
import QuickBooks from "node-quickbooks";
import OAuthClient from "intuit-oauth";

dotenv.config();

const client_id     = process.env.QUICKBOOKS_CLIENT_ID;
const client_secret = process.env.QUICKBOOKS_CLIENT_SECRET;
const environment   = process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox';

if (!client_id || !client_secret) {
  throw Error("QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET must be set");
}

class QuickbooksClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private refreshToken?: string;
  private realmId?: string;
  private readonly environment: string;
  private accessToken?: string;
  private accessTokenExpiry?: Date;
  private quickbooksInstance?: QuickBooks;
  private oauthClient: OAuthClient;

  constructor(config: {
    clientId: string;
    clientSecret: string;
    environment: string;
  }) {
    this.clientId     = config.clientId;
    this.clientSecret = config.clientSecret;
    this.environment  = config.environment;
    // redirectUri is a required field for OAuthClient but unused in server-side refresh flows.
    this.oauthClient  = new OAuthClient({
      clientId:     this.clientId,
      clientSecret: this.clientSecret,
      environment:  this.environment,
      redirectUri:  'http://localhost',
    });
  }

  /**
   * Fetch refresh_token and realm_id from the CadencePro token endpoint.
   * These are stored (encrypted) in MariaDB after the admin completes the OAuth
   * flow in the MCP Servers settings screen.
   */
  private async fetchCredentialsFromKando(): Promise<void> {
    const endpoint  = process.env.KANDO_TOKEN_ENDPOINT;
    const secret    = process.env.KANDO_INTERNAL_SECRET;
    const accountId = process.env.QUICKBOOKS_ACCOUNT_ID;

    if (!endpoint) {
      throw new Error('KANDO_TOKEN_ENDPOINT is not set — cannot fetch QBO credentials');
    }

    const params = new URLSearchParams({ server_key: 'quickbooks', account_id: accountId ?? '' });
    const res = await fetch(`${endpoint}?${params}`, {
      headers: { 'X-Internal-Secret': secret ?? '' },
    });

    if (res.status === 404) {
      throw new Error('QuickBooks not authorized yet — connect via CadencePro MCP Servers settings');
    }
    if (!res.ok) {
      throw new Error(`Token endpoint returned HTTP ${res.status}`);
    }

    const data = await res.json() as { refresh_token?: string; realm_id?: string };
    if (!data.refresh_token || !data.realm_id) {
      throw new Error('Token endpoint response missing refresh_token or realm_id');
    }

    this.refreshToken = data.refresh_token;
    this.realmId      = data.realm_id;
  }

  async refreshAccessToken() {
    if (!this.refreshToken || !this.realmId) {
      await this.fetchCredentialsFromKando();
    }

    try {
      const authResponse = await this.oauthClient.refreshUsingToken(this.refreshToken!);
      this.accessToken = authResponse.token.access_token;
      const expiresIn  = authResponse.token.expires_in || 3600;
      this.accessTokenExpiry = new Date(Date.now() + expiresIn * 1000);
      return { access_token: this.accessToken, expires_in: expiresIn };
    } catch (error: any) {
      // Credentials may have been refreshed on the PHP side — re-fetch and retry once.
      await this.fetchCredentialsFromKando();
      const authResponse = await this.oauthClient.refreshUsingToken(this.refreshToken!);
      this.accessToken = authResponse.token.access_token;
      const expiresIn  = authResponse.token.expires_in || 3600;
      this.accessTokenExpiry = new Date(Date.now() + expiresIn * 1000);
      return { access_token: this.accessToken, expires_in: expiresIn };
    }
  }

  async authenticate() {
    if (!this.refreshToken || !this.realmId) {
      await this.fetchCredentialsFromKando();
    }

    const now = new Date();
    if (!this.accessToken || !this.accessTokenExpiry || this.accessTokenExpiry <= now) {
      const tokenResponse = await this.refreshAccessToken();
      this.accessToken = tokenResponse.access_token;
    }

    this.quickbooksInstance = new QuickBooks(
      this.clientId,
      this.clientSecret,
      this.accessToken!,
      false,
      this.realmId!,
      this.environment === 'sandbox',
      false,
      null,
      '2.0',
      this.refreshToken
    );

    return this.quickbooksInstance;
  }

  getQuickbooks() {
    if (!this.quickbooksInstance) {
      throw new Error('Quickbooks not authenticated. Call authenticate() first');
    }
    return this.quickbooksInstance;
  }
}

export const quickbooksClient = new QuickbooksClient({
  clientId:    client_id,
  clientSecret: client_secret,
  environment:  environment,
});
