import { computeLeague } from "@/lib/league";
import type { Quiz } from "@/lib/types";

interface HistEntry { points: number; quizzes: number; }
interface Props {
  quizzes: Quiz[];
  historical?: Record<string, HistEntry>;
}

export function LeagueTable({ quizzes, historical }: Props) {
  const computed = computeLeague(quizzes);
  const allTeams = new Set([
    ...computed.map(e => e.teamName),
    ...Object.keys(historical ?? {}),
  ]);
  const entries = Array.from(allTeams).map(teamName => {
    const comp = computed.find(e => e.teamName === teamName);
    const hist = historical?.[teamName];
    return {
      teamName,
      points: (comp?.points ?? 0) + (hist?.points ?? 0),
      quizzesPlayed: (comp?.quizzesPlayed ?? 0) + (hist?.quizzes ?? 0),
    };
  }).sort((a, b) => b.points - a.points || b.quizzesPlayed - a.quizzesPlayed);

  if (!entries.length) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Ligová tabuľka</h2>
      <div className="overflow-hidden rounded-xl border border-[#555555]">
        <table className="w-full">
          <thead className="bg-[#3d3d3d] text-xs uppercase text-white/70">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Tím</th>
              <th className="p-3 text-left">Body</th>
              <th className="p-3 text-left">Kvízy</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.teamName} className="border-t border-[#555555]">
                <td className="p-3 text-white/70">{i + 1}</td>
                <td className="p-3 font-medium">{e.teamName}</td>
                <td className="p-3 font-bold text-[#ffbf0b]">{e.points}</td>
                <td className="p-3 text-white/70">{e.quizzesPlayed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
