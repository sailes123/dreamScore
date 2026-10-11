import { z } from 'zod';
import { apiError, created, ok, parseJson } from '@/lib/api';
import { requireTournamentManager } from '@/lib/access';
import { prisma } from '@/lib/prisma';

const playerSchema = z.object({
  teamId: z.string().cuid(), firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), displayName: z.string().trim().min(2).max(160),
  jerseyNumber: z.number().int().min(0).max(999), position: z.string().trim().min(1).max(60), isCaptain: z.boolean().default(false), isGoalkeeper: z.boolean().default(false),
  dateOfBirth: z.coerce.date().optional(), nationality: z.string().trim().max(80).optional(), notes: z.string().trim().max(5000).optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ tournamentId: string }> }) {
  try { const { tournamentId } = await params; await requireTournamentManager(tournamentId); return ok(await prisma.player.findMany({ where: { tournamentId }, include: { team: { select: { id: true, name: true } } }, orderBy: [{ team: { name: 'asc' } }, { jerseyNumber: 'asc' }] })); }
  catch (error) { return apiError(error); }
}

export async function POST(request: Request, { params }: { params: Promise<{ tournamentId: string }> }) {
  try {
    const { tournamentId } = await params; const { user, tournament } = await requireTournamentManager(tournamentId); const input = await parseJson(request, playerSchema);
    if (tournament.structureLockedAt) return Response.json({ error: { code: 'STRUCTURE_LOCKED', message: 'Players cannot be changed after tournament structure is locked.' } }, { status: 409 });
    const team = await prisma.team.findFirst({ where: { id: input.teamId, tournamentId }, select: { id: true } });
    if (!team) return Response.json({ error: { code: 'TEAM_NOT_FOUND', message: 'Team does not belong to this tournament.' } }, { status: 422 });
    const player = await prisma.$transaction(async (tx) => {
      const item = await tx.player.create({ data: { ...input, tournamentId } });
      await tx.auditLog.create({ data: { userId: user.id, tournamentId, action: 'PLAYER_REGISTERED', entityType: 'PLAYER', entityId: item.id, newValue: { displayName: item.displayName, teamId: item.teamId } } });
      return item;
    });
    return created(player);
  } catch (error) { return apiError(error); }
}
