import { apiError, ok } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { TournamentVisibility } from '@prisma/client';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const code = new URL(request.url).searchParams.get('code');
    const tournament = await prisma.tournament.findFirst({
      where: { slug, OR: [{ visibility: TournamentVisibility.PUBLIC }, ...(code ? [{ visibility: TournamentVisibility.PRIVATE, invitationCode: code }] : [])] },
      select: {
        id: true, slug: true, name: true, description: true, sportCode: true, startAt: true, endAt: true, timezone: true, status: true, format: true, venues: { select: { name: true, city: true, country: true } },
        teams: { select: { id: true, name: true, shortName: true, groupCode: true, primaryColor: true, secondaryColor: true } },
        matches: { where: { status: { in: ['SCHEDULED', 'READY', 'LIVE', 'HALFTIME', 'COMPLETED'] } }, select: { id: true, matchNumber: true, stage: true, roundName: true, groupCode: true, venueName: true, courtName: true, scheduledAt: true, homeScore: true, awayScore: true, status: true, homeTeam: { select: { name: true, shortName: true } }, awayTeam: { select: { name: true, shortName: true } } }, orderBy: { scheduledAt: 'asc' } },
      },
    });
    if (!tournament) return Response.json({ error: { code: 'NOT_FOUND', message: 'Public tournament not found.' } }, { status: 404 });
    return ok(tournament);
  } catch (error) { return apiError(error); }
}
