import { z } from 'zod';
import { apiError, created, parseJson } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { requireTournamentManager } from '@/lib/access';
import { prisma } from '@/lib/prisma';
const schema = z.object({ name: z.string().trim().min(1).max(80) });
export async function POST(request: Request, { params }: { params: Promise<{ venueId: string }> }) { try { const { venueId } = await params; const venue = await prisma.venue.findUnique({ where: { id: venueId }, select: { tournamentId: true } }); if (!venue) throw new ApiError(404, 'VENUE_NOT_FOUND', 'Venue not found.'); const { user, tournament } = await requireTournamentManager(venue.tournamentId); const input = await parseJson(request, schema); if (tournament.structureLockedAt) throw new ApiError(409, 'STRUCTURE_LOCKED', 'Courts cannot be changed after tournament structure is locked.'); const court = await prisma.$transaction(async (tx) => { const item = await tx.court.create({ data: { ...input, venueId } }); await tx.auditLog.create({ data: { userId: user.id, tournamentId: venue.tournamentId, action: 'COURT_CREATED', entityType: 'COURT', entityId: item.id, newValue: input } }); return item; }); return created(court); } catch (error) { return apiError(error); } }
