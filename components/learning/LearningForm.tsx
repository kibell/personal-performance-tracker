import { Pencil, Plus } from 'lucide-react';
import { saveLearning } from '@/lib/actions/work';
import { ActionModal } from '@/components/ui/ActionModal';
import { Field } from '@/components/ui/primitives';
import { MultiCheck } from '@/components/ui/inputs';
import { LEARNING_TYPES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { LearningItem, YearData } from '@/types';

export function LearningFormModal({ data, item, trigger = 'primary' }: { data: YearData; item?: LearningItem; trigger?: 'primary' | 'edit' }) {
  const sts = data.learningStatuses.filter((s) => !s.archived_at || s.id === item?.status_id);
  const types = item && !(LEARNING_TYPES as readonly string[]).includes(item.item_type) ? [...LEARNING_TYPES, item.item_type] : LEARNING_TYPES;
  return (
    <ActionModal wide action={saveLearning} title={item ? 'Edit learning item' : 'Add learning item'} submitLabel={item ? 'Save changes' : 'Add item'}
      draftKey={item ? undefined : `learning-${data.year.id}`}
      triggerLabel={trigger === 'edit' ? 'Edit' : 'Add learning item'} triggerIcon={trigger === 'edit' ? <Pencil className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
      triggerClass={trigger === 'edit' ? 'btn btn-sm' : 'btn btn-primary'}>
      {item ? <input type="hidden" name="id" value={item.id} /> : <input type="hidden" name="year_id" value={data.year.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Title *" className="sm:col-span-2"><input name="title" required defaultValue={item?.title} className="input" maxLength={200} /></Field>
        <Field label="Type"><select name="item_type" defaultValue={item?.item_type ?? 'Skill'} className="input">{types.map((t) => <option key={t}>{t}</option>)}</select></Field>
      </div>
      <Field label="Description"><textarea name="description" rows={3} defaultValue={item?.description ?? ''} className="input" /></Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Status"><select name="status_id" defaultValue={item?.status_id ?? sts[0]?.id} className="input">{sts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <Field label="Start date"><input type="date" name="start_date" defaultValue={item?.start_date ?? ''} className="input" /></Field>
        <Field label="Completion date"><input type="date" name="completion_date" defaultValue={item?.completion_date ?? ''} className="input" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Related goal"><select name="goal_id" defaultValue={item?.goal_id ?? ''} className="input"><option value="">—</option>{data.goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}</select></Field>
        <Field label="Resource / URL"><input type="url" name="resource_url" defaultValue={item?.resource_url ?? ''} className="input" placeholder="https://" /></Field>
      </div>
      <div><span className="label">Related work</span>
        <MultiCheck name="accomplishment_ids" options={data.accomplishments.map((a) => ({ id: a.id, label: a.title, hint: formatDate(a.work_date, { month: 'short', day: 'numeric' }) }))} selected={item?.accomplishmentIds} empty="No work recorded this year yet." />
      </div>
      <Field label="Notes"><textarea name="notes" rows={3} defaultValue={item?.notes ?? ''} className="input" /></Field>
      {!item && <p className="text-xs text-muted">Certificates and evidence can be attached right after saving.</p>}
    </ActionModal>
  );
}
