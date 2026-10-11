import Link from 'next/link';
import { requirePageUser } from '@/lib/page-access';
import { AccountSecurityForm } from '@/components/account/AccountSecurityForm';

export default async function AccountPage() {
  const user = await requirePageUser();
  return <main className="mx-auto max-w-4xl p-6"><Link href="/organizer/dashboard" className="text-emerald-700 underline">Dashboard</Link><h1 className="mt-4 text-3xl font-bold">Account security</h1><p className="mb-6 text-slate-600">Signed in as {user.email}</p><AccountSecurityForm /></main>;
}
