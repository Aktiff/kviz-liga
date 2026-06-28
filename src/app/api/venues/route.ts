import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { Venue } from "@/lib/types";

export async function GET() {
  return NextResponse.json((await readDb()).venues);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { name } = await req.json();
  const db = await readDb();
  const trimmed = name.trim();
  let slug = slugify(trimmed);
  const existing = db.venues.map((v: Venue) => v.id);
  let counter = 2;
  const base = slug;
  while (existing.includes(slug)) { slug = base + "-" + counter++; }
  const v: Venue = { id: slug, name: trimmed, quizzes: [] };
  db.venues.push(v);
  await writeDb(db);
  return NextResponse.json(v);
}
