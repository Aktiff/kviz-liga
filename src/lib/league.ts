import { sortResultsByScore } from "./utils";
import type { Quiz, TeamResult, LeagueEntry } from "./types";

export function getWinner(quiz: Quiz): TeamResult | null {
  if (!Array.isArray(quiz.results) || quiz.results.length === 0) return null;
  return sortResultsByScore(quiz.results)[0] ?? null;
}

export function quizLeaguePoints(results: TeamResult[]): Map<string, number> {
  const map = new Map<string, number>();
  if (!Array.isArray(results) || results.length === 0) return map;
  const sorted = sortResultsByScore(results);
  const n = sorted.length;
  sorted.forEach((t, i) => map.set(t.teamName, n - 1 - i));
  return map;
}

export function computeLeague(quizzes: Quiz[]): LeagueEntry[] {
  const points = new Map<string, number>();
  const played = new Map<string, number>();
  for (const quiz of quizzes) {
    if (!Array.isArray(quiz.results)) continue;
    for (const [team, p] of quizLeaguePoints(quiz.results)) {
      points.set(team, (points.get(team) ?? 0) + p);
      played.set(team, (played.get(team) ?? 0) + 1);
    }
  }
  return Array.from(points.keys())
    .map(teamName => ({
      teamName,
      points: points.get(teamName) ?? 0,
      quizzesPlayed: played.get(teamName) ?? 0,
    }))
    .sort((a, b) => b.points - a.points || b.quizzesPlayed - a.quizzesPlayed);
}
