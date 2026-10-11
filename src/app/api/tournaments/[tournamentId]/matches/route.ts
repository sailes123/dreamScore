import { z } from 'zod';
import { MatchStage } from '@prisma/client';
import { apiError, created, ok, parseJson } from '@/lib/api';
import { requireTournamentManager } from '@/lib/access';
import { prisma } from '@/lib/prisma';

const matchSchema = z.object({
  matchNumber: z.number().int().min(1), stage: z.nativeEnum(MatchStage), roundName: z.string().trim().min(1).max(100), groupCode: z.string().trim().max(20).optional(),
  homeTeamId: z.string().cuid().optional(), awayTeamId: z.string().cuid().optional(), venueName: z.string().trim().min(1).max(100), courtName: z.string().trim().min(1).max(100), scheduledAt: z.coerce.date(),
}).refine((value) => !value.homeTeamId || value.homeTeamId !== value.awayTeamId, { message: 'A team cannot play itself.', path: ['awayTeamId'] });

export async function GET(_: Request, { params }: { params: Promise<{ tournamentId: string }> }) {
  try { const { tournamentId } = await params; await requireTournamentManager(tournamentId); return ok(await prisma.match.findMany({ where: { tournamentId }, include: { homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } }, events: { orderBy: { createdAt: 'asc' } } }, orderBy: { matchNumber: 'asc' } })); }
  catch (error) { return apiError(error); }
}

export async function POST(request: Request, { params }: { params: Promise<{ tournamentId: string }> }) {
  try {
    const { tournamentId } = await params; const { user, tournament } = await requireTournamentManager(tournamentId); const input = await parseJson(request, matchSchema);
    if (tournament.structureLockedAt) return Response.json({ error: { code: 'STRUCTURE_LOCKED', message: 'Fixtures cannot be changed after live play has begun.' } }, { status: 409 });
    const teamIds = [input.homeTeamId, input.awayTeamId].filter(Boolean) as string[];
    if (teamIds.length && await prisma.team.count({ where: { tournamentId, id: { in: teamIds } } }) !== teamIds.length) return Response.json({ error: { code: 'INVALID_TEAM', message: 'Fixture teams must belong to this tournament.' } }, { status: 422 });
    const venue = await prisma.venue.findFirst({ where: { tournamentId, name: input.venueName }, include: { courts: { where: { name: input.courtName }, select: { id: true } } } });
    if (!venue || !venue.courts.length) return Response.json({ error: { code: 'INVALID_COURT', message: 'Select a court belonging to this tournament venue.' } }, { status: 422 });
    const match = await prisma.$transaction(async (tx) => {
      const item = await tx.match.create({ data: { ...input, tournamentId } });
      await tx.auditLog.create({ data: { userId: user.id, tournamentId, action: 'FIXTURE_CREATED', entityType: 'MATCH', entityId: item.id, newValue: { matchNumber: item.matchNumber } } });
      return item;
    });
    return created(match);
  } catch (error) { return apiError(error); }
}
