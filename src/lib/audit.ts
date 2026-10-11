import { prisma } from '@/lib/prisma';

export async function writeAuditLog(input: {
  userId: string; action: string; entityType: string; entityId: string;
  tournamentId?: string; oldValue?: object; newValue?: object; metadata?: object;
}) {
  return prisma.auditLog.create({ data: input });
}
