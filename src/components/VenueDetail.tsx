"use client";
import { useState } from "react";
import Link from "next/link";
import type { Quiz, Venue } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { getWinner } from "@/lib/league";
import { AddQuizForm } from "@/components/AddQuizForm";
import { LeagueTable } from "@/components/LeagueTable";
import { HistoricalPointsForm } from "@/components/HistoricalPointsForm";

interface Props { venue: Venue; isAdmin: boolean; }

export function VenueDetail({ venue: initialVenue, isAdmin }: Props) {
  const [venue, setVenue] = useState(initialVenue);
  const [showAll, setShowAll] = useState(false);
  const [showHistorical, setShowHistorical] = useState(false);

  const quizzes = venue.quizzes;
  const shown = showAll ? quizzes : quizzes.slice(0, 3);
  const knownTeams = Array.from(new Set(quizzes.flatMap(q => (q.results ?? []).map(r => r.teamName))));

  function onAdded(q: Quiz) {
    setVenue(v => ({ ...v, quizzes: [q, ...v.quizzes] }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{venue.name}</h1>
        <Link href="/" className="text-sm text-white/70 hover:text-white">← Podniky</Link>
      </div>

      <div className="space-y-2">
        {shown.length === 0 && <p className="text-white/70 text-sm">Zatiaľ žiadne kvízy.</p>}
        {shown.map(q => {
          const w = getWinner(q);
          return (
            <Link key={q.id} href={`/podnik/${venue.id}/kviz/${q.id}`}
              className="block rounded-xl border border-[#555555] bg-[#3d3d3d] p-4 hover:border-[#ffbf0b]/60 transition-colors">
              <span className="font-medium">{formatDate(q.date)}</span>
              {w && <span className="text-white/70 ml-2">– víťaz {w.teamName} {w.score} bodov</span>}
            </Link>
          );
        })}
        {quizzes.length > 3 && !showAll && (
          <button onClick={() => setShowAll(true)}
            className="text-sm text-[#ffbf0b] hover:text-[#ffd040] py-1">
            Zobraziť viac ({quizzes.length - 3} ďalších) ↓
          </button>
        )}
      </div>

      {isAdmin && (
        <AddQuizForm venueId={venue.id} knownTeams={knownTeams} onAdded={onAdded} />
      )}

      <div className="space-y-3">
        {isAdmin && (
          <button onClick={() => setShowHistorical(h => !h)}
            className="rounded-lg border border-[#ffbf0b]/30 px-3 py-1.5 text-sm text-[#ffbf0b] hover:bg-[#ffbf0b]/10">
            {showHistorical ? "Zavrieť históriu" : "✦ Doplniť historické body"}
          </button>
        )}
        {showHistorical && isAdmin && (
          <HistoricalPointsForm
            venue={venue}
            onSaved={updated => { setVenue(updated); setShowHistorical(false); }}
          />
        )}
        <LeagueTable quizzes={venue.quizzes} historical={venue.historical} />
      </div>
    </div>
  );
}
