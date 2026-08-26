import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const databaseUrl = new URL(connectionString);
// Neon HTTP uses TLS directly; libpq channel binding makes fetch connections flaky.
databaseUrl.searchParams.delete("channel_binding");

const sql = neon(databaseUrl.toString(), {
  fetchOptions: { cache: "no-store" },
});

export const db = drizzle(sql, { schema });
