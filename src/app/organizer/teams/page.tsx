import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requirePageUser } from '@/lib/page-access';
import { CreateTeamForm } from '@/components/organizer/CreateTeamForm';

export const dynamic = 'force-dynamic';

export default async function OrganizerTeamsPage({ searchParams }: { searchParams: Promise<{ tournament?: string }> }) {
  const user = await requirePageUser(); const { tournament: selectedId } = await searchParams;
  const tournaments = await prisma.tournament.findMany({ where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, status: 'ACTIVE' } } }] }, select: { id: true, name: true }, orderBy: { createdAt: 'desc' } });
  const tournamentId = selectedId && tournaments.some((item) => item.id === selectedId) ? selectedId : tournaments[0]?.id;
  const teams = tournamentId ? await prisma.team.findMany({ where: { tournamentId }, include: { _count: { select: { players: true } } }, orderBy: { name: 'asc' } }) : [];
  return <main className="mx-auto max-w-6xl p-6"><Link href="/organizer/dashboard" className="text-emerald-700 underline">Dashboard</Link><h1 className="mt-4 text-3xl font-bold">Teams</h1><div className="mt-4 flex flex-wrap gap-2">{tournaments.map((item) => <Link key={item.id} href={`/organizer/teams?tournament=${item.id}`} className={`rounded px-3 py-2 text-sm ${item.id === tournamentId ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>{item.name}</Link>)}</div>{tournamentId ? <><CreateTeamForm tournamentId={tournamentId} /><section className="mt-6 overflow-hidden rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Team</th><th className="p-3">Manager</th><th className="p-3">Players</th><th className="p-3">Registration</th><th className="p-3">Payment</th></tr></thead><tbody>{teams.map((team) => <tr className="border-t" key={team.id}><td className="p-3 font-medium">{team.name}<span className="ml-2 text-slate-500">{team.shortName}</span></td><td className="p-3">{team.managerName}<br /><span className="text-slate-500">{team.managerEmail}</span></td><td className="p-3">{team._count.players}</td><td className="p-3">{team.registrationStatus}</td><td className="p-3">{team.paymentStatus}</td></tr>)}{!teams.length && <tr><td className="p-5 text-slate-600" colSpan={5}>No teams registered yet.</td></tr>}</tbody></table></section></> : <p className="mt-6 text-slate-600">Create a tournament first.</p>}</main>;
}
