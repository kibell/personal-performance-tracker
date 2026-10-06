'use client';
import { useActionState, useEffect, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import type { Action } from '@/lib/actions/helpers';
import { useToast } from '@/components/ui/Toast';

export function SettingsForm({ action, children, submitLabel }: { action: Action; children: ReactNode; submitLabel: string }) {
  const [state, act, pending] = useActionState(action, null);
  const { push } = useToast();
  useEffect(() => { if (state) push({ message: state.ok ? state.message ?? 'Saved.' : state.error ?? 'Could not save.', kind: state.ok ? 'success' : 'error' }); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <form action={act} className="max-w-xl space-y-4">
      {children}
      <button className="btn btn-primary" disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{submitLabel}</button>
    </form>
  );
}
