import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";
import type { Venue } from "@/lib/types";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id } = await params;
  const db = await readDb();
  const i = db.venues.findIndex((v: Venue) => v.id === id);
  if (i < 0) return NextResponse.json({ error: "nf" }, { status: 404 });
  db.venues.splice(i, 1);
  await writeDb(db);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const db = await readDb();
  const venue = db.venues.find((v: Venue) => v.id === id);
  if (!venue) return NextResponse.json({ error: "nf" }, { status: 404 });
  if (body.historical !== undefined) venue.historical = body.historical;
  await writeDb(db);
  return NextResponse.json(venue);
}
