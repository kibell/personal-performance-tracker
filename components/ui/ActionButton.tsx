'use client';
import { useRef, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { Action } from '@/lib/actions/helpers';
import { cn } from '@/lib/utils';
import { useToast } from './Toast';

interface Props {
  action: Action; fields: Record<string, string>; label?: string; icon?: ReactNode; ariaLabel?: string;
  className?: string; confirm?: { title: string; body: string; confirmLabel?: string; danger?: boolean };
  redirectTo?: string; redirectBase?: string;
}

/** One-click mutation (archive, duplicate, move, delete) with an optional confirmation dialog. */
export function ActionButton({ action, fields, label, icon, ariaLabel, className = 'btn btn-sm', confirm, redirectTo, redirectBase }: Props) {
  const [pending, start] = useTransition();
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  const { push } = useToast();
  const router = useRouter();

  const run = () => start(async () => {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.set(k, v));
    const r = await action(null, fd);
    if (r?.ok) {
      setAsking(false); ref.current?.close();
      push({ message: r.message ?? 'Done.', kind: 'success' });
      if (redirectTo) router.push(redirectTo); else if (redirectBase && r.id) router.push(redirectBase + r.id);
    } else {
      const msg = r?.error ?? 'Something went wrong.';
      if (confirm) setError(msg); else push({ message: msg, kind: 'error' });
    }
  });

  return (
    <>
      <button type="button" className={className} aria-label={ariaLabel ?? label} title={ariaLabel ?? label} disabled={pending}
        onClick={() => { if (confirm) { setError(null); setAsking(true); setTimeout(() => ref.current?.showModal(), 0); } else run(); }}>
        {pending && !confirm ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}{label}
      </button>
      {asking && confirm && (
        <dialog ref={ref} onClose={() => setAsking(false)} aria-labelledby="confirm-title"
          className="m-auto w-[calc(100vw-1rem)] max-w-md rounded-2xl border border-line bg-surface p-5 shadow-pop">
          <h2 id="confirm-title" className="text-base font-semibold">{confirm.title}</h2>
          <p className="mt-2 text-sm text-muted">{confirm.body}</p>
          {error && <p role="alert" className="mt-3 rounded-lg bg-dangersoft px-3 py-2 text-sm text-danger">{error}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className="btn" onClick={() => ref.current?.close()}>Cancel</button>
            <button type="button" className={cn('btn', confirm.danger === false ? 'btn-primary' : 'btn-danger')} onClick={run} disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{confirm.confirmLabel ?? 'Confirm'}
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
