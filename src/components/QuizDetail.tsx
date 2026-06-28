"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Quiz, TeamResult, Venue } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { sortResultsByScore } from "@/lib/utils";
import { quizLeaguePoints } from "@/lib/league";

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

interface EditRow { teamName: string; rounds: [string,string,string,string]; }
interface Props { venue: Venue; quiz: Quiz; isAdmin: boolean; }

function toEditRow(r: TeamResult): EditRow {
  return {
    teamName: r.teamName,
    rounds: r.rounds ? r.rounds.map(String) as [string,string,string,string] : ["","","",""],
  };
}

export function QuizDetail({ venue, quiz: initialQuiz, isAdmin }: Props) {
  const knownTeams = Array.from(new Set(venue.quizzes.flatMap(q => (q.results ?? []).map((r: TeamResult) => r.teamName))));
  const [suggestions, setSuggestions] = useState<{idx:number;list:string[]}|null>(null);
  const [activeSug, setActiveSug] = useState(0);
  function getMatches(val: string) {
    if (!val.trim()) return [];
    const lower = val.toLowerCase();
    return knownTeams.filter(t => t.toLowerCase().startsWith(lower) && t.toLowerCase() !== lower);
  }
  function onEditNameChange(i: number, val: string) {
    setEditRows(p => p.map((r,j) => j===i ? {...r, teamName:val} : r));
    const list = getMatches(val);
    setSuggestions(list.length ? {idx:i,list} : null);
    setActiveSug(0);
  }
  function selectEditSuggestion(i: number, name: string) {
    setEditRows(p => p.map((r,j) => j===i ? {...r, teamName:name} : r));
    setSuggestions(null);
  }
  function onEditNameKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions || suggestions.idx !== i) return;
    const len = suggestions.list.length;
    if (e.key === "ArrowDown" || e.key === "Tab") {
      e.preventDefault();
      const next = (activeSug+1) % len;
      setActiveSug(next);
      setEditRows(p => p.map((r,j) => j===i ? {...r, teamName:suggestions.list[next]} : r));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (activeSug-1+len) % len;
      setActiveSug(prev);
      setEditRows(p => p.map((r,j) => j===i ? {...r, teamName:suggestions.list[prev]} : r));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectEditSuggestion(i, suggestions.list[activeSug]);
    } else if (e.key === "Escape") {
      setSuggestions(null);
    }
  }
  const [quiz, setQuiz] = useState(initialQuiz);
  const [editing, setEditing] = useState(false);
  const [editDate, setEditDate] = useState(quiz.date);
  const [editRows, setEditRows] = useState<EditRow[]>([]);
  const roundRefs = useRef<(HTMLInputElement|null)[][]>([]);

  const sorted = sortResultsByScore(quiz.results);
  const pts = quizLeaguePoints(quiz.results);

  const totals = useMemo(() =>
    editRows.map(r => Math.round(r.rounds.reduce((s, v) => s + parseNum(v), 0) * 10) / 10),
  [editRows]);

  function startEdit() {
    setEditDate(quiz.date);
    setEditRows(quiz.results.map(toEditRow));
    setEditing(true);
  }

  async function saveEdit() {
    const results: TeamResult[] = editRows
      .filter(r => r.teamName.trim())
      .map((r, i) => ({
        teamName: r.teamName.trim(),
        score: totals[i],
        rounds: r.rounds.map(parseNum) as [number,number,number,number],
      }));
    const res = await fetch(`/liga/api/quizzes/${quiz.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: editDate, results }),
    });
    if (res.ok) { setQuiz(await res.json()); setEditing(false); }
  }

  async function deleteQuiz() {
    if (!confirm("Naozaj odstrániť kvíz?")) return;
    const res = await fetch(`/liga/api/quizzes/${quiz.id}`, { method: "DELETE" });
    if (res.ok) location.href = `/liga/podnik/${venue.id}`;
  }

  function onRoundChange(i: number, ri: number, val: string) {
    setEditRows(p => p.map((r,j) => {
      if (j !== i) return r;
      const rounds = [...r.rounds] as [string,string,string,string];
      rounds[ri] = val.replace(",",".");
      return { ...r, rounds };
    }));
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <Link href={`/podnik/${venue.id}`} className="text-sm text-white/70 hover:text-white">← {venue.name}</Link>
        <h1 className="text-2xl font-bold">Upraviť kvíz</h1>
        <div className="rounded-xl border border-[#555555] bg-[#3d3d3d] p-4 space-y-3">
          <CalendarPicker value={editDate} onChange={setEditDate} />

          <div className="flex gap-1.5 text-xs text-white/70 mt-2">
            <div className="flex-1 min-w-0">Tím</div>
            {["Kolo 1","Kolo 2","Kolo 3","Kolo 4"].map(k => (
              <div key={k} className="w-14 text-center shrink-0">{k}</div>
            ))}
            <div className="w-16 text-center shrink-0 text-[#ffbf0b]">Celkovo</div>
            <div className="w-6 shrink-0" />
          </div>

          {editRows.map((r, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <div className="relative flex-1 min-w-0">
                <input className="w-full rounded-lg bg-[#333333] border border-[#666666] p-2 text-sm"
                  placeholder="Tím" value={r.teamName} autoComplete="off"
                  onChange={e => onEditNameChange(i, e.target.value)}
                  onKeyDown={e => onEditNameKeyDown(i, e)}
                  onBlur={() => setTimeout(() => setSuggestions(null), 150)} />
                {suggestions?.idx === i && suggestions.list.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-[#555555] bg-[#3d3d3d] shadow-lg overflow-hidden">
                    {suggestions.list.map((name, si) => (
                      <li key={name} onMouseDown={() => selectEditSuggestion(i, name)}
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
              <button type="button" onClick={() => setEditRows(p => p.filter((_,j) => j!==i))}
                className="w-6 shrink-0 text-red-400 hover:text-red-300 text-lg leading-none">×</button>
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setEditRows(p => [...p, {teamName:"",rounds:["","","",""]}])}
              className="rounded-lg border border-[#666666] px-3 py-1.5 text-sm hover:bg-[#454545]">+ Tím</button>
            <button type="button" onClick={saveEdit}
              className="rounded-lg bg-[#ffbf0b] text-[#333333] font-bold px-4 py-2 text-sm hover:bg-[#ffd040]">Uložiť</button>
            <button type="button" onClick={() => setEditing(false)}
              className="rounded-lg border border-[#666666] px-4 py-2 text-sm hover:bg-[#454545]">Zrušiť</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href={`/podnik/${venue.id}`} className="text-sm text-white/70 hover:text-white">← {venue.name}</Link>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{formatDate(quiz.date)}</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <Link href={"/podnik/" + venue.id + "/kviz/" + quiz.id + "/prezentacia"}
              style={{backgroundColor:"#ffbf0b",color:"#1a1a1a"}}
              className="rounded-lg px-3 py-1.5 text-sm font-bold hover:opacity-80 transition-opacity">
              Prezentácia
            </Link>
            <button type="button" onClick={startEdit}
              className="rounded-lg border border-[#666666] px-3 py-1.5 text-sm hover:bg-[#454545]">Upraviť</button>
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border border-[#555555]">
        <table className="w-full">
          <thead className="bg-[#3d3d3d] text-xs uppercase text-white/70">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Tím</th>
              <th className="p-3 text-left">Body</th>
              <th className="p-3 text-left">Liga +</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => (
              <tr key={t.teamName} className="border-t border-[#555555]">
                <td className="p-3">{i+1}</td>
                <td className="p-3 font-medium">{t.teamName}</td>
                <td className="p-3">{t.score}</td>
                <td className="p-3 font-bold text-[#ffbf0b]">+{pts.get(t.teamName) ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isAdmin && (
        <button type="button" onClick={deleteQuiz}
          className="rounded-lg border border-red-500 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">
          Odstrániť kvíz
        </button>
      )}
    </div>
  );
}
