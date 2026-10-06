import { ArrowDown, ArrowUp, Pencil, Plus } from 'lucide-react';
import type { Category, Status, StatusKind } from '@/types';
import { ActionModal } from '@/components/ui/ActionModal';
import { ActionButton } from '@/components/ui/ActionButton';
import { Chip, EmptyState, Field } from '@/components/ui/primitives';
import { RecordActions } from '@/components/common/RecordActions';
import { moveItem } from '@/lib/actions/records';
import { saveCategory, saveStatus } from '@/lib/actions/admin';

const Mover = ({ table, id, i, n, scope }: { table: string; id: string; i: number; n: number; scope?: { col: string; val: string } }) => {
  const f = (dir: string) => ({ table, id, dir, ...(scope ? { scopeCol: scope.col, scopeVal: scope.val } : {}) });
  return (<>
    <ActionButton action={moveItem} fields={f('up')} icon={<ArrowUp className="h-4 w-4" />} ariaLabel="Move up" className={`btn btn-ghost btn-sm ${i === 0 ? 'invisible' : ''}`} />
    <ActionButton action={moveItem} fields={f('down')} icon={<ArrowDown className="h-4 w-4" />} ariaLabel="Move down" className={`btn btn-ghost btn-sm ${i === n - 1 ? 'invisible' : ''}`} />
  </>);
};

function CategoryForm({ c }: { c?: Category }) {
  return (
    <ActionModal action={saveCategory} title={c ? 'Rename category' : 'Add category'} submitLabel={c ? 'Save' : 'Add category'}
      triggerLabel={c ? undefined : 'Add category'} ariaLabel={c ? `Rename ${c.name}` : undefined}
      triggerIcon={c ? <Pencil className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />} triggerClass={c ? 'btn btn-ghost btn-sm' : 'btn btn-primary'}>
      {c && <input type="hidden" name="id" value={c.id} />}
      <Field label="Name"><input name="name" required defaultValue={c?.name} className="input" maxLength={80} /></Field>
    </ActionModal>
  );
}

export function CategoriesSection({ categories, usage }: { categories: Category[]; usage: Record<string, number> }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between"><p className="text-sm text-muted">Order here controls dropdowns. Archive to hide a category from new entries; delete only works when unused.</p><CategoryForm /></div>
      <ul className="divide-y divide-line rounded-xl border border-line">
        {categories.map((c, i) => (
          <li key={c.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5">
            <span className={`min-w-0 flex-1 text-sm ${c.archived_at ? 'text-muted line-through' : ''}`}>{c.name}</span>
            <span className="text-xs text-muted">{usage[c.id] ?? 0} used</span>
            {c.archived_at && <Chip>Archived</Chip>}
            <Mover table="categories" id={c.id} i={i} n={categories.length} />
            <CategoryForm c={c} />
            <RecordActions table="categories" id={c.id} archived={!!c.archived_at} noun="category" compact />
          </li>
        ))}
      </ul>
    </div>
  );
}

const TONES = ['neutral', 'info', 'success', 'warning', 'danger'];
const PHASES: [string, string][] = [['not_started', 'Not started'], ['active', 'In progress / active'], ['complete', 'Counts as complete'], ['inactive', 'Paused / dropped']];

function StatusForm({ kind, s }: { kind: StatusKind; s?: Status }) {
  return (
    <ActionModal action={saveStatus} title={s ? 'Edit status' : 'Add status'} submitLabel={s ? 'Save' : 'Add status'}
      triggerLabel={s ? undefined : 'Add'} ariaLabel={s ? `Edit ${s.name}` : undefined}
      triggerIcon={s ? <Pencil className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />} triggerClass={s ? 'btn btn-ghost btn-sm' : 'btn btn-sm'}>
      {s ? <input type="hidden" name="id" value={s.id} /> : <input type="hidden" name="kind" value={kind} />}
      <Field label="Name"><input name="name" required defaultValue={s?.name} className="input" maxLength={40} /></Field>
      <Field label="Counts as" hint="Controls dashboard totals (e.g. what is “Completed” or “In Progress”)."><select name="phase" defaultValue={s?.phase ?? 'active'} className="input">{PHASES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
      <Field label="Color"><select name="tone" defaultValue={s?.tone ?? 'neutral'} className="input">{TONES.map((t) => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}</select></Field>
    </ActionModal>
  );
}

export function StatusesSection({ statuses }: { statuses: Status[] }) {
  const groups: [StatusKind, string][] = [['work', 'Work statuses'], ['goal', 'Goal statuses'], ['learning', 'Learning statuses']];
  return (
    <div className="space-y-8">
      {groups.map(([kind, label]) => {
        const list = statuses.filter((s) => s.kind === kind);
        return (
          <section key={kind}>
            <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">{label}</h3><StatusForm kind={kind} /></div>
            {list.length === 0 ? <EmptyState compact title="No statuses" /> : (
              <ul className="divide-y divide-line rounded-xl border border-line">
                {list.map((s, i) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5">
                    <Chip tone={s.tone}>{s.name}</Chip><span className="min-w-0 flex-1 text-xs text-muted">{PHASES.find(([v]) => v === s.phase)?.[1]}</span>
                    {s.archived_at && <Chip>Archived</Chip>}
                    <Mover table="statuses" id={s.id} i={i} n={list.length} scope={{ col: 'kind', val: kind }} />
                    <StatusForm kind={kind} s={s} />
                    <RecordActions table="statuses" id={s.id} archived={!!s.archived_at} noun="status" compact />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
