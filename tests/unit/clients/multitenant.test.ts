import { describe, expect, it } from '@jest/globals';
import { setImmediate as yieldTick } from 'node:timers/promises';

// quickbooks-client.ts throws at import if app credentials are absent, and reads
// them once at module load — set them before importing.
process.env.QUICKBOOKS_CLIENT_ID = 'test-client';
process.env.QUICKBOOKS_CLIENT_SECRET = 'test-secret';
process.env.QUICKBOOKS_ENVIRONMENT = 'sandbox';

const { runWithRequestContext } = await import('../../../src/request-context.js');
const { QuickbooksClient, quickbooksClient } = await import('../../../src/clients/quickbooks-client.js');

describe('per-request (multi-tenant) QuickBooks client', () => {
  it('builds clients for their own realm with no cross-bleed across concurrent requests', async () => {
    let realmA: string | undefined;
    let realmB: string | undefined;

    // Interleave two requests: each authenticates, yields to the event loop (so the
    // other request runs), then reads its client back. The realm each reads must be
    // its own — proving the built client lives in the per-request store, not shared.
    await Promise.all([
      runWithRequestContext({ accessToken: 'tok-A', realmId: 'realm-A' }, async () => {
        await quickbooksClient.authenticate();
        await yieldTick();
        realmA = (quickbooksClient.getQuickbooks() as any).realmId;
      }),
      runWithRequestContext({ accessToken: 'tok-B', realmId: 'realm-B' }, async () => {
        await quickbooksClient.authenticate();
        await yieldTick();
        realmB = (quickbooksClient.getQuickbooks() as any).realmId;
      }),
    ]);

    expect(realmA).toBe('realm-A');
    expect(realmB).toBe('realm-B');
  });

  it('fails a request with no credentials with an actionable error', async () => {
    await expect(
      runWithRequestContext(undefined, () => quickbooksClient.authenticate())
    ).rejects.toThrow(/organization settings/i);
  });

  it("throws from getQuickbooks before authenticate rather than reusing another request's client", async () => {
    await runWithRequestContext({ accessToken: 'tok-C', realmId: 'realm-C' }, async () => {
      expect(() => quickbooksClient.getQuickbooks()).toThrow(/Call authenticate\(\) first/i);
    });
  });

  it('getInstance builds the request client once and reuses it within the request', async () => {
    await runWithRequestContext({ accessToken: 'tok-D', realmId: 'realm-D' }, async () => {
      const first = await QuickbooksClient.getInstance();
      const second = await QuickbooksClient.getInstance();
      expect(second).toBe(first);
      expect((first as any).realmId).toBe('realm-D');
    });
  });

  it("getAuthCredentials returns the current request's raw credentials", async () => {
    await runWithRequestContext({ accessToken: 'tok-E', realmId: 'realm-E' }, async () => {
      await expect(QuickbooksClient.getAuthCredentials()).resolves.toEqual({
        accessToken: 'tok-E',
        realmId: 'realm-E',
        isSandbox: true,
      });
    });
    await expect(
      runWithRequestContext(undefined, () => QuickbooksClient.getAuthCredentials())
    ).rejects.toThrow(/organization settings/i);
  });
});
