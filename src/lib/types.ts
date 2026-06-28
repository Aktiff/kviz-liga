export interface TeamResult {
  teamName: string;
  score: number;
  rounds?: [number, number, number, number];
  rozstrel?: number;
}

export interface Quiz {
  id: string;
  date: string;
  results: TeamResult[];
}

export interface Venue {
  id: string;
  name: string;
  quizzes: Quiz[];
  historical?: Record<string, { points: number; quizzes: number }>;
}

export interface Database {
  venues: Venue[];
}

export interface LeagueEntry {
  teamName: string;
  points: number;
  quizzesPlayed: number;
}
