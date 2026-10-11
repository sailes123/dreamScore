import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Health check database failure', error);
    return Response.json({ status: 'unavailable' }, { status: 503 });
  }
}
