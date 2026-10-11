import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export async function requirePageUser() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  return session.user;
}

export async function requireAdminPageUser() {
  const user = await requirePageUser();
  if (user.role !== 'PLATFORM_ADMIN') redirect('/organizer/dashboard');
  return user;
}
