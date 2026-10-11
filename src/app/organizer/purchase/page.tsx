import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requirePageUser } from '@/lib/page-access';
import { PurchasePackageForm } from '@/components/organizer/PurchasePackageForm';

export const dynamic = 'force-dynamic';

export default async function PurchasePage() {
  const user = await requirePageUser(); const now = new Date();
  const [packages, tournaments, purchases] = await Promise.all([
    prisma.tournamentPackage.findMany({ orderBy: { displayOrder: 'asc' }, include: { prices: { where: { status: 'ACTIVE', effectiveFrom: { lte: now }, OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }] }, orderBy: { version: 'desc' }, take: 1, select: { id: true, price: true, currency: true } } } }),
    prisma.tournament.findMany({ where: { ownerId: user.id }, select: { id: true, name: true }, orderBy: { createdAt: 'desc' } }),
    prisma.tournamentPurchase.findMany({ where: { purchaserUserId: user.id }, select: { id: true, packageNameSnapshot: true, priceSnapshot: true, currencySnapshot: true, paymentReference: true, approvalStatus: true, purchasedAt: true }, orderBy: { purchasedAt: 'desc' }, take: 10 }),
  ]);
  const available = packages.filter((item) => item.prices.length > 0);
  return <main className="mx-auto max-w-5xl p-6"><Link href="/organizer/dashboard" className="text-emerald-700 underline">Dashboard</Link><h1 className="mt-4 text-3xl font-bold">Purchase a tournament package</h1><p className="mb-6 text-slate-600">Submit your payment reference for platform review.</p>{available.length ? <PurchasePackageForm packages={available} tournaments={tournaments} /> : <p className="rounded border p-4 text-slate-600">No packages are currently available.</p>}<section className="mt-8"><h2 className="text-xl font-bold">Recent purchases</h2><div className="mt-3 overflow-x-auto rounded border bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Package</th><th className="p-3">Amount</th><th className="p-3">Reference</th><th className="p-3">Status</th></tr></thead><tbody>{purchases.map((item) => <tr key={item.id} className="border-t"><td className="p-3">{item.packageNameSnapshot}</td><td className="p-3">{item.currencySnapshot} {item.priceSnapshot.toString()}</td><td className="p-3">{item.paymentReference}</td><td className="p-3">{item.approvalStatus}</td></tr>)}{!purchases.length && <tr><td colSpan={4} className="p-4 text-slate-600">No purchases submitted.</td></tr>}</tbody></table></div></section></main>;
}
