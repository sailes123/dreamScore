'use client';

import { signOut } from 'next-auth/react';
import { useState, type FormEvent } from 'react';

export function AccountSecurityForm() {
  const [pending, setPending] = useState(false); const [error, setError] = useState<string>(); const [success, setSuccess] = useState(false);
  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(undefined); setSuccess(false);
    const form = new FormData(event.currentTarget);
    if (form.get('newPassword') !== form.get('confirmPassword')) { setError('New passwords do not match.'); setPending(false); return; }
    const response = await fetch('/api/account/password', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ currentPassword: form.get('currentPassword'), newPassword: form.get('newPassword') }) });
    if (!response.ok) { const body = await response.json().catch(() => null); setError(body?.error?.message ?? 'Could not change password.'); setPending(false); return; }
    event.currentTarget.reset(); setSuccess(true); setPending(false);
  }
  return <section className="max-w-xl rounded-xl border bg-white p-5"><h2 className="text-lg font-semibold">Password</h2><form onSubmit={changePassword} className="mt-4 space-y-3"><label className="block text-sm">Current password<input required name="currentPassword" type="password" autoComplete="current-password" className="mt-1 w-full rounded border p-2" /></label><label className="block text-sm">New password<input required name="newPassword" type="password" minLength={12} autoComplete="new-password" className="mt-1 w-full rounded border p-2" /></label><label className="block text-sm">Confirm new password<input required name="confirmPassword" type="password" minLength={12} autoComplete="new-password" className="mt-1 w-full rounded border p-2" /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}{success && <p role="status" className="text-sm text-emerald-700">Password changed successfully.</p>}<button disabled={pending} className="rounded bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-60">{pending ? 'Saving…' : 'Change password'}</button></form><hr className="my-6" /><button type="button" onClick={() => signOut({ callbackUrl: '/login' })} className="rounded border border-slate-400 px-4 py-2 text-sm font-semibold">Sign out</button></section>;
}
