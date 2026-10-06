import Link from 'next/link';
import { Calendar } from 'lucide-react';
import type { Accomplishment, Goal, Status } from '@/types';
import { formatDate } from '@/lib/utils';
import { Chip, ProgressBar, StatusChip, Text } from '@/components/ui/primitives';
import { RecordActions } from '@/components/common/RecordActions';
import { duplicateGoal } from '@/lib/actions/work';
import { GoalFormModal } from './GoalForm';
import { GoalProgressForm } from './GoalProgressForm';
import type { YearData } from '@/types';

const SMART: [keyof Goal, string][] = [['sustainable', 'Sustainable'], ['measurable', 'Measurable'], ['attainable', 'Attainable'], ['relevant', 'Relevant'], ['time_based', 'Time-based'], ['aligned', 'Aligned']];

export function GoalCard({ goal, related, yearNumber, admin, data, statuses, expanded }: { goal: Goal; related: Accomplishment[]; yearNumber: number; admin: boolean; data?: YearData; statuses: Status[]; expanded?: boolean }) {
  const tone = goal.status?.tone ?? 'info';
  const smart = SMART.filter(([k]) => goal[k]);
  return (
    <article id={`goal-${goal.id}`} className="card scroll-mt-24 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug">{goal.title}</h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
            <StatusChip status={goal.status} />
            {goal.target_date && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" aria-hidden />Target {formatDate(goal.target_date)}</span>}
            {goal.archived_at && <Chip>Archived</Chip>}
          </p>
        </div>
      </div>
      <div className="mt-4"><ProgressBar value={goal.progress} tone={tone} label={`${goal.title} progress`} /></div>
      {goal.description && <Text className="mt-4">{goal.description}</Text>}

      <details className="group mt-4" open={expanded}>
        <summary className="cursor-pointer text-sm font-medium text-accent">Details, SMART+A & related work ({related.length})</summary>
        <div className="mt-4 space-y-5">
          {goal.success_metric && <div><p className="label">Success metric</p><Text>{goal.success_metric}</Text></div>}
          {smart.length > 0 && (
            <div>
              <p className="label">SMART+A criteria</p>
              <dl className="grid gap-3 sm:grid-cols-2">
                {smart.map(([k, label]) => <div key={k} className="rounded-lg bg-surface2 p-3"><dt className="text-xs font-semibold text-accent">{label}</dt><dd className="prose-pre mt-0.5 text-sm">{goal[k] as string}</dd></div>)}
              </dl>
            </div>
          )}
          {goal.progress_notes && <div><p className="label">Progress notes</p><Text>{goal.progress_notes}</Text></div>}
          {goal.final_outcome && <div><p className="label">Final outcome</p><Text>{goal.final_outcome}</Text></div>}
          <div>
            <p className="label">Related accomplishments</p>
            {related.length ? (
              <ul className="space-y-1 text-sm">
                {related.map((a) => <li key={a.id} className="flex items-baseline gap-2"><time className="w-20 shrink-0 text-xs text-muted" dateTime={a.work_date}>{formatDate(a.work_date, { month: 'short', day: 'numeric' })}</time><Link href={`/${yearNumber}/work/${a.id}`} className="hover:text-accent hover:underline">{a.title}</Link></li>)}
              </ul>
            ) : <p className="text-sm text-muted">No work linked to this goal yet.</p>}
          </div>
        </div>
      </details>

      {admin && data && (
        <div className="no-print mt-5 space-y-3 border-t border-line pt-4">
          {!goal.archived_at && <GoalProgressForm goalId={goal.id} statusId={goal.status_id} progress={goal.progress} statuses={statuses} />}
          <div className="flex flex-wrap gap-2">
            <GoalFormModal data={data} goal={goal} linked={related.map((r) => r.id)} trigger="edit" />
            <RecordActions table="goals" id={goal.id} archived={!!goal.archived_at} noun="goal" duplicate={duplicateGoal} />
          </div>
        </div>
      )}
    </article>
  );
}
