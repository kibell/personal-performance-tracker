'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Briefcase, ClipboardCheck, LayoutDashboard, Target, UserCog, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const ITEMS: { href: string; label: string; icon: LucideIcon; match?: 'exact' }[] = [
  { href: '', label: 'Dashboard', icon: LayoutDashboard, match: 'exact' },
  { href: '/work', label: 'Work', icon: Briefcase },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/learning', label: 'Learning & Development', icon: BookOpen },
  { href: '/review', label: 'Review Summary', icon: ClipboardCheck },
  { href: '/role', label: 'Role & Responsibilities', icon: UserCog },
];

export function SideNav({ year, orientation = 'vertical' }: { year: number; orientation?: 'vertical' | 'horizontal' }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className={cn(orientation === 'vertical' ? 'flex flex-col gap-0.5' : 'flex gap-1 overflow-x-auto px-3 py-2')}>
      {ITEMS.map(({ href, label, icon: Icon, match }) => {
        const to = `/${year}${href}`;
        const active = match === 'exact' ? path === to : path.startsWith(to);
        return (
          <Link key={label} href={to} aria-current={active ? 'page' : undefined}
            className={cn('flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-accentsoft text-accent' : 'text-muted hover:bg-surface2 hover:text-ink')}>
            <Icon className="h-4 w-4" aria-hidden />{label}
          </Link>
        );
      })}
    </nav>
  );
}

export function YearNav({ years, current, addSlot }: { years: { year: number; label: string; archived: boolean }[]; current: number | null; addSlot?: ReactNode }) {
  const path = usePathname();
  const parts = path.split('/').filter(Boolean);
  const section = /^\d{4}$/.test(parts[0] ?? '') && parts[1] && parts[1] !== 'print' ? `/${parts[1]}` : '';
  return (
    <nav aria-label="Review year" className="flex items-center gap-1 overflow-x-auto">
      {years.map((y) => (
        <Link key={y.year} href={`/${y.year}${section}`} aria-current={y.year === current ? 'page' : undefined}
          className={cn('rounded-lg px-3 py-1.5 text-sm font-semibold tabular-nums transition-colors', y.year === current ? 'bg-accent text-accentfg' : 'text-muted hover:bg-surface2 hover:text-ink', y.archived && 'italic opacity-70')}>
          {y.label}{y.archived && <span className="sr-only"> (archived)</span>}
        </Link>
      ))}
      {addSlot}
    </nav>
  );
}
