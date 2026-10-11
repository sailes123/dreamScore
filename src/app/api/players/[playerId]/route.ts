import { z } from 'zod';
import { apiError, ok, parseJson } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { requireTournamentManager } from '@/lib/access';
import { prisma } from '@/lib/prisma';

const updateSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(), lastName: z.string().trim().min(1).max(80).optional(), displayName: z.string().trim().min(2).max(160).optional(), jerseyNumber: z.number().int().min(0).max(999).optional(), position: z.string().trim().min(1).max(60).optional(),
  isCaptain: z.boolean().optional(), isGoalkeeper: z.boolean().optional(), dateOfBirth: z.coerce.date().nullable().optional(), nationality: z.string().trim().max(80).nullable().optional(), notes: z.string().trim().max(5000).nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, 'Provide at least one field.');

async function getPlayer(playerId: string) { const player = await prisma.player.findUnique({ where: { id: playerId }, select: { id: true, tournamentId: true } }); if (!player) throw new ApiError(404, 'PLAYER_NOT_FOUND', 'Player not found.'); return player; }

export async function PATCH(request: Request, { params }: { params: Promise<{ playerId: string }> }) {
  try { const { playerId } = await params; const player = await getPlayer(playerId); const { user, tournament } = await requireTournamentManager(player.tournamentId); const input = await parseJson(request, updateSchema); if (tournament.structureLockedAt) throw new ApiError(409, 'STRUCTURE_LOCKED', 'Players cannot be changed after tournament structure is locked.'); const updated = await prisma.$transaction(async (tx) => { const item = await tx.player.update({ where: { id: playerId }, data: input }); await tx.auditLog.create({ data: { userId: user.id, tournamentId: player.tournamentId, action: 'PLAYER_UPDATED', entityType: 'PLAYER', entityId: playerId, newValue: input } }); return item; }); return ok(updated); }
  catch (error) { return apiError(error); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ playerId: string }> }) {
  try { const { playerId } = await params; const player = await getPlayer(playerId); const { user, tournament } = await requireTournamentManager(player.tournamentId); if (tournament.structureLockedAt) throw new ApiError(409, 'STRUCTURE_LOCKED', 'Players cannot be changed after tournament structure is locked.'); await prisma.$transaction(async (tx) => { await tx.player.delete({ where: { id: playerId } }); await tx.auditLog.create({ data: { userId: user.id, tournamentId: player.tournamentId, action: 'PLAYER_DELETED', entityType: 'PLAYER', entityId: playerId } }); }); return new Response(null, { status: 204 }); }
  catch (error) { return apiError(error); }
}
