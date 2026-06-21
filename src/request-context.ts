import { AsyncLocalStorage } from "node:async_hooks";
import type QuickBooks from "node-quickbooks";

/**
 * Per-request context for the HTTP transport.
 *
 * This server is a stateless executor for a single QuickBooks company *per
 * request*: kan-do's MCP proxy injects the access token, realm id and (optional)
 * refresh token for the requesting org as HTTP headers on every call. Those
 * credentials are read once in the request handler (see index.ts) and carried
 * through async execution here so that the QuickBooks client can pick them up
 * without threading them through every tool handler.
 *
 * Each request runs in its own store, so one tenant's credentials (or built
 * QuickBooks instance) can never bleed into another's request.
 */
export type QboCredentials = {
  accessToken: string;
  realmId: string;
  refreshToken?: string;
};

type RequestContext = {
  credentials?: QboCredentials;
  // Populated by quickbooksClient.authenticate(); read by getQuickbooks().
  quickbooks?: QuickBooks;
};

const storage = new AsyncLocalStorage<RequestContext>();

/** Run `fn` with the given per-request credentials in scope. */
export function runWithRequestContext<T>(credentials: QboCredentials | undefined, fn: () => T): T {
  return storage.run({ credentials }, fn);
}

/** The credentials supplied for the current request, if any. */
export function getRequestCredentials(): QboCredentials | undefined {
  return storage.getStore()?.credentials;
}

/** The mutable store for the current request (used to stash the built client). */
export function getRequestStore(): RequestContext | undefined {
  return storage.getStore();
}
