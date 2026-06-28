"use client";
export function LogoutButton(){return<button type="button" className="text-white/70 hover:text-white" onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});location.href="/";}}>Odhlásiť</button>;}
