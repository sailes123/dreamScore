'use client';

import { useState, type FormEvent } from 'react';

export function CreateTeamForm({ tournamentId }: { tournamentId: string }) {
  const [error, setError] = useState<string>(); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(undefined); const form = new FormData(event.currentTarget);
    const body = { name: form.get('name'), shortName: form.get('shortName'), managerName: form.get('managerName'), managerEmail: form.get('managerEmail'), managerPhone: form.get('managerPhone'), primaryColor: '#047857', secondaryColor: '#ffffff', registrationFee: 0, amountReceived: 0 };
    const response = await fetch(`/api/tournaments/${tournamentId}/teams`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) { const result = await response.json().catch(() => null); setError(result?.error?.message ?? 'Could not register team.'); setPending(false); return; }
    window.location.reload();
  }
  return <form onSubmit={submit} className="mt-6 grid gap-2 rounded-xl border bg-slate-50 p-4 md:grid-cols-2"><input required name="name" minLength={2} placeholder="Team name" className="rounded border p-2" /><input required name="shortName" minLength={2} maxLength={20} placeholder="Short name" className="rounded border p-2" /><input required name="managerName" minLength={2} placeholder="Manager name" className="rounded border p-2" /><input required name="managerEmail" type="email" placeholder="Manager email" className="rounded border p-2" /><input required name="managerPhone" minLength={5} placeholder="Manager phone" className="rounded border p-2" />{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={pending} className="rounded bg-emerald-700 p-2 font-semibold text-white disabled:opacity-60">{pending ? 'Registering…' : 'Register team'}</button></form>;
}
