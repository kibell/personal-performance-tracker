import { monthLabel } from '@/lib/utils';

/** Horizontal bar breakdown (single accent hue). */
export function BarList({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="text-sm">
          <div className="mb-1 flex justify-between gap-3"><span className="truncate">{r.label}</span><span className="tabular-nums text-muted">{r.value}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-surface2"><div className="h-full rounded-full bg-accent" style={{ width: `${(r.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

/** Work per month for the year — 12 columns, accessible via a text summary. */
export function MonthChart({ year, counts }: { year: number; counts: Record<string, number> }) {
  const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
  const max = Math.max(1, ...months.map((m) => counts[m] ?? 0));
  const summary = months.filter((m) => counts[m]).map((m) => `${monthLabel(m)}: ${counts[m]}`).join(', ');
  return (
    <figure>
      <div className="flex h-32 items-end gap-1.5" role="img" aria-label={`Work recorded per month. ${summary || 'None yet.'}`}>
        {months.map((m) => {
          const v = counts[m] ?? 0;
          return (
            <div key={m} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${monthLabel(m)}: ${v}`}>
              <span className="text-[10px] tabular-nums text-muted">{v || ''}</span>
              <div className="w-full rounded-t bg-accent" style={{ height: `${v ? Math.max(4, (v / max) * 88) : 2}%`, opacity: v ? 1 : 0.2 }} />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1.5 text-[10px] text-muted" aria-hidden>
        {months.map((m) => <span key={m} className="flex-1 text-center">{new Date(2000, Number(m.slice(5)) - 1).toLocaleString('en-US', { month: 'narrow' })}</span>)}
      </div>
    </figure>
  );
}
