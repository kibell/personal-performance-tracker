'use client';
import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { updateGoalProgress } from '@/lib/actions/work';
import { useToast } from '@/components/ui/Toast';
import type { Status } from '@/types';

/** Inline quick update: status and percentage are independent controls. */
export function GoalProgressForm({ goalId, statusId, progress, statuses }: { goalId: string; statusId: string | null; progress: number; statuses: Status[] }) {
  const [s, setS] = useState(statusId ?? '');
  const [p, setP] = useState(progress);
  const [pending, start] = useTransition();
  const { push } = useToast();
  const dirty = s !== (statusId ?? '') || p !== progress;
  const save = () => start(async () => {
    const fd = new FormData(); fd.set('id', goalId); fd.set('status_id', s); fd.set('progress', String(p));
    const r = await updateGoalProgress(null, fd);
    push({ message: r?.ok ? r.message ?? 'Saved.' : r?.error ?? 'Could not save.', kind: r?.ok ? 'success' : 'error' });
  });
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-surface2 p-3">
      <label className="flex items-center gap-2 text-sm"><span className="font-medium">Status</span>
        <select value={s} onChange={(e) => setS(e.target.value)} className="input w-auto py-1">{statuses.filter((x) => !x.archived_at || x.id === statusId).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
      </label>
      <label className="flex min-w-[10rem] flex-1 items-center gap-2 text-sm"><span className="font-medium">Progress</span>
        <input type="range" min={0} max={100} step={5} value={p} onChange={(e) => setP(Number(e.target.value))} className="h-2 flex-1 accent-[rgb(var(--accent))]" />
        <span className="w-10 text-right tabular-nums">{p}%</span>
      </label>
      <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={!dirty || pending}>{pending && <Loader2 className="h-3 w-3 animate-spin" aria-hidden />}Update</button>
    </div>
  );
}
