import Link from 'next/link';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return <main className="mx-auto mt-20 max-w-md rounded-xl bg-white p-8 shadow"><h1 className="mb-2 text-2xl font-bold">Sign in to ArenaOps</h1><p className="mb-6 text-sm text-slate-600">Manage your tournaments securely.</p><LoginForm /><p className="mt-5 text-sm">New organizer? <Link className="text-emerald-700 underline" href="/register">Create an account</Link></p><Link className="mt-3 inline-block text-sm text-emerald-700 underline" href="/forgot-password">Forgot your password?</Link></main>;
}
