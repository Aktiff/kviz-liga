"use client";
import React, { useState } from "react";
import type { Quiz, TeamResult } from "@/lib/types";
interface Group { place: number; teams: TeamResult[]; }
function buildGroups(results: TeamResult[]): Group[] {
  if (!results.length) return [];
  const sorted = [...results].sort((a, b) => b.score - a.score);
  const groups: Group[] = []; let place = 1;
  for (const t of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.teams[0].score === t.score) last.teams.push(t);
    else groups.push({ place, teams: [t] });
    place++;
  }
  return groups.reverse();
}
function fmt(n: number) { return Number.isInteger(n) ? String(n) : n.toFixed(1); }
interface Props { quiz: Quiz; venueId: string; isAdmin: boolean; }
export function QuizPresentation({ quiz: initialQuiz, venueId, isAdmin }: Props) {
  const [results, setResults] = useState<TeamResult[]>(initialQuiz.results);
  const [groups] = useState(() => buildGroups(initialQuiz.results));
  const [revealed, setRevealed] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);
  const [showRounds, setShowRounds] = useState(false);
  const hasRoundsData = initialQuiz.results.some(r => r.rounds && r.rounds.some(v => v));
  function getScore(name: string) { return results.find(r => r.teamName === name)?.score ?? 0; }
  function getRounds(name: string) { return results.find(r => r.teamName === name)?.rounds; }
  function getOrigRoz(name: string) { return initialQuiz.results.find(r => r.teamName === name)?.rozstrel; }
  function getInitScore(name: string) { return initialQuiz.results.find(r => r.teamName === name)?.score ?? 0; }
  async function giveBonus(teamName: string) {
    setLoading(teamName);
    const newResults = results.map(r => r.teamName === teamName ? { ...r, score: Math.round((r.score + 0.1) * 10) / 10 } : r);
    setResults(newResults);
    await fetch("/api/quizzes/" + initialQuiz.id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ results: newResults }) });
    setLoading(null);
  }
  const hasMore = revealed < groups.length;
  const revealedGroups = [...groups.slice(0, revealed)].reverse();
  const totalTeams = revealedGroups.reduce((s, g) => s + g.teams.length, 0);
  const latSize = totalTeams <= 2 ? "52px" : totalTeams <= 4 ? "40px" : totalTeams <= 6 ? "30px" : "24px";
  const prevSize = totalTeams <= 4 ? "22px" : totalTeams <= 6 ? "18px" : "15px";
  const latPadV = totalTeams <= 2 ? "28px" : totalTeams <= 4 ? "20px" : "14px";
  const prevPadV = totalTeams <= 5 ? "12px" : "8px";
  const colsRounds = showRounds ? "80px 1fr 150px 150px 150px 150px 160px 170px" + (isAdmin ? " 120px" : "") : "80px 1fr 170px" + (isAdmin ? " 120px" : "");
  const altColors = ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"];
  function mkTd(isLatest: boolean, isWinner: boolean, altBg: string, justify: React.CSSProperties["justifyContent"] = "flex-start", extra: React.CSSProperties = {}): React.CSSProperties {
    const bg = isLatest ? (isWinner ? "rgba(255,191,11,0.10)" : "rgba(255,255,255,0.06)") : altBg;
    const border = isLatest ? (isWinner ? "2px solid #ffbf0b" : "2px solid rgba(255,255,255,0.22)") : "2px solid transparent";
    return { backgroundColor: bg, borderTop: border, borderBottom: border, padding: latPadV + " 20px", display: "flex", alignItems: "center", justifyContent: justify, ...extra };
  }
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "#111", display: "flex", flexDirection: "column", zIndex: 9999, overflow: "hidden", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <a href={"/podnik/" + venueId + "/kviz/" + initialQuiz.id} style={{ color: "rgba(255,255,255,0.25)", fontSize: "16px", textDecoration: "none" }}>← Späť</a>
        <span style={{ color: "#ffbf0b", fontWeight: 900, fontSize: "26px" }}>MUDRC KVÍZ</span>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {hasRoundsData && <button onClick={() => setShowRounds(s => !s)} style={{ background: showRounds ? "#ffbf0b" : "none", cursor: "pointer", padding: "8px 20px", borderRadius: "10px", border: "2px solid #ffbf0b", color: showRounds ? "#111" : "#ffbf0b", fontSize: "15px", fontWeight: 800 }}>{showRounds ? "Skryť kolá" : "Zobraziť kolá"}</button>}
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "16px", fontFamily: "monospace" }}>{revealed}/{groups.length}</span>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: revealed === 0 ? "center" : "flex-start", padding: "32px 48px 16px", overflow: "hidden" }}>
        {revealed === 0 ? (
          <div style={{ textAlign: "center" }}><div style={{ fontSize: "120px" }}>🎯</div></div>
        ) : (
          <div style={{ width: "100%" }}>
            {showRounds && (
              <div style={{ display: "grid", gridTemplateColumns: colsRounds, marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px" }}>
                <div style={{ padding: "8px 20px" }}>#</div><div style={{ padding: "8px 20px" }}>TÍM</div>
                <div style={{ padding: "8px 20px", display: "flex", justifyContent: "center" }}>K1</div>
                <div style={{ padding: "8px 20px", display: "flex", justifyContent: "center" }}>K2</div>
                <div style={{ padding: "8px 20px", display: "flex", justifyContent: "center" }}>K3</div>
                <div style={{ padding: "8px 20px", display: "flex", justifyContent: "center" }}>K4</div>
                <div style={{ padding: "8px 20px", display: "flex", justifyContent: "center" }}>ROZSTREL</div>
                <div style={{ padding: "8px 20px", display: "flex", justifyContent: "flex-end" }}>BODY</div>
                {isAdmin && <div />}
              </div>
            )}
            {revealedGroups.map((group, idx) => {
              const isLatest = idx === 0;
              const isTied = group.teams.length > 1;
              const isWinner = group.place === 1;
              const sortedTeams = [...group.teams].sort((a, b) => getScore(b.teamName) - getScore(a.teamName));
              return (
                <div key={group.place} style={{ display: "grid", gridTemplateColumns: colsRounds, marginBottom: "6px", borderRadius: "14px", overflow: "hidden" }}>
                  {sortedTeams.map((team, ti) => {
                    const score = getScore(team.teamName);
                    const initScore = getInitScore(team.teamName);
                    const bonus = Math.round((score - initScore) * 10) / 10;
                    const rounds = getRounds(team.teamName);
                    const origRoz = getOrigRoz(team.teamName);
                    const rozDisplay = bonus > 0 ? "+" + fmt(bonus) : (origRoz && origRoz > 0 ? "+" + origRoz : "–");
                    const teamPlace = group.place + ti;
                    const sz = latSize;
                    const altBg = altColors[idx % 2];
                    const borderSide = isLatest ? (isWinner ? "2px solid #ffbf0b" : "2px solid rgba(255,255,255,0.22)") : "2px solid transparent";
                    const td = mkTd(isLatest, isWinner, altBg, "center");
                    const tdL = mkTd(isLatest, isWinner, altBg, "flex-start", { borderLeft: borderSide, borderTopLeftRadius: "14px", borderBottomLeftRadius: "14px" });
                    const tdR = mkTd(isLatest, isWinner, altBg, "flex-end", { borderRight: borderSide, borderTopRightRadius: !isAdmin ? "14px" : "0", borderBottomRightRadius: !isAdmin ? "14px" : "0" });
                    const tdA = mkTd(isLatest, isWinner, altBg, "center", { borderRight: borderSide, borderTopRightRadius: "14px", borderBottomRightRadius: "14px" });
                    return (
                      <React.Fragment key={team.teamName}>
                        <div style={tdL}><span style={{ color: "#ffbf0b", fontWeight: 900, fontSize: sz }}>{teamPlace}.</span></div>
                        <div style={td}><span style={{ color: "white", fontWeight: 800, fontSize: sz, lineHeight: 1.1 }}>{isWinner && isLatest ? "🏆 " : ""}{team.teamName}</span></div>
                        {showRounds && (rounds && rounds.length > 0 ? <>
                          {rounds.map((rv, ri) => <div key={ri} style={{ ...td, textAlign: "center" }}><span style={{ color: "white", fontWeight: 700, fontSize: sz }}>{rv || "–"}</span></div>)}
                          <div style={{ ...td, textAlign: "center" }}><span style={{ color: bonus > 0 ? "#ffbf0b" : "white", fontWeight: 700, fontSize: sz }}>{rozDisplay}</span></div>
                        </> : <>
                          {[0,1,2,3].map(i => <div key={i} style={{ ...td, textAlign: "center" }}><span style={{ color: "rgba(255,255,255,0.25)", fontSize: sz }}>–</span></div>)}
                          <div style={{ ...td, textAlign: "center" }}><span style={{ color: "rgba(255,255,255,0.25)", fontSize: sz }}>–</span></div>
                        </>)}
                        <div style={isAdmin ? td : tdR}><span style={{ color: "#ffbf0b", fontWeight: 900, fontSize: sz }}>{fmt(score)}</span></div>
                        {isAdmin && <div style={tdA}>{isLatest && isTied && <button onClick={() => giveBonus(team.teamName)} disabled={!!loading} style={{ backgroundColor: "#ffbf0b", color: "#111", border: "none", cursor: "pointer", padding: "8px 14px", borderRadius: "8px", fontWeight: 900, fontSize: "18px", opacity: loading ? 0.5 : 1 }}>{loading === team.teamName ? "…" : "+0.1"}</button>}</div>}
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ padding: "20px 48px 32px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
        {hasMore ? (
          <button onClick={() => setRevealed(r => r + 1)} style={{ backgroundColor: "#ffbf0b", color: "#111", border: "none", cursor: "pointer", padding: "24px 120px", borderRadius: "20px", fontSize: "32px", fontWeight: 900 }}>
            {revealed === 0 ? "Štart →" : revealed === groups.length - 1 ? "🏆 Zobraziť víťaza!" : "Ďalší →"}
          </button>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#ffbf0b", fontSize: "44px", fontWeight: 900 }}>Gratulujeme! 🎉</div>
            <a href={"/podnik/" + venueId + "/kviz/" + initialQuiz.id} style={{ color: "rgba(255,255,255,0.35)", fontSize: "18px", textDecoration: "none", display: "block", marginTop: "12px" }}>Zavrieť prezentáciu</a>
          </div>
        )}
      </div>
    </div>
  );
}
