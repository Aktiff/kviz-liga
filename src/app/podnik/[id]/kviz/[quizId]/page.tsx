import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { QuizDetail } from "@/components/QuizDetail";
import type { Venue, Quiz } from "@/lib/types";

export default async function Page({ params }: { params: Promise<{ id: string; quizId: string }> }) {
  const { id, quizId } = await params;
  const v = (await readDb()).venues.find((x: Venue) => x.id === id);
  if (!v) notFound();
  const q = v.quizzes.find((x: Quiz) => x.id === quizId);
  if (!q) notFound();
  return <QuizDetail venue={v} quiz={q} isAdmin={await isAdmin()} />;
}
