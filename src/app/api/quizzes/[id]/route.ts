import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";
import type { Quiz } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const db = await readDb();
  for (const venue of db.venues) {
    const quiz = venue.quizzes.find((q: Quiz) => q.id === id);
    if (quiz) {
      if (body.date) quiz.date = body.date;
      if (body.results) quiz.results = body.results.map((r: any) => ({
        teamName: String(r.teamName).trim(),
        score: Number(r.score),
        ...(r.rounds ? { rounds: r.rounds } : {}),
        ...(r.rozstrel !== undefined && r.rozstrel !== 0 ? { rozstrel: r.rozstrel } : {}),
      }));
      venue.quizzes.sort((a: Quiz, b: Quiz) => new Date(b.date).getTime() - new Date(a.date).getTime());
      await writeDb(db);
      return NextResponse.json(quiz);
    }
  }
  return NextResponse.json({ error: "nf" }, { status: 404 });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id } = await params;
  const db = await readDb();
  for (const venue of db.venues) {
    const i = venue.quizzes.findIndex((q: Quiz) => q.id === id);
    if (i >= 0) { venue.quizzes.splice(i, 1); await writeDb(db); return NextResponse.json({ ok: true }); }
  }
  return NextResponse.json({ error: "nf" }, { status: 404 });
}
