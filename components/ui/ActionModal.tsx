'use client';
import { useActionState, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X } from 'lucide-react';
import type { Action } from '@/lib/actions/helpers';
import { cn } from '@/lib/utils';
import { useToast } from './Toast';

interface Props {
  title: string; description?: string; action: Action; children: ReactNode;
  triggerLabel?: string; triggerIcon?: ReactNode; triggerClass?: string; ariaLabel?: string;
  submitLabel?: string; wide?: boolean; hotkey?: string; draftKey?: string;
  /** After success, navigate to redirectBase + returned id. */
  redirectBase?: string; toastLink?: { base: string; label: string };
}

const DRAFTABLE = new Set(['text', 'textarea', 'select-one', 'date', 'url', 'number', 'search']);

/** Dialog-based form wired to a server action: pending state, inline errors, toasts, optional autosaved drafts + hotkey. */
export function ActionModal({ title, description, action, children, triggerLabel, triggerIcon, triggerClass = 'btn', ariaLabel, submitLabel = 'Save', wide, hotkey, draftKey, redirectBase, toastLink }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, null);
  const [restored, setRestored] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { push } = useToast();
  const storageKey = draftKey ? `prt:draft:${draftKey}` : null;

  useEffect(() => { if (open) dialogRef.current?.showModal(); }, [open]);

  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key.toLowerCase() !== hotkey || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable)) return;
      if (document.querySelector('dialog[open]')) return;
      e.preventDefault(); setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkey]);

  // Draft restore + autosave (unsent text only, per-browser convenience).
  useEffect(() => {
    const form = formRef.current;
    if (!open || !form || !storageKey) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as Record<string, string> | null;
      if (saved) {
        let any = false;
        for (const [k, v] of Object.entries(saved)) {
          const el = form.elements.namedItem(k) as HTMLInputElement | null;
          if (el && 'value' in el && v) { el.value = v; any = true; }
        }
        setRestored(any);
      }
    } catch { /* storage unavailable */ }
    let timer: ReturnType<typeof setTimeout>;
    const save = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          const out: Record<string, string> = {};
          for (const el of Array.from(form.elements) as HTMLInputElement[]) {
            if (el.name && DRAFTABLE.has(el.type) && el.value) out[el.name] = el.value;
          }
          delete out.year_id; delete out.id;
          localStorage.setItem(storageKey, JSON.stringify(out));
        } catch { /* ignore */ }
      }, 400);
    };
    form.addEventListener('input', save);
    return () => { clearTimeout(timer); form.removeEventListener('input', save); };
  }, [open, storageKey]);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      if (storageKey) try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
      setOpen(false); dialogRef.current?.close();
      push({ message: state.message ?? 'Saved.', kind: 'success', ...(toastLink && state.id ? { href: toastLink.base + state.id, hrefLabel: toastLink.label } : {}) });
      if (redirectBase && state.id) router.push(redirectBase + state.id);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const discardDraft = () => {
    if (storageKey) try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    formRef.current?.reset(); setRestored(false);
  };

  return (
    <>
      <button type="button" className={triggerClass} onClick={() => setOpen(true)} aria-label={ariaLabel} title={ariaLabel}>
        {triggerIcon}{triggerLabel}
      </button>
      {open && (
        <dialog
          ref={dialogRef}
          onClose={() => setOpen(false)}
          onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current?.close(); }}
          className={cn('m-auto w-[calc(100vw-1rem)] rounded-2xl border border-line bg-surface p-0 shadow-pop backdrop:backdrop-blur-[1px]', wide ? 'max-w-3xl' : 'max-w-xl')}
          aria-labelledby="modal-title"
        >
          <form ref={formRef} action={formAction} className="flex max-h-[90vh] flex-col">
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <h2 id="modal-title" className="text-base font-semibold">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" aria-label="Close" onClick={() => dialogRef.current?.close()}><X className="h-4 w-4" /></button>
            </header>
            <div className="space-y-4 overflow-y-auto px-5 py-4">
              {restored && (
                <p className="flex items-center justify-between rounded-lg bg-infosoft px-3 py-2 text-sm text-info">
                  Draft restored from your last session.
                  <button type="button" className="font-medium underline" onClick={discardDraft}>Discard</button>
                </p>
              )}
              {children}
              {state && !state.ok && <p role="alert" className="rounded-lg bg-dangersoft px-3 py-2 text-sm text-danger">{state.error}</p>}
            </div>
            <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">
              <button type="button" className="btn" onClick={() => dialogRef.current?.close()}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{submitLabel}
              </button>
            </footer>
          </form>
        </dialog>
      )}
    </>
  );
}
