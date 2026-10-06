import { Pencil, Plus } from 'lucide-react';
import { saveAccomplishment } from '@/lib/actions/work';
import { ActionModal } from '@/components/ui/ActionModal';
import { Field } from '@/components/ui/primitives';
import { Check, MultiCheck, TodayDate } from '@/components/ui/inputs';
import { formatDate } from '@/lib/utils';
import type { Accomplishment, YearData } from '@/types';

export function WorkFormModal({ data, acc, techSuggestions = [], trigger = 'primary' }: { data: YearData; acc?: Accomplishment; techSuggestions?: string[]; trigger?: 'primary' | 'edit' }) {
  const cats = data.categories.filter((c) => !c.archived_at || c.id === acc?.category_id);
  const sts = data.workStatuses.filter((s) => !s.archived_at || s.id === acc?.status_id);
  const dl = 'tech-suggestions';
  return (
    <ActionModal wide action={saveAccomplishment} submitLabel={acc ? 'Save changes' : 'Add accomplishment'}
      title={acc ? 'Edit accomplishment' : 'Add accomplishment'} description="Only a title and date are required — fill in the rest whenever you have time."
      draftKey={acc ? undefined : `work-${data.year.id}`} redirectBase={acc ? undefined : `/${data.year.year}/work/`}
      triggerLabel={trigger === 'edit' ? 'Edit' : 'Add accomplishment'} triggerIcon={trigger === 'edit' ? <Pencil className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
      triggerClass={trigger === 'edit' ? 'btn btn-sm' : 'btn btn-primary'}>
      {acc ? <input type="hidden" name="id" value={acc.id} /> : <input type="hidden" name="year_id" value={data.year.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Work / project title *" className="sm:col-span-2"><input name="title" required defaultValue={acc?.title} className="input" maxLength={200} /></Field>
        <Field label="Date *"><TodayDate name="work_date" defaultValue={acc?.work_date} required /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Status"><select name="status_id" defaultValue={acc?.status_id ?? sts.find((s) => s.phase === 'complete')?.id} className="input">{sts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <Field label="Category"><select name="category_id" defaultValue={acc?.category_id ?? ''} className="input"><option value="">—</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}{c.archived_at ? ' (archived)' : ''}</option>)}</select></Field>
        <Field label="Project"><input name="project" defaultValue={acc?.project ?? ''} className="input" placeholder="e.g. Nurture Campaign" /></Field>
      </div>
      <Field label="Description"><textarea name="description" rows={3} defaultValue={acc?.description ?? ''} className="input" /></Field>
      <Field label="What I contributed"><textarea name="contribution" rows={2} defaultValue={acc?.contribution ?? ''} className="input" /></Field>
      <Field label="Business / student / team impact"><textarea name="impact" rows={2} defaultValue={acc?.impact ?? ''} className="input" /></Field>
      <Field label="Skills / technologies used" hint="Separate with commas.">
        <input name="technologies" list={dl} defaultValue={acc?.technologies.join(', ') ?? ''} className="input" placeholder="HTML, CSS, Salesforce Marketing Cloud" />
        <datalist id={dl}>{techSuggestions.map((t) => <option key={t} value={t} />)}</datalist>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><span className="label">Related goal(s)</span><MultiCheck name="goal_ids" options={data.goals.map((g) => ({ id: g.id, label: g.title }))} selected={acc?.goalIds} empty="No goals for this year yet." /></div>
        <div><span className="label">Responsibilities supported</span><MultiCheck name="responsibility_ids" options={data.responsibilities.map((r) => ({ id: r.id, label: r.title }))} selected={acc?.responsibilityIds} empty="No responsibilities defined yet." /></div>
      </div>
      <Field label="Evidence / link"><input name="evidence_url" type="url" defaultValue={acc?.evidence_url ?? ''} className="input" placeholder="https://" /></Field>
      <Field label="Notes" hint="Anything else worth remembering — context, blockers, feedback received."><textarea name="notes" rows={3} defaultValue={acc?.notes ?? ''} className="input" /></Field>
      <Check name="is_highlight" label="Include as Performance Review Highlight" hint="Shown on the dashboard and in the annual review summary." defaultChecked={acc?.is_highlight} />
      {!acc && <p className="text-xs text-muted">Screenshots and attachments can be added right after saving.</p>}
      {acc && <p className="text-xs text-muted">Last updated {formatDate(acc.updated_at)}. Manage screenshots from the entry page.</p>}
    </ActionModal>
  );
}
