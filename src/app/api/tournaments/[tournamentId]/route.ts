import { z } from 'zod';
import { TournamentStatus } from '@prisma/client';
import { apiError, ok, parseJson } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { requireTournamentManager } from '@/lib/access';
import { prisma } from '@/lib/prisma';
import { canTransitionTournamentStatus } from '@/lib/tournament-status';
import { randomBytes } from 'crypto';

const updateSchema = z.object({
  name: z.string().trim().min(3).max(150).optional(), description: z.string().trim().min(1).max(10_000).optional(),
  status: z.nativeEnum(TournamentStatus).optional(), registrationOpenAt: z.coerce.date().nullable().optional(), registrationCloseAt: z.coerce.date().nullable().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(), invitationCode: z.string().trim().min(6).max(100).nullable().optional(),
}).refine((input) => Object.keys(input).length > 0, 'Provide at least one field.');

export async function GET(_: Request, { params }: { params: Promise<{ tournamentId: string }> }) {
  try {
    const { tournamentId } = await params; await requireTournamentManager(tournamentId);
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId }, include: { venues: { include: { courts: true } }, members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } }, _count: { select: { teams: true, matches: true } } } });
    return ok(tournament);
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ tournamentId: string }> }) {
  try {
    const { tournamentId } = await params; const { user, tournament } = await requireTournamentManager(tournamentId); const input = await parseJson(request, updateSchema);
    if (tournament.structureLockedAt && ('name' in input || 'visibility' in input)) throw new ApiError(409, 'STRUCTURE_LOCKED', 'Tournament structure is locked after live play has begun.');
    if (input.status && !canTransitionTournamentStatus(tournament.status, input.status)) throw new ApiError(409, 'INVALID_STATUS_TRANSITION', 'That tournament status transition is not allowed.');
    const data = {
      ...input,
      invitationCode: input.visibility === 'PUBLIC' ? null : input.visibility === 'PRIVATE' && !input.invitationCode && !tournament.invitationCode ? randomBytes(18).toString('base64url') : input.invitationCode,
    };
    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.tournament.update({ where: { id: tournamentId }, data });
      const { invitationCode: _, ...auditValue } = data;
      await tx.auditLog.create({ data: { userId: user.id, tournamentId, action: 'TOURNAMENT_UPDATED', entityType: 'TOURNAMENT', entityId: tournamentId, newValue: auditValue } });
      return item;
    });
    return ok(updated);
  } catch (error) { return apiError(error); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ tournamentId: string }> }) {
  try {
    const { tournamentId } = await params; const { user, tournament } = await requireTournamentManager(tournamentId);
    if (tournament.ownerId !== user.id) throw new ApiError(403, 'OWNER_REQUIRED', 'Only the tournament owner may delete it.');
    await prisma.tournament.delete({ where: { id: tournamentId } });
    return new Response(null, { status: 204 });
  } catch (error) { return apiError(error); }
}
