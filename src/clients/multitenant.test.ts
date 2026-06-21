import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate as yieldTick } from "node:timers/promises";

// quickbooks-client.ts throws at import if app credentials are absent, and reads
// them once at module load — set them before importing.
process.env.QUICKBOOKS_CLIENT_ID = "test-client";
process.env.QUICKBOOKS_CLIENT_SECRET = "test-secret";
process.env.QUICKBOOKS_ENVIRONMENT = "sandbox";

const { runWithRequestContext } = await import("../request-context.js");
const { quickbooksClient } = await import("./quickbooks-client.js");

test("concurrent requests build clients for their own realm with no cross-bleed", async () => {
  let realmA: string | undefined;
  let realmB: string | undefined;

  // Interleave two requests: each authenticates, yields to the event loop (so the
  // other request runs), then reads its client back. The realm each reads must be
  // its own — proving the built client lives in the per-request store, not shared.
  await Promise.all([
    runWithRequestContext({ accessToken: "tok-A", realmId: "realm-A" }, async () => {
      await quickbooksClient.authenticate();
      await yieldTick();
      realmA = (quickbooksClient.getQuickbooks() as any).realmId;
    }),
    runWithRequestContext({ accessToken: "tok-B", realmId: "realm-B" }, async () => {
      await quickbooksClient.authenticate();
      await yieldTick();
      realmB = (quickbooksClient.getQuickbooks() as any).realmId;
    }),
  ]);

  assert.equal(realmA, "realm-A");
  assert.equal(realmB, "realm-B");
});

test("a request with no credentials fails with an actionable error", async () => {
  await assert.rejects(
    () => runWithRequestContext(undefined, () => quickbooksClient.authenticate()),
    /organization settings/i
  );
});

test("getQuickbooks before authenticate throws rather than reusing another request's client", async () => {
  await runWithRequestContext({ accessToken: "tok-C", realmId: "realm-C" }, async () => {
    assert.throws(() => quickbooksClient.getQuickbooks(), /Call authenticate\(\) first/i);
  });
});
