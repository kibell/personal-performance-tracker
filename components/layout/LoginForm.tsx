'use client';
import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { signIn } from '@/lib/actions/admin';

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block"><span className="label">Email</span><input name="email" type="email" required autoComplete="username" className="input" autoFocus /></label>
      <label className="block"><span className="label">Password</span><input name="password" type="password" required autoComplete="current-password" className="input" /></label>
      {state && !state.ok && <p role="alert" className="rounded-lg bg-dangersoft px-3 py-2 text-sm text-danger">{state.error}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}Sign in</button>
    </form>
  );
}
