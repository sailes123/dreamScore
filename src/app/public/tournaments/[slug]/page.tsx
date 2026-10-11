import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { calculateStandings } from '@/lib/standings';
import { TournamentVisibility } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function PublicTournamentPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ code?: string }> }) {
  const [{ slug }, { code }] = await Promise.all([params, searchParams]);
  const tournament = await prisma.tournament.findFirst({ where: { slug, OR: [{ visibility: TournamentVisibility.PUBLIC }, ...(code ? [{ visibility: TournamentVisibility.PRIVATE, invitationCode: code }] : [])] }, include: { teams: { select: { id: true, name: true, shortName: true, groupCode: true } }, matches: { where: { status: { in: ['SCHEDULED', 'READY', 'LIVE', 'HALFTIME', 'COMPLETED'] } }, include: { homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } } }, orderBy: { scheduledAt: 'asc' } } } });
  if (!tournament) notFound();
  const standings = calculateStandings(tournament.teams, tournament.matches, { win: tournament.pointsForWin, draw: tournament.pointsForDraw, loss: tournament.pointsForLoss });
  return <main className="mx-auto max-w-6xl p-6"><Link href="/public" className="text-emerald-700 underline">All tournaments</Link><h1 className="mt-4 text-3xl font-bold">{tournament.name}</h1><p className="mt-2 max-w-3xl text-slate-600">{tournament.description}</p><div className="mt-8 grid gap-8 lg:grid-cols-2"><section><h2 className="text-xl font-bold">Fixtures & results</h2><div className="mt-3 space-y-2">{tournament.matches.map((match) => <div key={match.id} className="rounded border bg-white p-3 text-sm"><span className="font-medium">{match.homeTeam?.name ?? 'TBD'} {match.homeScore} – {match.awayScore} {match.awayTeam?.name ?? 'TBD'}</span><span className="ml-2 text-slate-500">{match.status} · {match.scheduledAt.toLocaleString()}</span></div>)}{!tournament.matches.length && <p className="text-slate-600">Fixtures will be published soon.</p>}</div></section><section><h2 className="text-xl font-bold">Standings</h2><table className="mt-3 w-full text-sm"><thead><tr className="border-b text-left"><th>Team</th><th>P</th><th>GD</th><th>Pts</th></tr></thead><tbody>{standings.map((row, index) => <tr key={row.id} className="border-b"><td>{index + 1}. {row.name}</td><td>{row.played}</td><td>{row.goalDifference}</td><td className="font-bold">{row.points}</td></tr>)}</tbody></table></section></div></main>;
}
