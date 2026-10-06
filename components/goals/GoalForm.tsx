import { Pencil, Plus } from 'lucide-react';
import { saveGoal } from '@/lib/actions/work';
import { ActionModal } from '@/components/ui/ActionModal';
import { Field } from '@/components/ui/primitives';
import { MultiCheck, ProgressInput } from '@/components/ui/inputs';
import { formatDate } from '@/lib/utils';
import type { Goal, YearData } from '@/types';

export function GoalFormModal({ data, goal, linked = [], trigger = 'primary' }: { data: YearData; goal?: Goal; linked?: string[]; trigger?: 'primary' | 'edit' }) {
  const sts = data.goalStatuses.filter((s) => !s.archived_at || s.id === goal?.status_id);
  const smart: [keyof Goal, string, string][] = [
    ['sustainable', 'Sustainable', 'Can this be maintained over time?'], ['measurable', 'Measurable', 'How will you know it worked?'],
    ['attainable', 'Attainable', 'Is it realistic with your time and resources?'], ['relevant', 'Relevant', 'Why does this matter now?'],
    ['time_based', 'Time-based', 'Milestones and deadline.'], ['aligned', 'Aligned', 'How it supports team / department / university goals.'],
  ];
  return (
    <ActionModal wide action={saveGoal} title={goal ? 'Edit goal' : 'Add goal'} submitLabel={goal ? 'Save changes' : 'Add goal'}
      draftKey={goal ? undefined : `goal-${data.year.id}`}
      triggerLabel={trigger === 'edit' ? 'Edit' : 'Add goal'} triggerIcon={trigger === 'edit' ? <Pencil className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
      triggerClass={trigger === 'edit' ? 'btn btn-sm' : 'btn btn-primary'}>
      {goal ? <input type="hidden" name="id" value={goal.id} /> : <input type="hidden" name="year_id" value={data.year.id} />}
      <input type="hidden" name="links_present" value="1" />
      <Field label="Goal title *"><input name="title" required defaultValue={goal?.title} className="input" maxLength={200} /></Field>
      <Field label="Description"><textarea name="description" rows={3} defaultValue={goal?.description ?? ''} className="input" /></Field>
      <fieldset className="rounded-xl border border-line p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-accent">SMART+A criteria</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {smart.map(([k, label, hint]) => <Field key={k} label={label} hint={hint}><textarea name={k} rows={2} defaultValue={(goal?.[k] as string | null) ?? ''} className="input" /></Field>)}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Success metric" className="sm:col-span-2"><input name="success_metric" defaultValue={goal?.success_metric ?? ''} className="input" /></Field>
        <Field label="Target date"><input name="target_date" type="date" defaultValue={goal?.target_date ?? ''} className="input" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status"><select name="status_id" defaultValue={goal?.status_id ?? sts[0]?.id} className="input">{sts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <div><span className="label">Percentage complete</span><ProgressInput name="progress" defaultValue={goal?.progress ?? 0} /></div>
      </div>
      <Field label="Progress notes"><textarea name="progress_notes" rows={2} defaultValue={goal?.progress_notes ?? ''} className="input" /></Field>
      <div><span className="label">Related accomplishments</span>
        <MultiCheck name="accomplishment_ids" options={data.accomplishments.map((a) => ({ id: a.id, label: a.title, hint: formatDate(a.work_date, { month: 'short', day: 'numeric' }) }))} selected={linked} empty="No work recorded this year yet. You can also link work to goals from the work entry." />
      </div>
      <Field label="Final outcome" hint="Fill in when the goal wraps up."><textarea name="final_outcome" rows={2} defaultValue={goal?.final_outcome ?? ''} className="input" /></Field>
    </ActionModal>
  );
}
