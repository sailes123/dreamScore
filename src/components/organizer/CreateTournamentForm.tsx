'use client';

import { useState, type FormEvent } from 'react';

type Sport = { code: string; name: string; defaultMatchDurationMinutes: number; periods: number };

export function CreateTournamentForm({ sports }: { sports: Sport[] }) {
  const [error, setError] = useState<string>(); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(undefined); setPending(true);
    const form = new FormData(event.currentTarget); const sport = sports.find((item) => item.code === form.get('sportCode'));
    const body = { name: form.get('name'), description: form.get('description'), sportCode: form.get('sportCode'), visibility: 'PUBLIC', startAt: form.get('startAt'), endAt: form.get('endAt'), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, format: form.get('format'), numberOfTeams: Number(form.get('numberOfTeams')), maxTeams: Number(form.get('maxTeams')), groupsCount: 0, matchDurationMinutes: sport?.defaultMatchDurationMinutes ?? 40, periods: sport?.periods ?? 2, teamRegistrationFee: 0, currency: 'NPR' };
    const response = await fetch('/api/tournaments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) { const result = await response.json().catch(() => null); setError(result?.error?.message ?? 'Could not create tournament.'); setPending(false); return; }
    window.location.reload();
  }
  return <form onSubmit={submit} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
    <input required name="name" minLength={3} placeholder="Tournament name" className="rounded border p-2" />
    <select required name="sportCode" className="rounded border p-2">{sports.map((sport) => <option key={sport.code} value={sport.code}>{sport.name}</option>)}</select>
    <textarea required name="description" placeholder="Description" className="rounded border p-2 md:col-span-2" />
    <label className="text-sm">Start<input required name="startAt" type="datetime-local" className="ml-2 rounded border p-2" /></label>
    <label className="text-sm">End<input required name="endAt" type="datetime-local" className="ml-2 rounded border p-2" /></label>
    <select name="format" className="rounded border p-2"><option value="ROUND_ROBIN">Round robin</option><option value="KNOCKOUT">Knockout</option><option value="GROUP_STAGE_KNOCKOUT">Groups + knockout</option></select>
    <div className="flex gap-2"><input required name="numberOfTeams" type="number" min="2" defaultValue="8" className="w-1/2 rounded border p-2" aria-label="Planned teams" /><input required name="maxTeams" type="number" min="2" defaultValue="8" className="w-1/2 rounded border p-2" aria-label="Maximum teams" /></div>
    {error && <p role="alert" className="text-sm text-red-700 md:col-span-2">{error}</p>}
    <button disabled={pending || !sports.length} className="rounded bg-emerald-700 p-2 font-semibold text-white disabled:opacity-60 md:col-span-2">{pending ? 'Creating…' : 'Create tournament'}</button>
  </form>;
}
