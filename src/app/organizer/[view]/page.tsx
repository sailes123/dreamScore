import { requirePageUser } from '@/lib/page-access';
import { notFound, redirect } from 'next/navigation';

const databaseViews = new Set(['dashboard', 'teams', 'players', 'venues', 'fixtures', 'match-control', 'standings', 'purchase']);

export default async function OrganizerPage({ params, searchParams }: { params: Promise<{ view: string }>; searchParams: Promise<{ tournament?: string }> }) {
  await requirePageUser();
  const { view } = await params;
  if (!databaseViews.has(view)) notFound();
  const { tournament } = await searchParams;
  redirect(`/organizer/${view}${tournament ? `?tournament=${encodeURIComponent(tournament)}` : ''}`);
}
