import { z } from 'zod';
import { PaymentMethod, PaymentProvider } from '@prisma/client';
import { apiError, created, parseJson } from '@/lib/api';
import { requireUser } from '@/lib/access';
import { prisma } from '@/lib/prisma';
import { createEsewaCheckout } from '@/lib/payments';
import { enforceRateLimit } from '@/lib/rate-limit';

const schema = z.object({ packagePriceId: z.string().cuid(), tournamentId: z.string().cuid().optional(), provider: z.literal('ESEWA') });
export async function POST(request: Request) { try {
  enforceRateLimit(request, 'payment-checkout', 10, 15 * 60 * 1000);
  const user = await requireUser(); const input = await parseJson(request, schema); const price = await prisma.tournamentPackagePrice.findFirst({ where: { id: input.packagePriceId, status: 'ACTIVE', effectiveFrom: { lte: new Date() }, OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: new Date() } }] }, include: { package: true } });
  if (!price) return Response.json({ error: { code: 'PRICE_UNAVAILABLE', message: 'This package price is unavailable.' } }, { status: 422 });
  if (input.tournamentId && !await prisma.tournament.findFirst({ where: { id: input.tournamentId, ownerId: user.id }, select: { id: true } })) return Response.json({ error: { code: 'TOURNAMENT_NOT_FOUND', message: 'You can only purchase for your own tournament.' } }, { status: 422 });
  const purchase = await prisma.tournamentPurchase.create({ data: { purchaserUserId: user.id, tournamentId: input.tournamentId, packageId: price.packageId, packagePriceId: price.id, packageNameSnapshot: price.package.name, packageDurationSnapshot: price.package.duration, priceSnapshot: price.price, currencySnapshot: price.currency, paymentMethod: PaymentMethod.DIGITAL_WALLET, paymentProvider: input.provider as PaymentProvider, paymentReference: 'CHECKOUT_PENDING' } });
  const checkout = createEsewaCheckout({ purchaseId: purchase.id, amount: price.price.toString() }); const updated = await prisma.tournamentPurchase.update({ where: { id: purchase.id }, data: { providerPaymentId: purchase.id, checkoutUrl: checkout.action, paymentReference: purchase.id } }); return created({ purchase: updated, esewaForm: checkout });
} catch (error) { return apiError(error); } }
