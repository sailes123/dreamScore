import { PrismaClient, SystemRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();
async function main() {
  const passwordHash = await hash('ChangeMe123!', 12);
  await prisma.user.upsert({ where: { email: 'admin@arenaops.local' }, update: {}, create: { email: 'admin@arenaops.local', name: 'Platform Admin', passwordHash, role: SystemRole.PLATFORM_ADMIN } });
  await prisma.sportConfiguration.upsert({ where: { code: 'FUTSAL' }, update: {}, create: { code: 'FUTSAL', name: 'Futsal', playersOnField: 5, maxSquadSize: 14, defaultMatchDurationMinutes: 40, periods: 2, periodName: 'Half', scoringType: 'GOALS', availableEventTypes: ['GOAL','ASSIST','YELLOW_CARD','RED_CARD'], hasPenalties: true } });
}
main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
