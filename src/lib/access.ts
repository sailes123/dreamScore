import { auth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError(401, 'UNAUTHENTICATED', 'Sign in is required.');
  return session.user;
}

export function requirePlatformAdmin(role: string) {
  if (role !== 'PLATFORM_ADMIN') throw new ApiError(403, 'FORBIDDEN', 'Platform administrator access is required.');
}

export async function requireTournamentManager(tournamentId: string) {
  const user = await requireUser();
  const tournament = await prisma.tournament.findFirst({
    where: { id: tournamentId, OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, status: 'ACTIVE' } } }] },
    select: { id: true, ownerId: true, status: true, invitationCode: true, structureLockedAt: true },
  });
  if (!tournament) throw new ApiError(404, 'TOURNAMENT_NOT_FOUND', 'Tournament was not found or you do not have access.');
  return { user, tournament };
}
