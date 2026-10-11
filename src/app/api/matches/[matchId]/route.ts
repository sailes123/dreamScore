import { z } from 'zod';
import { MatchStatus } from '@prisma/client';
import { apiError, ok, parseJson } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { requireTournamentManager } from '@/lib/access';
import { prisma } from '@/lib/prisma';

const stateSchema = z.object({ status: z.nativeEnum(MatchStatus).optional(), currentPeriod: z.number().int().min(1).max(20).nullable().optional(), currentMinute: z.number().int().min(0).max(1000).nullable().optional(), refereeNotes: z.string().trim().max(5000).nullable().optional(), roundName: z.string().trim().min(1).max(100).optional(), groupCode: z.string().trim().max(20).nullable().optional(), venueName: z.string().trim().min(1).max(100).optional(), courtName: z.string().trim().min(1).max(100).optional(), scheduledAt: z.coerce.date().optional() }).refine((value) => Object.keys(value).length > 0, 'Provide at least one field.');

export async function PATCH(request: Request, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const { matchId } = await params; const match = await prisma.match.findUnique({ where: { id: matchId }, select: { id: true, tournamentId: true, status: true } });
    if (!match) throw new ApiError(404, 'MATCH_NOT_FOUND', 'Match not found.');
    const { user, tournament } = await requireTournamentManager(match.tournamentId); const input = await parseJson(request, stateSchema);
    const isFixtureEdit = ['roundName', 'groupCode', 'venueName', 'courtName', 'scheduledAt'].some((key) => key in input);
    if (isFixtureEdit && (tournament.structureLockedAt || !['SCHEDULED', 'READY'].includes(match.status))) throw new ApiError(409, 'FIXTURE_LOCKED', 'Fixtures may only be edited before live play begins.');
    const updated = await prisma.$transaction(async (tx) => {
      const now = new Date(); const startsNow = input.status === 'LIVE' && !['LIVE', 'HALFTIME', 'COMPLETED'].includes(match.status);
      const endsNow = input.status === 'COMPLETED' && match.status !== 'COMPLETED';
      const item = await tx.match.update({ where: { id: matchId }, data: { ...input, actualStart: startsNow ? now : undefined, actualEnd: endsNow ? now : undefined } });
      if (startsNow) await tx.tournament.update({ where: { id: match.tournamentId }, data: { structureLockedAt: now } });
      await tx.auditLog.create({ data: { userId: user.id, tournamentId: match.tournamentId, action: isFixtureEdit ? 'FIXTURE_UPDATED' : 'MATCH_STATE_UPDATED', entityType: 'MATCH', entityId: matchId, oldValue: { status: match.status }, newValue: input } });
      return item;
    });
    return ok(updated);
  } catch (error) { return apiError(error); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const { matchId } = await params; const match = await prisma.match.findUnique({ where: { id: matchId }, select: { id: true, tournamentId: true, status: true } });
    if (!match) throw new ApiError(404, 'MATCH_NOT_FOUND', 'Match not found.');
    const { user, tournament } = await requireTournamentManager(match.tournamentId);
    if (tournament.structureLockedAt || !['SCHEDULED', 'READY'].includes(match.status)) throw new ApiError(409, 'FIXTURE_LOCKED', 'Only scheduled fixtures may be deleted before live play begins.');
    await prisma.$transaction(async (tx) => { await tx.match.delete({ where: { id: matchId } }); await tx.auditLog.create({ data: { userId: user.id, tournamentId: match.tournamentId, action: 'FIXTURE_DELETED', entityType: 'MATCH', entityId: matchId } }); });
    return new Response(null, { status: 204 });
  } catch (error) { return apiError(error); }
}
