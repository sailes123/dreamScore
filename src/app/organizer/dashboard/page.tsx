import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requirePageUser } from '@/lib/page-access';
import { CreateTournamentForm } from '@/components/organizer/CreateTournamentForm';

export const dynamic = 'force-dynamic';

export default async function OrganizerDashboardPage() {
  const user = await requirePageUser();
  const [tournaments, sports] = await Promise.all([
    prisma.tournament.findMany({ where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, status: 'ACTIVE' } } }] }, select: { id: true, name: true, slug: true, status: true, sportCode: true, _count: { select: { teams: true, matches: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.sportConfiguration.findMany({ select: { code: true, name: true, defaultMatchDurationMinutes: true, periods: true }, orderBy: { name: 'asc' } }),
  ]);
  const links = [
    ['Teams', 'teams'], ['Players', 'players'], ['Venues', 'venues'], ['Fixtures', 'fixtures'],
    ['Match control', 'match-control'], ['Standings', 'standings'], ['Purchase', 'purchase'],
  ] as const;
  return <main className="mx-auto max-w-6xl p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">Your tournaments</h1><p className="mb-6 text-slate-600">Create and manage tournaments saved in PostgreSQL.</p></div><Link className="text-emerald-700 underline" href="/account">Account security</Link></div><CreateTournamentForm sports={sports} /><section className="mt-8 grid gap-4 md:grid-cols-2">{tournaments.map((tournament) => <article key={tournament.id} className="rounded-lg border bg-white p-5 shadow-sm"><h2 className="font-bold">{tournament.name}</h2><p className="text-sm text-slate-600">{tournament.sportCode} · {tournament.status}</p><p className="mt-2 text-sm">{tournament._count.teams} teams · {tournament._count.matches} fixtures</p><nav aria-label={`${tournament.name} management`} className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm">{links.map(([label, view]) => <Link key={view} className="text-emerald-700 underline" href={`/organizer/${view}?tournament=${tournament.id}`}>{label}</Link>)}</nav></article>)}{!tournaments.length && <p className="text-slate-600">No tournaments yet. Create your first one above.</p>}</section></main>;
}
