import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { StatusRef, Tone } from '@/types';

export function StatusChip({ status, className }: { status: StatusRef | null | undefined; className?: string }) {
  if (!status) return null;
  return <span className={cn('chip', `chip-${status.tone}`, className)}>{status.name}</span>;
}
export const Chip = ({ children, tone = 'neutral', className }: { children: ReactNode; tone?: Tone | 'accent'; className?: string }) =>
  <span className={cn('chip', `chip-${tone}`, className)}>{children}</span>;

const barColor: Record<string, string> = { neutral: 'bg-muted', info: 'bg-accent', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger' };
export function ProgressBar({ value, tone = 'info', label }: { value: number; tone?: Tone; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={label ?? 'Progress'}>
        <div className={cn('h-full rounded-full', barColor[tone])} style={{ width: `${value}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-semibold tabular-nums text-muted">{value}%</span>
    </div>
  );
}

export function SectionCard({ title, action, children, className, id }: { title: string; action?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn('card avoid-break', className)} aria-labelledby={id ? `${id}-h` : undefined}>
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <h2 id={id ? `${id}-h` : undefined} className="h-section">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ title, body, children, compact }: { title: string; body?: string; children?: ReactNode; compact?: boolean }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'py-6' : 'rounded-xl border border-dashed border-line bg-surface px-6 py-14')}>
      <p className="font-medium">{title}</p>
      {body && <p className="mt-1 max-w-md text-sm text-muted">{body}</p>}
      {children && <div className="mt-4 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatTile({ label, value, hint, href }: { label: string; value: ReactNode; hint?: ReactNode; href?: string }) {
  const inner = (
    <div className="card h-full p-4 transition-colors hover:border-accent/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Text({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('prose-pre text-sm leading-relaxed', className)}>{children}</p>;
}
