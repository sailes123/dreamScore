import { requireAdminPageUser } from '@/lib/page-access';
import { prisma } from '@/lib/prisma';
import { PurchaseReviewActions } from '@/components/admin/PurchaseReviewActions';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requireAdminPageUser();
  const purchases = await prisma.tournamentPurchase.findMany({ include: { purchaser: { select: { name: true, email: true } }, tournament: { select: { name: true } } }, orderBy: [{ approvalStatus: 'asc' }, { purchasedAt: 'desc' }] });
  const pending = purchases.filter((purchase) => purchase.approvalStatus === 'PENDING').length;
  return <main className="mx-auto max-w-6xl p-6"><h1 className="text-3xl font-bold">Platform administration</h1><p className="mb-6 text-slate-600">{pending} payment {pending === 1 ? 'review' : 'reviews'} awaiting a decision.</p><section className="overflow-x-auto rounded-lg border bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-700"><tr><th className="p-3">Purchaser</th><th className="p-3">Package</th><th className="p-3">Tournament</th><th className="p-3">Reference</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead><tbody>{purchases.map((purchase) => <tr key={purchase.id} className="border-t"><td className="p-3"><div>{purchase.purchaser.name}</div><div className="text-slate-500">{purchase.purchaser.email}</div></td><td className="p-3">{purchase.packageNameSnapshot}<br /><span className="text-slate-500">{purchase.currencySnapshot} {purchase.priceSnapshot.toString()}</span></td><td className="p-3">{purchase.tournament?.name ?? 'No tournament selected'}</td><td className="p-3">{purchase.paymentReference}</td><td className="p-3">{purchase.approvalStatus}</td><td className="p-3">{purchase.approvalStatus === 'PENDING' ? <PurchaseReviewActions purchaseId={purchase.id} /> : <span className="text-slate-500">Reviewed</span>}</td></tr>)}{!purchases.length && <tr><td colSpan={6} className="p-6 text-slate-600">No purchase submissions yet.</td></tr>}</tbody></table></section></main>;
}
