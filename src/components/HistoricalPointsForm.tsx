"use client";
import { useState } from "react";
import type { Venue } from "@/lib/types";

interface Row { teamName: string; points: string; quizzes: string; }
interface Props { venue: Venue; onSaved: (v: Venue) => void; }

function toRows(hist?: Record<string, {points:number;quizzes:number}>): Row[] {
  if (!hist) return [];
  return Object.entries(hist).map(([teamName, {points, quizzes}]) => ({
    teamName, points: String(points), quizzes: String(quizzes),
  }));
}

export function HistoricalPointsForm({ venue, onSaved }: Props) {
  const [rows, setRows] = useState<Row[]>(() => toRows(venue.historical));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const historical: Record<string, {points:number;quizzes:number}> = {};
    for (const row of rows) {
      if (row.teamName.trim()) {
        historical[row.teamName.trim()] = {
          points: parseInt(row.points) || 0,
          quizzes: parseInt(row.quizzes) || 0,
        };
      }
    }
    const res = await fetch(`/liga/api/venues/${venue.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ historical }),
    });
    setSaving(false);
    if (res.ok) onSaved(await res.json());
  }

  return (
    <div className="rounded-xl border border-[#ffbf0b]/30 bg-[#3d3d3d] p-4 space-y-3">
      <div>
        <h3 className="font-medium text-[#ffbf0b]">Historické body (stará sezóna)</h3>
        <p className="text-xs text-white/70 mt-0.5">Zadaj body a počet kvízov z predchádzajúcej sezóny. Pridajú sa k novým.</p>
      </div>
      <div className="flex gap-2 text-xs text-white/70">
        <div className="flex-1">Tím</div>
        <div className="w-24 text-center">Body</div>
        <div className="w-24 text-center">Kvízy</div>
        <div className="w-6" />
      </div>
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input className="flex-1 rounded-lg bg-[#333333] border border-[#666666] p-2 text-sm"
            placeholder="Tím" value={row.teamName}
            onChange={e => setRows(p => p.map((r,j) => j===i ? {...r, teamName:e.target.value} : r))} />
          <input className="w-24 rounded-lg bg-[#333333] border border-[#666666] p-2 text-sm text-center"
            type="number" min="0" placeholder="0" value={row.points}
            onChange={e => setRows(p => p.map((r,j) => j===i ? {...r, points:e.target.value} : r))} />
          <input className="w-24 rounded-lg bg-[#333333] border border-[#666666] p-2 text-sm text-center"
            type="number" min="0" placeholder="0" value={row.quizzes}
            onChange={e => setRows(p => p.map((r,j) => j===i ? {...r, quizzes:e.target.value} : r))} />
          <button type="button" onClick={() => setRows(p => p.filter((_,j) => j!==i))}
            className="w-6 text-red-400 hover:text-red-300 text-lg leading-none">×</button>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={() => setRows(p => [...p, {teamName:"",points:"",quizzes:""}])}
          className="rounded-lg border border-[#666666] px-3 py-1.5 text-sm hover:bg-[#454545]">+ Tím</button>
        <button type="button" onClick={save} disabled={saving}
          className="rounded-lg bg-[#ffbf0b] text-[#333333] font-bold px-4 py-2 text-sm hover:bg-[#ffd040] disabled:opacity-50">
          {saving ? "Ukladám..." : "Uložiť históriu"}
        </button>
      </div>
    </div>
  );
}
