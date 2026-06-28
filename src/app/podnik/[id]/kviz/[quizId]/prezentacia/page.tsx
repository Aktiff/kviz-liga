import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { QuizPresentation } from "@/components/QuizPresentation";
import type { Venue, Quiz } from "@/lib/types";

export default async function Page({ params }: { params: Promise<{ id: string; quizId: string }> }) {
  const { id, quizId } = await params;
  const db = await readDb();
  const venue = db.venues.find((v: Venue) => v.id === id);
  if (!venue) notFound();
  const quiz = venue.quizzes.find((q: Quiz) => q.id === quizId);
  if (!quiz) notFound();
  const admin = await isAdmin();
  return <QuizPresentation quiz={quiz} venueId={id} isAdmin={admin} />;
}
