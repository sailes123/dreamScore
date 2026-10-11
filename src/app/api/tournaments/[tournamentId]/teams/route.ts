import { z } from 'zod';
import { PaymentMethod, RegistrationStatus } from '@prisma/client';
import { apiError, created, ok, parseJson } from '@/lib/api';
import { requireTournamentManager } from '@/lib/access';
import { prisma } from '@/lib/prisma';

const teamSchema = z.object({
  name: z.string().trim().min(2).max(100), shortName: z.string().trim().min(2).max(20), groupCode: z.string().trim().max(20).optional(),
  logoText: z.string().trim().max(10).optional(), primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  managerName: z.string().trim().min(2).max(100), managerPhone: z.string().trim().min(5).max(30), managerEmail: z.string().trim().email().max(320),
  registrationFee: z.number().min(0).max(10_000_000), amountReceived: z.number().min(0).max(10_000_000).default(0), paymentMethod: z.nativeEnum(PaymentMethod).optional(), paymentReference: z.string().trim().max(200).optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ tournamentId: string }> }) {
  try { const { tournamentId } = await params; await requireTournamentManager(tournamentId); return ok(await prisma.team.findMany({ where: { tournamentId }, include: { _count: { select: { players: true } } }, orderBy: { name: 'asc' } })); }
  catch (error) { return apiError(error); }
}

export async function POST(request: Request, { params }: { params: Promise<{ tournamentId: string }> }) {
  try {
    const { tournamentId } = await params; const { user, tournament } = await requireTournamentManager(tournamentId); const input = await parseJson(request, teamSchema);
    if (tournament.structureLockedAt) return Response.json({ error: { code: 'STRUCTURE_LOCKED', message: 'Teams cannot be changed after tournament structure is locked.' } }, { status: 409 });
    const amountReceived = input.amountReceived ?? 0;
    const paymentStatus = amountReceived >= input.registrationFee ? 'PAID' : amountReceived > 0 ? 'PARTIALLY_PAID' : 'UNPAID';
    const team = await prisma.$transaction(async (tx) => {
      const createdTeam = await tx.team.create({ data: { ...input, amountReceived, tournamentId, registrationStatus: RegistrationStatus.REGISTERED, paymentStatus } });
      await tx.auditLog.create({ data: { userId: user.id, tournamentId, action: 'TEAM_REGISTERED', entityType: 'TEAM', entityId: createdTeam.id, newValue: { name: createdTeam.name } } });
      return createdTeam;
    });
    return created(team);
  } catch (error) { return apiError(error); }
}
