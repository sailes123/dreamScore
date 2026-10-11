'use client';

import { useState, type FormEvent } from 'react';

type Package = { id: string; name: string; duration: string; maxDays: number; description: string; prices: { id: string; price: { toString(): string }; currency: string }[] };
type Tournament = { id: string; name: string };

export function PurchasePackageForm({ packages, tournaments }: { packages: Package[]; tournaments: Tournament[] }) {
  const [pending, setPending] = useState(false); const [error, setError] = useState<string>(); const [success, setSuccess] = useState<string>();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(undefined); setSuccess(undefined);
    const form = new FormData(event.currentTarget); const selected = packages.find((item) => item.id === form.get('packageId')); const price = selected?.prices[0];
    if (!price) { setError('Choose an available package.'); setPending(false); return; }
    const response = await fetch('/api/purchases', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ packagePriceId: price.id, tournamentId: form.get('tournamentId') || undefined, paymentMethod: form.get('paymentMethod'), paymentReference: form.get('paymentReference'), paymentNotes: form.get('paymentNotes') || undefined }) });
    if (!response.ok) { const body = await response.json().catch(() => null); setError(body?.error?.message ?? 'Could not submit the purchase.'); setPending(false); return; }
    event.currentTarget.reset(); setSuccess('Purchase submitted. A platform administrator will review your payment.'); setPending(false);
  }
  return <form onSubmit={submit} className="max-w-xl space-y-4 rounded-xl border bg-white p-5"><label className="block text-sm font-medium">Package<select required name="packageId" className="mt-1 w-full rounded border p-2">{packages.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.prices[0]?.currency} {item.prices[0]?.price.toString()} ({item.maxDays} days)</option>)}</select></label><label className="block text-sm font-medium">Tournament<select name="tournamentId" className="mt-1 w-full rounded border p-2"><option value="">Purchase without linking a tournament</option>{tournaments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="block text-sm font-medium">Payment method<select required name="paymentMethod" className="mt-1 w-full rounded border p-2"><option value="BANK_TRANSFER">Bank transfer</option><option value="DIGITAL_WALLET">Digital wallet</option><option value="CASH">Cash</option><option value="OTHER">Other</option></select></label><label className="block text-sm font-medium">Payment reference<input required name="paymentReference" minLength={3} maxLength={200} className="mt-1 w-full rounded border p-2" placeholder="Transaction/reference number" /></label><label className="block text-sm font-medium">Notes (optional)<textarea name="paymentNotes" maxLength={5000} className="mt-1 w-full rounded border p-2" /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}{success && <p role="status" className="text-sm text-emerald-700">{success}</p>}<button disabled={pending || !packages.length} className="rounded bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-60">{pending ? 'Submitting…' : 'Submit purchase'}</button></form>;
}
