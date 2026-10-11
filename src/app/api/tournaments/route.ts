import { z } from 'zod';
import { TournamentFormat, TournamentVisibility } from '@prisma/client';
import { apiError, created, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/lib/access';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

const tournamentSchema = z.object({
  name: z.string().trim().min(3).max(150),
  description: z.string().trim().min(1).max(10_000),
  sportCode: z.string().trim().min(2).max(50),
  visibility: z.nativeEnum(TournamentVisibility).default(TournamentVisibility.PUBLIC),
  startAt: z.coerce.date(), endAt: z.coerce.date(), timezone: z.string().min(1).max(100),
  format: z.nativeEnum(TournamentFormat), numberOfTeams: z.number().int().min(2).max(256),
  groupsCount: z.number().int().min(0).max(32).default(0), maxTeams: z.number().int().min(2).max(256),
  matchDurationMinutes: z.number().int().min(1).max(300), periods: z.number().int().min(1).max(12),
  teamRegistrationFee: z.number().min(0).max(10_000_000).default(0), currency: z.string().trim().length(3).default('NPR'),
}).refine((value) => value.endAt > value.startAt, { message: 'End date must be after start date.', path: ['endAt'] })
  .refine((value) => value.maxTeams >= value.numberOfTeams, { message: 'Maximum teams cannot be lower than the planned teams.', path: ['maxTeams'] });

function slugify(value: string) { return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 70); }

export async function GET() {
  try {
    const user = await requireUser();
    const tournaments = await prisma.tournament.findMany({
      where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, status: 'ACTIVE' } } }] },
      select: { id: true, slug: true, name: true, status: true, startAt: true, endAt: true, visibility: true, sportCode: true }, orderBy: { createdAt: 'desc' },
    });
    return ok(tournaments);
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(); const input = await parseJson(request, tournamentSchema);
    const sport = await prisma.sportConfiguration.findUnique({ where: { code: input.sportCode } });
    if (!sport) return Response.json({ error: { code: 'UNKNOWN_SPORT', message: 'Select a configured sport.' } }, { status: 422 });
    const baseSlug = slugify(input.name) || 'tournament';
    const tournament = await prisma.$transaction(async (tx) => {
      let suffix = 0; let slug = baseSlug;
      while (await tx.tournament.findUnique({ where: { slug }, select: { id: true } })) { suffix += 1; slug = `${baseSlug}-${suffix + 1}`; }
      const createdTournament = await tx.tournament.create({ data: { ...input, slug, ownerId: user.id, invitationCode: input.visibility === 'PRIVATE' ? randomBytes(18).toString('base64url') : null, pointsForWin: sport.pointsForWin, pointsForDraw: sport.pointsForDraw, pointsForLoss: sport.pointsForLoss } });
      await tx.tournamentMember.create({ data: { tournamentId: createdTournament.id, userId: user.id, role: 'OWNER', status: 'ACTIVE' } });
      await tx.auditLog.create({ data: { userId: user.id, tournamentId: createdTournament.id, action: 'TOURNAMENT_CREATED', entityType: 'TOURNAMENT', entityId: createdTournament.id, newValue: { name: createdTournament.name, slug } } });
      return createdTournament;
    });
    return created({ id: tournament.id, slug: tournament.slug, name: tournament.name, invitationCode: tournament.invitationCode });
  } catch (error) { return apiError(error); }
}
