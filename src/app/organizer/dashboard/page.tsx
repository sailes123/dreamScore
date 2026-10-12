import Link from 'next/link';
import type { ReactNode } from 'react';
import { CalendarDays, ChevronRight, CircleDollarSign, LayoutDashboard, MapPin, Trophy, Users, UserRound, Volleyball } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requirePageUser } from '@/lib/page-access';
import { CreateTournamentForm } from '@/components/organizer/CreateTournamentForm';

export const dynamic = 'force-dynamic';

const nav = [
  ['Dashboard', 'dashboard', LayoutDashboard], ['Teams', 'teams', Users], ['Players', 'players', UserRound],
  ['Venues', 'venues', MapPin], ['Fixtures', 'fixtures', CalendarDays], ['Match control', 'match-control', Volleyball],
  ['Standings', 'standings', Trophy], ['Licensing', 'purchase', CircleDollarSign],
] as const;

export default async function OrganizerDashboardPage() {
  const user = await requirePageUser();
  const [tournaments, sports] = await Promise.all([
    prisma.tournament.findMany({
      where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, status: 'ACTIVE' } } }] },
      select: { id: true, name: true, slug: true, status: true, sportCode: true, startAt: true, _count: { select: { teams: true, matches: true, venues: true } }, teams: { select: { _count: { select: { players: true } } } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.sportConfiguration.findMany({ select: { code: true, name: true, defaultMatchDurationMinutes: true, periods: true }, orderBy: { name: 'asc' } }),
  ]);
  const totalTeams = tournaments.reduce((sum, tournament) => sum + tournament._count.teams, 0);
  const totalMatches = tournaments.reduce((sum, tournament) => sum + tournament._count.matches, 0);

  return <div className="min-h-screen bg-slate-100 text-slate-800">
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6"><Link href="/organizer/dashboard" className="flex items-center gap-2 font-bold text-slate-900"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white"><Trophy className="h-5 w-5" /></span><span>ArenaOps</span></Link><div className="flex items-center gap-4 text-sm"><Link href="/public" className="hidden text-slate-600 hover:text-emerald-700 sm:block">Public portal</Link><Link href="/account" className="rounded-lg border border-slate-200 px-3 py-2 font-medium hover:bg-slate-50">Account</Link></div></div></header>
    <div className="mx-auto flex max-w-screen-2xl">
      <aside className="hidden min-h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-slate-200 bg-white p-4 lg:block"><p className="mb-3 px-3 text-[11px] font-bold tracking-widest text-slate-400">TOURNAMENT WORKSPACE</p><nav className="space-y-1">{nav.map(([label, route, Icon]) => <Link key={route} href={`/organizer/${route}`} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${route === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="h-4 w-4" />{label}</Link>)}</nav><div className="mt-8 rounded-xl bg-slate-900 p-4 text-white"><p className="text-xs font-semibold text-emerald-300">Need help?</p><p className="mt-1 text-xs leading-relaxed text-slate-300">Set up your tournament, then add teams and fixtures.</p></div></aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold text-emerald-700">ORGANIZER CONSOLE</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Tournament dashboard</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Run every part of your tournament from one connected workspace.</p></div><a href="#create-tournament" className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700">Create tournament</a></div>
        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Tournaments" value={tournaments.length} icon={<Trophy className="h-5 w-5" />} /><Metric label="Registered teams" value={totalTeams} icon={<Users className="h-5 w-5" />} /><Metric label="Fixtures" value={totalMatches} icon={<CalendarDays className="h-5 w-5" />} /><Metric label="Active venues" value={tournaments.reduce((sum, tournament) => sum + tournament._count.venues, 0)} icon={<MapPin className="h-5 w-5" />} /></section>
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold tracking-widest text-slate-400">YOUR TOURNAMENTS</p><h2 className="mt-1 text-xl font-bold text-slate-950">Continue organizing</h2></div><span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{tournaments.length} total</span></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{tournaments.map((tournament) => <article key={tournament.id} className="rounded-xl border border-slate-200 p-5 transition hover:border-emerald-300 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">{tournament.status}</span><h3 className="mt-3 text-lg font-bold text-slate-900">{tournament.name}</h3><p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{tournament.sportCode} · Starts {tournament.startAt.toLocaleDateString()}</p></div><Trophy className="h-6 w-6 text-slate-300" /></div><div className="mt-5 grid grid-cols-3 border-y border-slate-100 py-3 text-center"><SmallMetric label="Teams" value={tournament._count.teams} /><SmallMetric label="Players" value={tournament.teams.reduce((sum, team) => sum + team._count.players, 0)} /><SmallMetric label="Fixtures" value={tournament._count.matches} /></div><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">{nav.slice(1, 6).map(([label, route]) => <Link key={route} href={`/organizer/${route}?tournament=${tournament.id}`} className="font-semibold text-emerald-700 hover:text-emerald-900">{label}</Link>)}<Link href={`/organizer/standings?tournament=${tournament.id}`} className="ml-auto inline-flex items-center font-bold text-slate-800 hover:text-emerald-700">Open <ChevronRight className="h-4 w-4" /></Link></div></article>)}{!tournaments.length && <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center lg:col-span-2"><Trophy className="mx-auto h-8 w-8 text-slate-400" /><h3 className="mt-3 font-bold text-slate-800">Create your first tournament</h3><p className="mt-1 text-sm text-slate-500">Start with the form below, then build your teams and schedule.</p></div>}</div></section>
        <section id="create-tournament" className="mt-8 scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><p className="text-xs font-bold tracking-widest text-slate-400">NEW TOURNAMENT</p><h2 className="mt-1 text-xl font-bold text-slate-950">Create a tournament</h2><p className="mt-1 text-sm text-slate-500">This saves directly to your Supabase PostgreSQL database.</p><div className="mt-5"><CreateTournamentForm sports={sports} /></div></section>
      </div></main>
    </div>
  </div>;
}

function Metric({ label, value, icon }: { label: string; value: number; icon: ReactNode }) { return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><span className="rounded-xl bg-slate-100 p-2 text-slate-600">{icon}</span></div><p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">{value}</p></article>; }
function SmallMetric({ label, value }: { label: string; value: number }) { return <div><p className="text-lg font-extrabold text-slate-900">{value}</p><p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p></div>; }
