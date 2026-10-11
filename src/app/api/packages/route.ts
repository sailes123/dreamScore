import { apiError, ok } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const packages = await prisma.tournamentPackage.findMany({
      orderBy: { displayOrder: 'asc' },
      include: { prices: { where: { status: 'ACTIVE', effectiveFrom: { lte: now }, OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }] }, orderBy: { version: 'desc' }, take: 1, select: { id: true, price: true, currency: true, effectiveFrom: true } } },
    });
    return ok(packages.filter((item) => item.prices.length > 0));
  } catch (error) { return apiError(error); }
}
