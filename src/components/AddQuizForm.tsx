"use client";

import React, { useMemo, useRef, useState } from "react";
import type { Quiz, TeamResult } from "@/lib/types";

interface Row { teamName: string; rounds: [string,string,string,string]; }
interface Props { venueId: string; knownTeams: string[]; onAdded: (q: Quiz) => void; }

const MONTHS = ["Január","Február","Marec","Apríl","Máj","Jún","Júl","August","September","Október","November","December"];
const DAYS = ["Po","Ut","St","Št","Pi","So","Ne"];

function CalendarPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const parts = value ? value.split("-").map(Number) : [new Date().getFullYear(), new Date().getMonth()+1];
    return new Date(parts[0], parts[1]-1, 1);
  });
  const y = view.getFullYear(), m = view.getMonth();
  const daysCount = new Date(y, m+1, 0).getDate();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const cells: (number|null)[] = [...Array(offset).fill(null), ...Array.from({length:daysCount},(_,i)=>i+1)];
  while (cells.length % 7 !== 0) cells.push(null);
  function toStr(d: number) { return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }
  function display() { if (!value) return "Vybrať dátum"; const [yr,mo,d]=value.split("-"); return `${d}.${mo}.${yr}`; }
  return (
    <div className="relative inline-block">
      <button type="button" onClick={() => setOpen(o=>!o)}
        className="rounded-lg bg-[#333333] border border-[#666666] px-3 py-2 min-w-36 hover:border-[#ffbf0b]/60">
        {display()}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 rounded-xl border border-[#666666] bg-[#3d3d3d] p-3 shadow-xl w-72">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => setView(new Date(y,m-1,1))} className="px-2 py-1 rounded hover:bg-[#454545] text-xl leading-none">‹</button>
            <span className="font-medium text-sm">{MONTHS[m]} {y}</span>
            <button type="button" onClick={() => setView(new Date(y,m+1,1))} className="px-2 py-1 rounded hover:bg-[#454545] text-xl leading-none">›</button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center text-sm">
            {DAYS.map(d => <div key={d} className="text-white/70 py-1 text-xs font-medium">{d}</div>)}
            {cells.map((d, i) => d == null ? <div key={i} /> : (
              <button key={i} type="button" onClick={() => { onChange(toStr(d)); setOpen(false); }}
                className={`rounded-lg py-1.5 text-sm ${toStr(d)===value ? "bg-[#ffbf0b] text-white font-bold" : "hover:bg-[#454545]"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function parseNum(s: string) { return parseFloat(s.replace(",",".")) || 0; }
function fmtNum(n: number) { return n === 0 ? "0" : (Number.isInteger(n) ? String(n) : n.toFixed(1)); }
function emptyRow(): Row { return { teamName:"", rounds:["","","",""] }; }

export function AddQuizForm({ venueId, knownTeams, onAdded }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [suggestions, setSuggestions] = useState<{idx:number;list:string[]}|null>(null);
  const [activeSug, setActiveSug] = useState(0);
  const roundRefs = useRef<(HTMLInputElement|null)[][]>([]);

  const totals = useMemo(() =>
    rows.map(r => Math.round(r.rounds.reduce((s: number, v: string) => s + parseNum(v), 0) * 10) / 10),
  [rows]);

  function getMatches(val: string) {
    if (!val.trim()) return [];
    const lower = val.toLowerCase();
    return knownTeams.filter(t => t.toLowerCase().startsWith(lower) && t.toLowerCase() !== lower);
  }

  function onNameChange(i: number, val: string) {
    setRows(p => p.map((r,j) => j===i ? {...r, teamName:val} : r));
    const list = getMatches(val);
    setSuggestions(list.length ? {idx:i,list} : null);
    setActiveSug(0);
  }

  function selectSuggestion(i: number, name: string) {
    setRows(p => p.map((r,j) => j===i ? {...r, teamName:name} : r));
    setSuggestions(null);
    roundRefs.current[i]?.[0]?.focus();
  }

  function onNameKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions || suggestions.idx !== i) return;
    const len = suggestions.list.length;
    if (e.key === "ArrowDown" || e.key === "Tab") {
      e.preventDefault();
      const next = (activeSug+1) % len;
      setActiveSug(next);
      setRows(p => p.map((r,j) => j===i ? {...r, teamName:suggestions.list[next]} : r));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (activeSug-1+len) % len;
      setActiveSug(prev);
      setRows(p => p.map((r,j) => j===i ? {...r, teamName:suggestions.list[prev]} : r));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectSuggestion(i, suggestions.list[activeSug]);
    } else if (e.key === "Escape") {
      setSuggestions(null);
    }
  }

  function onRoundChange(i: number, ri: number, val: string) {
    const v = val.replace(",",".");
    setRows(p => p.map((r,j) => {
      if (j !== i) return r;
      const rounds = [...r.rounds] as [string,string,string,string];
      rounds[ri] = v;
      return {...r, rounds};
    }));
  }

  async function submit() {
    const results: TeamResult[] = rows
      .filter(r => r.teamName.trim())
      .map((r, i) => ({ teamName: r.teamName.trim(), score: totals[i], rounds: r.rounds.map(parseNum) as [number,number,number,number] }));
    if (!results.length) return;
    const res = await fetch("/liga/api/quizzes", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({venueId,date,results})});
    if (res.ok) {
      onAdded(await res.json());
      setDate(new Date().toISOString().split("T")[0]);
      setRows([emptyRow(), emptyRow(), emptyRow()]);
    }
  }

  return (
    <div className="rounded-xl border border-[#555555] bg-[#3d3d3d] p-4 space-y-3">
      <h2 className="font-medium">Pridať kvíz</h2>
      <CalendarPicker value={date} onChange={setDate} />

      <div className="flex gap-1.5 text-xs text-white/70 mt-2">
        <div className="flex-1 min-w-0">Tím</div>
        {["Kolo 1","Kolo 2","Kolo 3","Kolo 4"].map(k => (
          <div key={k} className="w-14 text-center shrink-0">{k}</div>
        ))}
        <div className="w-16 text-center shrink-0 text-[#ffbf0b]">Celkovo</div>
        <div className="w-6 shrink-0" />
      </div>

      {rows.map((r, i) => (
        <div key={i} className="flex gap-1.5 items-center">
          <div className="relative flex-1 min-w-0">
            <input className="w-full rounded-lg bg-[#333333] border border-[#666666] p-2 text-sm"
              placeholder="Tím" value={r.teamName} autoComplete="off"
              onChange={e => onNameChange(i, e.target.value)}
              onKeyDown={e => onNameKeyDown(i, e)}
              onBlur={() => setTimeout(() => setSuggestions(null), 150)} />
            {suggestions?.idx === i && suggestions.list.length > 0 && (
              <ul className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-[#555555] bg-[#3d3d3d] shadow-lg overflow-hidden">
                {suggestions.list.map((name, si) => (
                  <li key={name} onMouseDown={() => selectSuggestion(i, name)}
                    className={"cursor-pointer px-3 py-2 text-sm " + (si===activeSug ? "bg-[#ffbf0b] text-[#333333] font-bold" : "hover:bg-[#454545]")}>
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {r.rounds.map((val, ri) => (
            <input key={ri}
              ref={el => { if (!roundRefs.current[i]) roundRefs.current[i]=[]; roundRefs.current[i][ri]=el; }}
              className="w-14 shrink-0 rounded-lg bg-[#333333] border border-[#666666] p-2 text-sm text-center"
              type="text" inputMode="decimal" placeholder="0" value={val}
              onChange={e => onRoundChange(i, ri, e.target.value)} />
          ))}
          <div className="w-16 shrink-0 text-center font-bold text-[#ffbf0b] text-sm">
            {r.rounds.some(v => v) ? fmtNum(totals[i]) : "–"}
          </div>
          <button type="button" onClick={() => setRows(p => p.filter((_,j) => j!==i))}
            className="w-6 shrink-0 text-red-400 hover:text-red-300 text-lg leading-none">×</button>
        </div>
      ))}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={() => setRows(p => [...p, emptyRow()])}
          className="rounded-lg border border-[#666666] px-3 py-1.5 text-sm hover:bg-[#454545]">+ Tím</button>
        <button type="button" onClick={submit}
          className="rounded-lg bg-[#ffbf0b] text-[#333333] font-bold px-4 py-2 text-sm hover:bg-[#ffd040]">Pridať kvíz</button>
      </div>
    </div>
  );
}
