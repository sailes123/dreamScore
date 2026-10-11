'use client';

import { useState } from 'react';

export function PurchaseReviewActions({ purchaseId }: { purchaseId: string }) {
  const [pending, setPending] = useState(false); const [error, setError] = useState<string>();
  async function review(approved: boolean) {
    const notes = window.prompt(approved ? 'Optional approval note:' : 'Reason for rejection:') ?? '';
    if (!approved && notes.trim().length < 3) { setError('Provide a short rejection reason.'); return; }
    setPending(true); setError(undefined);
    const response = await fetch(`/api/admin/purchases/${purchaseId}/approval`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ approved, notes }) });
    if (!response.ok) { const body = await response.json().catch(() => null); setError(body?.error?.message ?? 'Could not review this purchase.'); setPending(false); return; }
    window.location.reload();
  }
  return <div className="flex flex-wrap items-center gap-2"><button type="button" disabled={pending} onClick={() => review(true)} className="rounded bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60">Approve</button><button type="button" disabled={pending} onClick={() => review(false)} className="rounded border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-700 disabled:opacity-60">Reject</button>{error && <span role="alert" className="text-sm text-red-700">{error}</span>}</div>;
}
