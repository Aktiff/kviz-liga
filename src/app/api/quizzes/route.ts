import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";
import type { Venue, Quiz } from "@/lib/types";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { venueId, date, results } = await req.json();
  const db = await readDb();
  const v = db.venues.find((x: Venue) => x.id === venueId);
  if (!v) return NextResponse.json({ error: "nf" }, { status: 404 });
  const q: Quiz = { id: crypto.randomUUID(), date, results };
  v.quizzes.push(q);
  v.quizzes.sort((a: Quiz, b: Quiz) => new Date(b.date).getTime() - new Date(a.date).getTime());
  await writeDb(db);
  return NextResponse.json(q);
}
