import type { TeamResult } from "./types";

export function sortResultsByScore(results: TeamResult[]): TeamResult[] {
  if (!Array.isArray(results) || results.length === 0) return [];
  return [...results].sort((a, b) => b.score - a.score);
}

export function formatDate(d: string): string {
  const x = new Date(d);
  return x.getDate() + "." + (x.getMonth() + 1) + "." + x.getFullYear();
}
