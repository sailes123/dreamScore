import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PublicPage() {
  const tournaments = await prisma.tournament.findMany({
    where: { visibility: 'PUBLIC' },
    select: { slug: true, name: true, description: true, sportCode: true, startAt: true, endAt: true, status: true, _count: { select: { teams: true } } },
    orderBy: { startAt: 'asc' }, take: 50,
  });
  return <main className="mx-auto max-w-6xl p-6"><h1 className="text-3xl font-bold">ArenaOps tournaments</h1><p className="mt-2 text-slate-600">Follow public tournaments, fixtures, and live results.</p><section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{tournaments.map((tournament) => <article className="rounded-xl border bg-white p-5 shadow-sm" key={tournament.slug}><p className="text-sm font-medium text-emerald-700">{tournament.sportCode} · {tournament.status}</p><h2 className="mt-1 text-xl font-bold">{tournament.name}</h2><p className="mt-2 line-clamp-3 text-sm text-slate-600">{tournament.description}</p><p className="mt-4 text-sm">{tournament._count.teams} teams · Starts {tournament.startAt.toLocaleDateString()}</p><Link className="mt-4 inline-block font-medium text-emerald-700 underline" href={`/public/tournaments/${tournament.slug}`}>View tournament</Link></article>)}{!tournaments.length && <p className="text-slate-600">There are no public tournaments yet.</p>}</section></main>;
}
