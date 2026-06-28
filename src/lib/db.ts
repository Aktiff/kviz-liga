import type { Database } from "./types";

const isVercel = !!process.env.UPSTASH_REDIS_REST_URL;

async function readDbFile(): Promise<Database> {
  const { readFile } = await import("fs/promises");
  const { join } = await import("path");
  return JSON.parse(await readFile(join(process.cwd(), "data", "db.json"), "utf8"));
}

async function writeDbFile(db: Database): Promise<void> {
  const { writeFile } = await import("fs/promises");
  const { join } = await import("path");
  await writeFile(join(process.cwd(), "data", "db.json"), JSON.stringify(db, null, 2), "utf8");
}

export async function readDb(): Promise<Database> {
  if (!isVercel) return readDbFile();
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  return (await redis.get<Database>("kviz-db")) ?? { venues: [] };
}

export async function writeDb(db: Database): Promise<void> {
  if (!isVercel) return writeDbFile(db);
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  await redis.set("kviz-db", db);
}
