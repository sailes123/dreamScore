'use client';

import { useState } from 'react';

type Team = { id: string; name: string };
type Match = { id: string; status: string; homeScore: number; awayScore: number; homeTeam: Team | null; awayTeam: Team | null; currentPeriod: number | null; currentMinute: number | null };

export function MatchControlPanel({ match }: { match: Match }) {
  const [pending, setPending] = useState(false); const [error, setError] = useState<string>();
  async function request(path: string, body: unknown) {
    setPending(true); setError(undefined);
    const response = await fetch(path, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) { const result = await response.json().catch(() => null); setError(result?.error?.message ?? 'Could not update the match.'); setPending(false); return; }
    window.location.reload();
  }
  async function addGoal(teamId: string) {
    setPending(true); setError(undefined);
    const response = await fetch(`/api/matches/${match.id}/events`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ teamId, eventType: 'GOAL', minute: match.currentMinute ?? 0, period: String(match.currentPeriod ?? 1) }) });
    if (!response.ok) { const result = await response.json().catch(() => null); setError(result?.error?.message ?? 'Could not record the goal.'); setPending(false); return; }
    window.location.reload();
  }
  const live = match.status === 'LIVE' || match.status === 'HALFTIME';
  return <article className="rounded-xl border bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{match.homeTeam?.name ?? 'TBD'} <span className="text-xl">{match.homeScore} – {match.awayScore}</span> {match.awayTeam?.name ?? 'TBD'}</p><p className="text-sm text-slate-600">{match.status}{match.currentPeriod ? ` · Period ${match.currentPeriod}` : ''}{match.currentMinute !== null ? ` · ${match.currentMinute}'` : ''}</p></div><div className="flex flex-wrap gap-2">{match.status === 'SCHEDULED' || match.status === 'READY' ? <button disabled={pending} onClick={() => request(`/api/matches/${match.id}`, { status: 'LIVE', currentPeriod: 1, currentMinute: 0 })} className="rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">Start match</button> : null}{match.status === 'LIVE' ? <button disabled={pending} onClick={() => request(`/api/matches/${match.id}`, { status: 'HALFTIME' })} className="rounded bg-amber-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">Half-time</button> : null}{match.status === 'HALFTIME' ? <button disabled={pending} onClick={() => request(`/api/matches/${match.id}`, { status: 'LIVE', currentPeriod: (match.currentPeriod ?? 1) + 1 })} className="rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">Resume</button> : null}{live ? <button disabled={pending} onClick={() => request(`/api/matches/${match.id}`, { status: 'COMPLETED' })} className="rounded border border-slate-400 px-3 py-2 text-sm font-semibold disabled:opacity-60">Complete</button> : null}</div></div>{live && <div className="mt-3 flex flex-wrap gap-2"><button disabled={pending || !match.homeTeam} onClick={() => match.homeTeam && addGoal(match.homeTeam.id)} className="rounded border px-3 py-1.5 text-sm disabled:opacity-60">+ Goal: {match.homeTeam?.name ?? 'TBD'}</button><button disabled={pending || !match.awayTeam} onClick={() => match.awayTeam && addGoal(match.awayTeam.id)} className="rounded border px-3 py-1.5 text-sm disabled:opacity-60">+ Goal: {match.awayTeam?.name ?? 'TBD'}</button></div>}{error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}</article>;
}
