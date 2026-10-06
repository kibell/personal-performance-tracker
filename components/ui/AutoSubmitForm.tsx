'use client';
import { useRef, type ReactNode } from 'react';

/** A plain GET form that re-submits when selects/checkboxes/dates change. Works without JS via the Apply button. */
export function AutoSubmitForm({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} method="get" className={className}
      onChange={(e) => { const t = e.target as unknown as HTMLInputElement; if (t.type !== 'search' && t.type !== 'text') ref.current?.requestSubmit(); }}>
      {children}
    </form>
  );
}
