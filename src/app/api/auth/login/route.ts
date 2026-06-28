import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!checkPassword(password)) return NextResponse.json({ error: "bad" }, { status: 401 });
  const r = NextResponse.json({ ok: true });
  r.cookies.set(ADMIN_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 2592000 });
  return r;
}
