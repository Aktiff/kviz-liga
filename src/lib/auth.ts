import{cookies}from"next/headers";
const C="kviz_admin";
export async function isAdmin(){return(await cookies()).get(C)?.value==="1";}
export function checkPassword(pw:string){return pw===process.env.ADMIN_PASSWORD;}
export const ADMIN_COOKIE=C;
