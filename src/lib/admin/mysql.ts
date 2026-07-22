import "server-only";

/**
 * Server-only re-export shim. The MySQL backend now lives under ./db/* as a
 * fully normalized schema (one table per section). This file keeps store.ts's
 * import path (`./mysql`) stable and enforces the server/client boundary for
 * the app; the standalone migration script imports ./db/* directly under Node.
 */
export { mysqlConfigured, dbReadDoc, dbWriteDoc } from "./db/index.ts";
