import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Singleton pattern for Next.js
declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

function getPool() {
  if (process.env.STUB_MODE === "true") {
    // Return null in stub mode — DB calls should be guarded
    return null;
  }
  if (!globalThis._mysqlPool) {
    globalThis._mysqlPool = mysql.createPool({
      uri: process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: true },
    });
  }
  return globalThis._mysqlPool;
}

export function getDb() {
  const pool = getPool();
  if (!pool) return null;
  return drizzle(pool, { schema, mode: "default" });
}

export type DB = NonNullable<ReturnType<typeof getDb>>;
export { schema };
