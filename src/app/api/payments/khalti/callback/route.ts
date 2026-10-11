import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { lookupKhaltiPayment } from '@/lib/payments';

export async function GET(request: Request) {
  const url = new URL(request.url); const pidx = url.searchParams.get('pidx');
  const destination = new URL('/organizer/purchase', url.origin);
  if (!pidx) { destination.searchParams.set('payment', 'invalid'); return NextResponse.redirect(destination); }
  try {
    const purchase = await prisma.tournamentPurchase.findFirst({ where: { providerPaymentId: pidx, paymentProvider: 'KHALTI' }, select: { id: true, priceSnapshot: true, paymentStatus: true, tournamentId: true } });
    if (!purchase) { destination.searchParams.set('payment', 'unknown'); return NextResponse.redirect(destination); }
    const result = await lookupKhaltiPayment(pidx);
    if (result.status === 'Completed' && result.total_amount === Math.round(Number(purchase.priceSnapshot) * 100)) {
      await prisma.$transaction(async (tx) => { await tx.tournamentPurchase.update({ where: { id: purchase.id }, data: { paymentStatus: 'PAID', approvalStatus: 'APPROVED', verifiedAt: new Date(), paymentReference: result.transaction_id ?? pidx } }); await tx.auditLog.create({ data: { userId: (await tx.tournamentPurchase.findUniqueOrThrow({ where: { id: purchase.id }, select: { purchaserUserId: true } })).purchaserUserId, tournamentId: purchase.tournamentId ?? undefined, action: 'KHALTI_PAYMENT_VERIFIED', entityType: 'TOURNAMENT_PURCHASE', entityId: purchase.id } }); });
      destination.searchParams.set('payment', 'success');
    } else destination.searchParams.set('payment', 'pending');
  } catch (error) { console.error('Khalti callback verification failed', error); destination.searchParams.set('payment', 'error'); }
  return NextResponse.redirect(destination);
}
