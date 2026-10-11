import { apiError, ok } from '@/lib/api';
import { requirePlatformAdmin, requireUser } from '@/lib/access';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireUser();
    requirePlatformAdmin(user.role);
    const purchases = await prisma.tournamentPurchase.findMany({
      include: { purchaser: { select: { name: true, email: true } }, tournament: { select: { name: true, slug: true } } },
      orderBy: [{ approvalStatus: 'asc' }, { purchasedAt: 'desc' }],
    });
    return ok(purchases);
  } catch (error) { return apiError(error); }
}
