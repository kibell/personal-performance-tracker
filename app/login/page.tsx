import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { LoginForm } from '@/components/layout/LoginForm';
import { getViewer } from '@/lib/auth/session';
import { isConfigured } from '@/lib/env';
import { SetupNotice } from '@/components/layout/SetupNotice';

export const metadata = { title: 'Admin login' };
export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (!isConfigured) return <SetupNotice />;
  const { next = '/' } = await searchParams;
  const viewer = await getViewer();
  if (viewer.isAdmin) redirect(next.startsWith('/') ? next : '/');
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="card w-full max-w-sm p-8">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accentfg"><Sparkles className="h-5 w-5" aria-hidden /></span>
        <h1 className="mt-4 text-xl font-semibold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">Sign in to add and edit records. Visitors can browse without an account.</p>
        {viewer.userId && <p className="mt-3 rounded-lg bg-warningsoft px-3 py-2 text-sm text-warning">This account is signed in but does not have edit access.</p>}
        <LoginForm next={next} />
        <Link href="/" className="mt-5 block text-center text-sm text-muted hover:text-ink">← Back to the read-only site</Link>
      </div>
    </div>
  );
}
