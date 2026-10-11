import { compare, hash } from 'bcryptjs';
import { z } from 'zod';
import { apiError, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/lib/access';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12, 'New password must be at least 12 characters.').max(72),
}).refine((input) => input.currentPassword !== input.newPassword, { message: 'Choose a different new password.', path: ['newPassword'] });

export async function PATCH(request: Request) {
  try {
    const user = await requireUser(); const input = await parseJson(request, passwordSchema);
    const account = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
    if (!account || !(await compare(input.currentPassword, account.passwordHash))) throw new ApiError(422, 'INVALID_CURRENT_PASSWORD', 'Your current password is incorrect.');
    const passwordHash = await hash(input.newPassword, 12);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { passwordHash } });
      await tx.auditLog.create({ data: { userId: user.id, action: 'PASSWORD_CHANGED', entityType: 'USER', entityId: user.id } });
    });
    return ok({ changed: true });
  } catch (error) { return apiError(error); }
}
