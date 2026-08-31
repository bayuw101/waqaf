import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Agent, fetch as undiciFetch } from "undici";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const databaseUrl = new URL(connectionString);
// Neon HTTP uses TLS directly; libpq channel binding makes fetch connections flaky.
databaseUrl.searchParams.delete("channel_binding");

const ipv4Agent = new Agent({ connect: { family: 4 } });

neonConfig.fetchFunction = async (...args: Parameters<typeof fetch>) => {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return (await undiciFetch(args[0] as Parameters<typeof undiciFetch>[0], {
        ...(args[1] as Parameters<typeof undiciFetch>[1]),
        dispatcher: ipv4Agent,
      })) as unknown as Response;
    } catch (error) {
      lastError = error;
      if (attempt < 2)
        await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** attempt));
    }
  }
  throw lastError;
};

const sql = neon(databaseUrl.toString(), {
  fetchOptions: { cache: "no-store" },
});

export const db = drizzle(sql, { schema });
