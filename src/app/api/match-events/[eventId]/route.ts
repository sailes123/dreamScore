import { z } from 'zod';
import { apiError, ok, parseJson } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { requireTournamentManager } from '@/lib/access';
import { prisma } from '@/lib/prisma';
import { deriveMatchScore } from '@/lib/match-scoring';

const correctionSchema = z.object({
  teamId: z.string().cuid().optional(),
  playerId: z.string().cuid().nullable().optional(),
  secondaryPlayerId: z.string().cuid().nullable().optional(),
  eventType: z.string().trim().min(1).max(50).optional(),
  minute: z.number().int().min(0).max(1000).optional(),
  period: z.string().trim().min(1).max(30).optional(),
  additionalTime: z.number().int().min(0).max(99).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  correctionReason: z.string().trim().min(5).max(1000),
}).refine((value) => Object.keys(value).some((key) => key !== 'correctionReason'), 'Provide at least one corrected field.');

export async function DELETE(_: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params; const event = await prisma.matchEvent.findUnique({ where: { id: eventId }, include: { match: { select: { id: true, tournamentId: true, homeTeamId: true, awayTeamId: true, status: true } } } });
    if (!event) throw new ApiError(404, 'EVENT_NOT_FOUND', 'Match event not found.');
    const { user } = await requireTournamentManager(event.tournamentId);
    if (event.match.status === 'COMPLETED') throw new ApiError(409, 'MATCH_COMPLETED', 'Completed-match events require a dedicated correction workflow.');
    await prisma.$transaction(async (tx) => {
      await tx.matchEvent.delete({ where: { id: eventId } });
      const remaining = await tx.matchEvent.findMany({ where: { matchId: event.matchId }, select: { teamId: true, eventType: true } });
      const score = deriveMatchScore(remaining, event.match.homeTeamId, event.match.awayTeamId);
      await tx.match.update({ where: { id: event.matchId }, data: score });
      await tx.auditLog.create({ data: { userId: user.id, tournamentId: event.tournamentId, action: 'MATCH_EVENT_DELETED', entityType: 'MATCH_EVENT', entityId: eventId, oldValue: { eventType: event.eventType, matchId: event.matchId } } });
    });
    return new Response(null, { status: 204 });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const event = await prisma.matchEvent.findUnique({
      where: { id: eventId },
      include: { match: { select: { id: true, tournamentId: true, homeTeamId: true, awayTeamId: true, status: true } } },
    });
    if (!event) throw new ApiError(404, 'EVENT_NOT_FOUND', 'Match event not found.');
    const { user } = await requireTournamentManager(event.tournamentId);
    if (event.match.status !== 'COMPLETED') throw new ApiError(409, 'MATCH_NOT_COMPLETED', 'Use the normal event workflow until a match is completed.');
    const input = await parseJson(request, correctionSchema);
    const { correctionReason, ...changes } = input;
    const teamId = changes.teamId ?? event.teamId;
    if (![event.match.homeTeamId, event.match.awayTeamId].includes(teamId)) throw new ApiError(422, 'INVALID_TEAM', 'Event team is not playing in this match.');
    const playerId = changes.playerId === undefined ? event.playerId : changes.playerId;
    const secondaryPlayerId = changes.secondaryPlayerId === undefined ? event.secondaryPlayerId : changes.secondaryPlayerId;
    for (const [playerIdToCheck, code] of [[playerId, 'INVALID_PLAYER'], [secondaryPlayerId, 'INVALID_SECONDARY_PLAYER']] as const) {
      if (playerIdToCheck) {
        const player = await prisma.player.findFirst({ where: { id: playerIdToCheck, teamId, tournamentId: event.tournamentId }, select: { id: true } });
        if (!player) throw new ApiError(422, code, 'Players must belong to the corrected event team in this tournament.');
      }
    }
    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.matchEvent.update({ where: { id: eventId }, data: changes });
      const events = await tx.matchEvent.findMany({ where: { matchId: event.matchId }, select: { teamId: true, eventType: true } });
      const score = deriveMatchScore(events, event.match.homeTeamId, event.match.awayTeamId);
      await tx.match.update({ where: { id: event.matchId }, data: score });
      await tx.auditLog.create({ data: { userId: user.id, tournamentId: event.tournamentId, action: 'COMPLETED_MATCH_EVENT_CORRECTED', entityType: 'MATCH_EVENT', entityId: eventId, oldValue: { eventType: event.eventType, teamId: event.teamId }, newValue: { ...changes, correctionReason } } });
      return item;
    });
    return ok(updated);
  } catch (error) { return apiError(error); }
}
