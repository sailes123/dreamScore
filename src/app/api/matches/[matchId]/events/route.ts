import { z } from 'zod';
import { apiError, created, parseJson } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { requireTournamentManager } from '@/lib/access';
import { prisma } from '@/lib/prisma';
import { scoringPoints } from '@/lib/match-scoring';

const eventSchema = z.object({ teamId: z.string().cuid(), playerId: z.string().cuid().optional(), secondaryPlayerId: z.string().cuid().optional(), eventType: z.string().trim().min(1).max(50), minute: z.number().int().min(0).max(1000), period: z.string().trim().min(1).max(30), additionalTime: z.number().int().min(0).max(99).optional(), notes: z.string().trim().max(2000).optional() });
export async function POST(request: Request, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const { matchId } = await params; const match = await prisma.match.findUnique({ where: { id: matchId }, select: { id: true, tournamentId: true, homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true, status: true } });
    if (!match) throw new ApiError(404, 'MATCH_NOT_FOUND', 'Match not found.');
    const { user } = await requireTournamentManager(match.tournamentId); const input = await parseJson(request, eventSchema);
    if (!['LIVE', 'HALFTIME'].includes(match.status)) throw new ApiError(409, 'MATCH_NOT_LIVE', 'Events can only be recorded for a live match.');
    if (![match.homeTeamId, match.awayTeamId].includes(input.teamId)) throw new ApiError(422, 'INVALID_TEAM', 'Event team is not playing in this match.');
    if (input.playerId) {
      const player = await prisma.player.findFirst({ where: { id: input.playerId, teamId: input.teamId, tournamentId: match.tournamentId }, select: { id: true } });
      if (!player) throw new ApiError(422, 'INVALID_PLAYER', 'The player must belong to the event team in this tournament.');
    }
    if (input.secondaryPlayerId) {
      const player = await prisma.player.findFirst({ where: { id: input.secondaryPlayerId, teamId: input.teamId, tournamentId: match.tournamentId }, select: { id: true } });
      if (!player) throw new ApiError(422, 'INVALID_SECONDARY_PLAYER', 'The secondary player must belong to the event team in this tournament.');
    }
    const points = scoringPoints[input.eventType] ?? 0; const isHome = input.teamId === match.homeTeamId;
    const event = await prisma.$transaction(async (tx) => {
      const item = await tx.matchEvent.create({ data: { ...input, matchId, tournamentId: match.tournamentId } });
      if (input.eventType === 'OWN_GOAL') await tx.match.update({ where: { id: matchId }, data: isHome ? { awayScore: { increment: 1 } } : { homeScore: { increment: 1 } } });
      else if (points) await tx.match.update({ where: { id: matchId }, data: isHome ? { homeScore: { increment: points } } : { awayScore: { increment: points } } });
      await tx.auditLog.create({ data: { userId: user.id, tournamentId: match.tournamentId, action: 'MATCH_EVENT_ADDED', entityType: 'MATCH_EVENT', entityId: item.id, newValue: { eventType: input.eventType, matchId } } });
      return item;
    });
    return created(event);
  } catch (error) { return apiError(error); }
}
