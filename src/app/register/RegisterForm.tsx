'use client';

import { useState, type FormEvent } from 'react';

export function RegisterForm() {
  const [error, setError] = useState<string>(); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(undefined);
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), email: form.get('email'), password: form.get('password') }) });
    if (!response.ok) { const result = await response.json().catch(() => null); setError(result?.error?.message ?? 'Unable to create the account.'); setPending(false); return; }
    window.location.assign('/login?registered=1');
  }
  return <form onSubmit={submit} className="space-y-4">
    <label className="block">Name<input required name="name" minLength={2} maxLength={100} autoComplete="name" className="mt-1 w-full rounded border p-2 text-slate-900" /></label>
    <label className="block">Email<input required name="email" type="email" autoComplete="email" className="mt-1 w-full rounded border p-2 text-slate-900" /></label>
    <label className="block">Password<input required name="password" type="password" minLength={12} autoComplete="new-password" className="mt-1 w-full rounded border p-2 text-slate-900" /><span className="text-xs text-slate-500">Use at least 12 characters.</span></label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button disabled={pending} className="w-full rounded bg-emerald-700 p-2 font-semibold text-white disabled:opacity-60">{pending ? 'Creating account…' : 'Create account'}</button>
  </form>;
}
