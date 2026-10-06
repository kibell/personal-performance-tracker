'use client';
import { useId, useState } from 'react';
import { localToday } from '@/lib/utils';

export function TodayDate({ name, defaultValue, required }: { name: string; defaultValue?: string | null; required?: boolean }) {
  const [v] = useState(() => defaultValue || localToday());
  return <input type="date" name={name} defaultValue={v} className="input" required={required} />;
}

export function ProgressInput({ name, defaultValue = 0 }: { name: string; defaultValue?: number }) {
  const [v, setV] = useState(defaultValue);
  return (
    <div className="flex items-center gap-3">
      <input type="range" min={0} max={100} step={5} value={v} onChange={(e) => setV(Number(e.target.value))} className="h-2 flex-1 accent-[rgb(var(--accent))]" aria-label="Percent complete" />
      <input type="number" min={0} max={100} name={name} value={v} onChange={(e) => setV(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} className="input w-20" aria-label="Percent complete (number)" />
    </div>
  );
}

export interface Option { id: string; label: string; hint?: string }
export function MultiCheck({ name, options, selected = [], empty }: { name: string; options: Option[]; selected?: string[]; empty?: string }) {
  const [q, setQ] = useState('');
  const gid = useId();
  if (!options.length) return <p className="rounded-lg border border-dashed border-line px-3 py-2 text-sm text-muted">{empty ?? 'Nothing to select yet.'}</p>;
  const shown = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="rounded-lg border border-line">
      {options.length > 6 && (
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" aria-label="Filter options" className="w-full rounded-t-lg border-0 border-b border-line bg-transparent px-3 py-2 text-sm" />
      )}
      <ul className="max-h-44 overflow-y-auto p-1" aria-labelledby={gid}>
        {options.map((o) => (
          <li key={o.id} hidden={!shown.includes(o)}>
            <label className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface2">
              <input type="checkbox" name={name} value={o.id} defaultChecked={selected.includes(o.id)} className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent))]" />
              <span>{o.label}{o.hint && <span className="ml-1 text-xs text-muted">{o.hint}</span>}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Check({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-line px-3 py-2.5 hover:bg-surface2">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent))]" />
      <span className="text-sm font-medium">{label}{hint && <span className="block text-xs font-normal text-muted">{hint}</span>}</span>
    </label>
  );
}

export function QuickTitle({ name = 'title' }: { name?: string }) {
  return (
    <textarea name={name} required autoFocus rows={3} maxLength={500} className="input" placeholder="e.g. Updated accessibility issues on Nurture landing page."
      aria-label="What did you work on?"
      onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit(); }} />
  );
}
