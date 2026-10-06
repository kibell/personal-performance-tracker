import Link from 'next/link';
import type { Accomplishment } from '@/types';
import { formatDate, monthKey, monthLabel } from '@/lib/utils';
import { Chip, StatusChip } from '@/components/ui/primitives';

/** Chronological timeline grouped by month. */
export function Timeline({ items, yearNumber, limit, grouped = true }: { items: Accomplishment[]; yearNumber: number; limit?: number; grouped?: boolean }) {
  const list = limit ? items.slice(0, limit) : items;
  const groups: { key: string; rows: Accomplishment[] }[] = [];
  for (const a of list) {
    const k = grouped ? monthKey(a.work_date) : 'all';
    const g = groups.at(-1);
    if (g && g.key === k) g.rows.push(a); else groups.push({ key: k, rows: [a] });
  }
  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={g.key}>
          {grouped && <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{monthLabel(g.key)}</h3>}
          <ol className="relative space-y-3 border-l border-line pl-5">
            {g.rows.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[1.62rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-accent" aria-hidden />
                <p className="text-xs text-muted"><time dateTime={a.work_date}>{formatDate(a.work_date, { month: 'short', day: 'numeric' })}</time></p>
                <p className="text-sm font-medium"><Link href={`/${yearNumber}/work/${a.id}`} className="hover:text-accent">{a.title}</Link></p>
                <p className="mt-0.5 flex flex-wrap gap-1">{a.category && <Chip>{a.category.name}</Chip>}<StatusChip status={a.status} /></p>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
