import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';
import { apiError, ok, parseJson } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { requireTournamentManager } from '@/lib/access';
import { prisma } from '@/lib/prisma';

const updateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(), shortName: z.string().trim().min(2).max(20).optional(), groupCode: z.string().trim().max(20).nullable().optional(), logoText: z.string().trim().max(10).nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(), secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(), managerName: z.string().trim().min(2).max(100).optional(), managerPhone: z.string().trim().min(5).max(30).optional(), managerEmail: z.string().trim().email().max(320).optional(),
  registrationFee: z.number().min(0).max(10_000_000).optional(), amountReceived: z.number().min(0).max(10_000_000).optional(), paymentMethod: z.nativeEnum(PaymentMethod).nullable().optional(), paymentReference: z.string().trim().max(200).nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, 'Provide at least one field.');

async function getTeam(teamId: string) { const team = await prisma.team.findUnique({ where: { id: teamId }, select: { id: true, tournamentId: true, registrationFee: true, amountReceived: true } }); if (!team) throw new ApiError(404, 'TEAM_NOT_FOUND', 'Team not found.'); return team; }

export async function PATCH(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params; const team = await getTeam(teamId); const { user, tournament } = await requireTournamentManager(team.tournamentId); const input = await parseJson(request, updateSchema);
    if (tournament.structureLockedAt) throw new ApiError(409, 'STRUCTURE_LOCKED', 'Teams cannot be changed after tournament structure is locked.');
    const registrationFee = input.registrationFee ?? Number(team.registrationFee); const amountReceived = input.amountReceived ?? Number(team.amountReceived);
    const paymentStatus = amountReceived >= registrationFee ? 'PAID' : amountReceived > 0 ? 'PARTIALLY_PAID' : 'UNPAID';
    const updated = await prisma.$transaction(async (tx) => { const item = await tx.team.update({ where: { id: teamId }, data: { ...input, paymentStatus } }); await tx.auditLog.create({ data: { userId: user.id, tournamentId: team.tournamentId, action: 'TEAM_UPDATED', entityType: 'TEAM', entityId: teamId, newValue: input } }); return item; });
    return ok(updated);
  } catch (error) { return apiError(error); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try { const { teamId } = await params; const team = await getTeam(teamId); const { user, tournament } = await requireTournamentManager(team.tournamentId); if (tournament.structureLockedAt) throw new ApiError(409, 'STRUCTURE_LOCKED', 'Teams cannot be changed after tournament structure is locked.'); await prisma.$transaction(async (tx) => { await tx.team.delete({ where: { id: teamId } }); await tx.auditLog.create({ data: { userId: user.id, tournamentId: team.tournamentId, action: 'TEAM_DELETED', entityType: 'TEAM', entityId: teamId } }); }); return new Response(null, { status: 204 }); }
  catch (error) { return apiError(error); }
}
