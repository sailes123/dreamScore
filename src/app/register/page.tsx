import Link from 'next/link';
import { RegisterForm } from './RegisterForm';

export default function RegisterPage() {
  return <main className="mx-auto mt-20 max-w-md rounded-xl bg-white p-8 shadow"><h1 className="mb-2 text-2xl font-bold">Create organizer account</h1><p className="mb-6 text-sm text-slate-600">Start managing your next tournament.</p><RegisterForm /><p className="mt-5 text-sm">Already have an account? <Link className="text-emerald-700 underline" href="/login">Sign in</Link></p></main>;
}
