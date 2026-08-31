import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Agent, fetch as undiciFetch } from "undici";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured");

const databaseUrl = new URL(connectionString);
databaseUrl.searchParams.delete("channel_binding");
const ipv4Agent = new Agent({ connect: { family: 4 } });
neonConfig.fetchFunction = async (...args: Parameters<typeof fetch>) =>
  (await undiciFetch(args[0] as Parameters<typeof undiciFetch>[0], {
    ...(args[1] as Parameters<typeof undiciFetch>[1]),
    dispatcher: ipv4Agent,
  })) as unknown as Response;

export const sql = neon(databaseUrl.toString());
export const db = drizzle(sql, { schema });
