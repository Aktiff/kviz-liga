import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";
import type { Venue } from "@/lib/types";

export async function GET() {
  return NextResponse.json((await readDb()).venues);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { name } = await req.json();
  const db = await readDb();
  const v: Venue = { id: crypto.randomUUID(), name: name.trim(), quizzes: [] };
  db.venues.push(v);
  await writeDb(db);
  return NextResponse.json(v);
}
