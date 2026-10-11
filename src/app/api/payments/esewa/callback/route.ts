import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type EsewaPayload = { status?: string; signature?: string; signed_field_names?: string; total_amount?: string | number; transaction_uuid?: string; product_code?: string; transaction_code?: string };
const signatureFor = (payload: EsewaPayload, secret: string) => {
  const names = payload.signed_field_names ?? 'total_amount,transaction_uuid,product_code';
  return createHmac('sha256', secret).update(names.split(',').map((name) => `${name}=${String(payload[name.trim() as keyof EsewaPayload] ?? '')}`).join(',')).digest('base64');
};

export async function GET(request: Request) {
  const url = new URL(request.url); const destination = new URL('/organizer/purchase', url.origin); const encoded = url.searchParams.get('data');
  try {
    if (!encoded || !process.env.ESEWA_SECRET_KEY || !process.env.ESEWA_PRODUCT_CODE) throw new Error('Invalid eSewa callback.');
    const payload = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) as EsewaPayload;
    const expected = signatureFor(payload, process.env.ESEWA_SECRET_KEY); const received = payload.signature ?? '';
    if (expected.length !== received.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(received))) throw new Error('Invalid eSewa signature.');
    if (payload.status !== 'COMPLETE' || payload.product_code !== process.env.ESEWA_PRODUCT_CODE || !payload.transaction_uuid) throw new Error('Incomplete eSewa payment.');
    const purchase = await prisma.tournamentPurchase.findFirst({ where: { id: payload.transaction_uuid, paymentProvider: 'ESEWA' }, select: { id: true, priceSnapshot: true, purchaserUserId: true, tournamentId: true } });
    if (!purchase || Number(payload.total_amount) !== Number(purchase.priceSnapshot)) throw new Error('eSewa amount mismatch.');
    await prisma.$transaction(async (tx) => { await tx.tournamentPurchase.update({ where: { id: purchase.id }, data: { paymentStatus: 'PAID', approvalStatus: 'APPROVED', verifiedAt: new Date(), paymentReference: payload.transaction_code ?? purchase.id } }); await tx.auditLog.create({ data: { userId: purchase.purchaserUserId, tournamentId: purchase.tournamentId ?? undefined, action: 'ESEWA_PAYMENT_VERIFIED', entityType: 'TOURNAMENT_PURCHASE', entityId: purchase.id } }); });
    destination.searchParams.set('payment', 'success');
  } catch (error) { console.error('eSewa callback verification failed', error); destination.searchParams.set('payment', 'error'); }
  return NextResponse.redirect(destination);
}
