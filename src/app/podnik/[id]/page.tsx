import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { VenueDetail } from "@/components/VenueDetail";
import type { Venue } from "@/lib/types";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = (await readDb()).venues.find((x: Venue) => x.id === id);
  if (!v) notFound();
  return <div><VenueDetail venue={v} isAdmin={await isAdmin()} /></div>;
}
