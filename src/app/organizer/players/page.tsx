import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requirePageUser } from '@/lib/page-access';
import { CreatePlayerForm } from '@/components/organizer/CreatePlayerForm';

export const dynamic = 'force-dynamic';

export default async function OrganizerPlayersPage({ searchParams }: { searchParams: Promise<{ tournament?: string }> }) {
  const user = await requirePageUser(); const { tournament: selectedId } = await searchParams;
  const tournaments = await prisma.tournament.findMany({ where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, status: 'ACTIVE' } } }] }, select: { id: true, name: true }, orderBy: { createdAt: 'desc' } });
  const tournamentId = (selectedId ? tournaments.find((item) => item.id === selectedId)?.id : undefined) ?? tournaments[0]?.id;
  const [players, teams] = tournamentId ? await Promise.all([prisma.player.findMany({ where: { tournamentId }, include: { team: { select: { name: true } } }, orderBy: [{ team: { name: 'asc' } }, { jerseyNumber: 'asc' }] }), prisma.team.findMany({ where: { tournamentId }, select: { id: true, name: true }, orderBy: { name: 'asc' } })]) : [[], []];
  return <main className="mx-auto max-w-6xl p-6"><Link href="/organizer/dashboard" className="text-emerald-700 underline">Dashboard</Link><h1 className="mt-4 text-3xl font-bold">Players</h1><div className="mt-4 flex flex-wrap gap-2">{tournaments.map((item) => <Link key={item.id} href={`/organizer/players?tournament=${item.id}`} className={`rounded px-3 py-2 text-sm ${item.id === tournamentId ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>{item.name}</Link>)}</div>{tournamentId ? <><CreatePlayerForm tournamentId={tournamentId} teams={teams} /><section className="mt-6 overflow-hidden rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Player</th><th className="p-3">Team</th><th className="p-3">#</th><th className="p-3">Position</th><th className="p-3">Role</th></tr></thead><tbody>{players.map((player) => <tr className="border-t" key={player.id}><td className="p-3 font-medium">{player.displayName}</td><td className="p-3">{player.team.name}</td><td className="p-3">{player.jerseyNumber}</td><td className="p-3">{player.position}</td><td className="p-3">{player.isCaptain ? 'Captain' : ''}{player.isCaptain && player.isGoalkeeper ? ' · ' : ''}{player.isGoalkeeper ? 'Goalkeeper' : ''}</td></tr>)}{!players.length && <tr><td className="p-5 text-slate-600" colSpan={5}>No players registered yet.</td></tr>}</tbody></table></section></> : <p className="mt-6 text-slate-600">Create a tournament first.</p>}</main>;
}
