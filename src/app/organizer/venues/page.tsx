import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requirePageUser } from '@/lib/page-access';
import { CreateVenueForm } from '@/components/organizer/CreateVenueForm';
export const dynamic = 'force-dynamic';
export default async function OrganizerVenuesPage({ searchParams }: { searchParams: Promise<{ tournament?: string }> }) {
  const user = await requirePageUser(); const { tournament: selectedId } = await searchParams;
  const tournaments = await prisma.tournament.findMany({ where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, status: 'ACTIVE' } } }] }, select: { id: true, name: true }, orderBy: { createdAt: 'desc' } });
  const tournamentId = (selectedId ? tournaments.find((item) => item.id === selectedId)?.id : undefined) ?? tournaments[0]?.id;
  const venues = tournamentId ? await prisma.venue.findMany({ where: { tournamentId }, include: { courts: true }, orderBy: { name: 'asc' } }) : [];
  return <main className="mx-auto max-w-5xl p-6"><Link href="/organizer/dashboard" className="text-emerald-700 underline">Dashboard</Link><h1 className="mt-4 text-3xl font-bold">Venues and courts</h1><div className="mt-4 flex flex-wrap gap-2">{tournaments.map((item) => <Link key={item.id} href={`/organizer/venues?tournament=${item.id}`} className={`rounded px-3 py-2 text-sm ${item.id === tournamentId ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>{item.name}</Link>)}</div>{tournamentId ? <><CreateVenueForm tournamentId={tournamentId} /><section className="mt-6 grid gap-3 md:grid-cols-2">{venues.map((venue) => <article key={venue.id} className="rounded-xl border bg-white p-4"><h2 className="font-semibold">{venue.name}</h2><p className="text-sm text-slate-600">{venue.address}, {venue.city}, {venue.country}</p><p className="mt-2 text-sm">Courts: {venue.courts.map((court) => court.name).join(', ')}</p></article>)}{!venues.length && <p className="text-slate-600">No venues yet.</p>}</section></> : <p className="mt-6 text-slate-600">Create a tournament first.</p>}</main>;
}
