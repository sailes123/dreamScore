import { z } from 'zod';
import { apiError, ok, parseJson } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { requirePlatformAdmin, requireUser } from '@/lib/access';
import { prisma } from '@/lib/prisma';
const schema = z.object({ approved: z.boolean(), notes: z.string().trim().max(5000).optional() });
export async function PATCH(request: Request, { params }: { params: Promise<{ purchaseId: string }> }) {
  try {
    const user = await requireUser(); requirePlatformAdmin(user.role);
    const { purchaseId } = await params; const input = await parseJson(request, schema);
    const purchase = await prisma.tournamentPurchase.findUnique({ where: { id: purchaseId }, select: { id: true, tournamentId: true, approvalStatus: true } });
    if (!purchase) throw new ApiError(404, 'PURCHASE_NOT_FOUND', 'Purchase not found.');
    if (purchase.approvalStatus !== 'PENDING') throw new ApiError(409, 'PURCHASE_DECIDED', 'This purchase has already been reviewed.');
    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.tournamentPurchase.update({ where: { id: purchaseId }, data: { approvalStatus: input.approved ? 'APPROVED' : 'REJECTED', paymentStatus: input.approved ? 'PAID' : 'REJECTED', verifiedById: user.id, verifiedAt: new Date(), paymentNotes: input.notes } });
      await tx.auditLog.create({ data: { userId: user.id, tournamentId: purchase.tournamentId ?? undefined, action: input.approved ? 'PURCHASE_APPROVED' : 'PURCHASE_REJECTED', entityType: 'TOURNAMENT_PURCHASE', entityId: purchaseId, newValue: { notes: input.notes } } });
      return item;
    });
    return ok(updated);
  } catch (error) { return apiError(error); }
}
