"use client";
import { useState } from "react";
import Link from "next/link";
import type { Venue } from "@/lib/types";

export function VenueList({ venues: init, isAdmin }: { venues: Venue[]; isAdmin: boolean }) {
  const [venues, setVenues] = useState(init);
  const [name, setName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function add() {
    if (!name.trim()) return;
    const res = await fetch("/api/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const v = await res.json();
      setVenues(p => [...p, v]);
      setName("");
    }
  }

  async function del(id: string) {
    const res = await fetch(`/api/venues/${id}`, { method: "DELETE" });
    if (res.ok) {
      setVenues(p => p.filter(v => v.id !== id));
      setConfirmId(null);
    }
  }

  return (
    <div className="space-y-3">
      {venues.length === 0 && <p className="text-white/70">Zatial ziadne podniky.</p>}
      {venues.map(v => (
        <div key={v.id} className="flex gap-2 items-stretch">
          <Link href={`/podnik/${v.id}`}
            className="flex-1 rounded-xl border border-[#555555] bg-[#3d3d3d] p-4 hover:border-[#ffbf0b] transition-colors">
            <div className="font-medium">{v.name}</div>
            <div className="text-sm text-white/70">{v.quizzes.length} kvizov</div>
          </Link>
          {isAdmin && (
            confirmId === v.id ? (
              <div className="flex flex-col gap-1 justify-center">
                <button onClick={() => del(v.id)}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-500 font-medium">
                  Zmazat!
                </button>
                <button onClick={() => setConfirmId(null)}
                  className="rounded-lg border border-[#666666] px-3 py-1.5 text-sm hover:bg-[#454545]">
                  Zrusit
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmId(v.id)}
                className="rounded-lg border border-red-800 px-3 text-red-600 hover:border-red-500 hover:text-red-400 transition-colors">
                X
              </button>
            )
          )}
        </div>
      ))}
      {isAdmin && (
        <div className="rounded-xl border border-[#555555] bg-[#3d3d3d] p-4 space-y-2">
          <input className="w-full rounded-lg bg-[#333333] border border-[#666666] p-2"
            placeholder="Nazov podniku" value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()} />
          <button onClick={add}
            className="rounded-lg bg-[#ffbf0b] text-[#333333] font-bold px-4 py-2 hover:bg-[#ffd040] transition-colors">
            Pridat
          </button>
        </div>
      )}
    </div>
  );
}
