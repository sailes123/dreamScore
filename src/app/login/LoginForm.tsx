'use client';

import { signIn } from 'next-auth/react';
import { useState, type FormEvent } from 'react';

export function LoginForm() {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(undefined);
    const form = new FormData(event.currentTarget);
    const result = await signIn('credentials', { email: form.get('email'), password: form.get('password'), redirect: false });
    if (result?.error) { setError('Email or password is incorrect.'); setPending(false); return; }
    window.location.assign('/organizer/dashboard');
  }

  return <form onSubmit={submit} className="space-y-4">
    <label className="block">Email<input required name="email" type="email" autoComplete="email" className="mt-1 w-full rounded border p-2 text-slate-900" /></label>
    <label className="block">Password<input required name="password" type="password" minLength={12} autoComplete="current-password" className="mt-1 w-full rounded border p-2 text-slate-900" /></label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button disabled={pending} className="w-full rounded bg-emerald-700 p-2 font-semibold text-white disabled:opacity-60">{pending ? 'Signing in…' : 'Sign in'}</button>
  </form>;
}
