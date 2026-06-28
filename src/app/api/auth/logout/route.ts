import{NextResponse}from"next/server";import{ADMIN_COOKIE}from"@/lib/auth";
export async function POST(){const r=NextResponse.json({ok:true});r.cookies.set(ADMIN_COOKIE,"",{httpOnly:true,sameSite:"lax",path:"/",maxAge:0});return r;}
