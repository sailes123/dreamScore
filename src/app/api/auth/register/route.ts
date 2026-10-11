import { hash } from 'bcryptjs';
import { z } from 'zod';
import { Prisma, SystemRole } from '@prisma/client';
import { apiError, created, parseJson } from '@/lib/api';
import { prisma } from '@/lib/prisma';

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  password: z.string().min(12, 'Password must be at least 12 characters.').max(72),
});

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, registrationSchema);
    const { password, ...userInput } = input;
    const passwordHash = await hash(password, 12);
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({ data: { ...userInput, passwordHash, role: SystemRole.ORGANIZER } });
      await tx.auditLog.create({ data: {
        userId: createdUser.id, action: 'USER_REGISTERED', entityType: 'USER', entityId: createdUser.id,
        newValue: { email: createdUser.email, role: createdUser.role },
      } });
      return createdUser;
    });
    return created({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return Response.json({ error: { code: 'EMAIL_IN_USE', message: 'An account with this email already exists.' } }, { status: 409 });
    }
    return apiError(error);
  }
}
