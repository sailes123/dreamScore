import { createHash, randomBytes } from 'crypto';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { apiError, ok, parseJson } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { ApiError } from '@/lib/api';
import { logError } from '@/lib/logger';
import { enforceRateLimit } from '@/lib/rate-limit';

const requestSchema = z.object({ email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()) });
const resetSchema = z.object({ token: z.string().min(20).max(200), password: z.string().min(12).max(72) });
const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, 'password-reset-request', 5, 60 * 60 * 1000);
    const input = await parseJson(request, requestSchema); const user = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true, email: true } });
    if (user && process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      const token = randomBytes(32).toString('base64url'); const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
      await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: tokenHash(token), expiresAt } });
      const origin = new URL(request.url).origin;
      await sendPasswordResetEmail(user.email, `${origin}/reset-password?token=${encodeURIComponent(token)}`);
    }
    return ok({ requested: true });
  } catch (error) { logError('auth.password_reset_request_failed', error); return ok({ requested: true }); }
}

export async function PATCH(request: Request) {
  try {
    enforceRateLimit(request, 'password-reset-confirm', 10, 60 * 60 * 1000);
    const input = await parseJson(request, resetSchema); const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: tokenHash(input.token) }, select: { id: true, userId: true, expiresAt: true, usedAt: true } });
    if (!record || record.usedAt || record.expiresAt <= new Date()) throw new ApiError(422, 'INVALID_RESET_TOKEN', 'This password-reset link is invalid or has expired.');
    await prisma.$transaction(async (tx) => { await tx.user.update({ where: { id: record.userId }, data: { passwordHash: await hash(input.password, 12) } }); await tx.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }); await tx.passwordResetToken.deleteMany({ where: { userId: record.userId, usedAt: null } }); await tx.auditLog.create({ data: { userId: record.userId, action: 'PASSWORD_RESET', entityType: 'USER', entityId: record.userId } }); });
    return ok({ reset: true });
  } catch (error) { return apiError(error); }
}
