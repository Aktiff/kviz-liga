import type { Metadata } from "next";
import "./globals.css";
import { isAdmin } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kviz Liga",
  description: "Ligova tabulka kvizov",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  return (
    <html lang="sk">
      <body>
        <header style={{borderBottom:"1px solid #555555", backgroundColor:"#333333"}} className="sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" style={{color:"#ffbf0b"}} className="text-xl font-black tracking-tight hover:opacity-80 transition-opacity">MUDRC KVÍZ</Link>
            <div className="flex items-center gap-3">
              {admin ? (
                <>
                  <span style={{color:"#ffbf0b"}} className="text-xs font-bold uppercase tracking-widest">Admin</span>
                  <LogoutButton />
                </>
              ) : (
                <Link href="/admin"
                  style={{color:"#aaaaaa"}}
                  className="text-sm hover:text-white transition-colors">
                  Prihlásiť
                </Link>
              )}
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
