import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requirePageUser } from '@/lib/page-access';
import { MatchControlPanel } from '@/components/organizer/MatchControlPanel';

export const dynamic = 'force-dynamic';

export default async function MatchControlPage({ searchParams }: { searchParams: Promise<{ tournament?: string }> }) {
  const user = await requirePageUser(); const { tournament: selectedId } = await searchParams;
  const tournaments = await prisma.tournament.findMany({ where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, status: 'ACTIVE' } } }] }, select: { id: true, name: true }, orderBy: { createdAt: 'desc' } });
  const tournamentId = (selectedId ? tournaments.find((item) => item.id === selectedId)?.id : undefined) ?? tournaments[0]?.id;
  const matches = tournamentId ? await prisma.match.findMany({ where: { tournamentId, status: { notIn: ['COMPLETED', 'CANCELLED'] } }, include: { homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } } }, orderBy: [{ scheduledAt: 'asc' }, { matchNumber: 'asc' }] }) : [];
  return <main className="mx-auto max-w-4xl p-6"><Link href="/organizer/dashboard" className="text-emerald-700 underline">Dashboard</Link><h1 className="mt-4 text-3xl font-bold">Match control</h1><p className="mt-1 text-slate-600">Start fixtures, record goals, and complete matches. All actions are audited.</p><div className="mt-4 flex flex-wrap gap-2">{tournaments.map((item) => <Link key={item.id} href={`/organizer/match-control?tournament=${item.id}`} className={`rounded px-3 py-2 text-sm ${item.id === tournamentId ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>{item.name}</Link>)}</div><section className="mt-6 grid gap-4">{matches.map((match) => <MatchControlPanel key={match.id} match={match} />)}{tournamentId && !matches.length && <p className="text-slate-600">No controllable fixtures are available.</p>}{!tournamentId && <p className="text-slate-600">Create a tournament and fixtures first.</p>}</section></main>;
}
