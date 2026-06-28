"use client";
export function LogoutButton(){return<button type="button" className="text-white/70 hover:text-white" onClick={async()=>{await fetch("/liga/api/auth/logout",{method:"POST"});location.href="/liga";}}>Odhlásiť</button>;}
