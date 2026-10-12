'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';

function ResetPasswordForm() {
  const params = useSearchParams();
  const [message, setMessage] = useState<string>();
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); if (form.get('password') !== form.get('confirm')) { setMessage('Passwords do not match.'); return; } const response = await fetch('/api/auth/password-reset', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: params.get('token'), password: form.get('password') }) }); setMessage(response.ok ? 'Password reset. You can now sign in.' : 'This reset link is invalid or expired.'); }
  return <main className="mx-auto mt-20 max-w-md rounded-xl bg-white p-8 shadow"><h1 className="text-2xl font-bold">Choose a new password</h1><form onSubmit={submit} className="mt-5 space-y-4"><input required name="password" type="password" minLength={12} autoComplete="new-password" placeholder="New password" className="w-full rounded border p-2" /><input required name="confirm" type="password" minLength={12} autoComplete="new-password" placeholder="Confirm password" className="w-full rounded border p-2" /><button className="w-full rounded bg-emerald-700 p-2 font-semibold text-white">Reset password</button></form>{message && <p className="mt-4 text-sm text-slate-600">{message}</p>}<Link href="/login" className="mt-5 inline-block text-sm text-emerald-700 underline">Sign in</Link></main>;
}

export default function ResetPasswordPage() { return <Suspense fallback={<main className="mx-auto mt-20 max-w-md rounded-xl bg-white p-8 shadow">Loading reset form…</main>}><ResetPasswordForm /></Suspense>; }
