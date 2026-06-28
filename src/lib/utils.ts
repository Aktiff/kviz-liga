import type { TeamResult } from "./types";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[áà]/g, "a").replace(/[čç]/g, "c").replace(/[ď]/g, "d")
    .replace(/[éè]/g, "e").replace(/[íì]/g, "i").replace(/[ľĺ]/g, "l")
    .replace(/[ň]/g, "n").replace(/[óò]/g, "o").replace(/[ô]/g, "o")
    .replace(/[ŕ]/g, "r").replace(/[š]/g, "s").replace(/[ť]/g, "t")
    .replace(/[úù]/g, "u").replace(/[ý]/g, "y").replace(/[ž]/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function sortResultsByScore(results: TeamResult[]): TeamResult[] {
  if (!Array.isArray(results) || results.length === 0) return [];
  return [...results].sort((a, b) => b.score - a.score);
}

export function formatDate(d: string): string {
  const x = new Date(d);
  return x.getDate() + "." + (x.getMonth() + 1) + "." + x.getFullYear();
}
