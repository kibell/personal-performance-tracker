import Link from 'next/link';
import { ArrowDown, ArrowUp, Pencil, Plus } from 'lucide-react';
import { getContext } from '@/lib/page-context';
import { loadYearData } from '@/lib/db/year-data';
import { EmptyState, Field, PageHeader, SectionCard, Text } from '@/components/ui/primitives';
import { ActionModal } from '@/components/ui/ActionModal';
import { ActionButton } from '@/components/ui/ActionButton';
import { RecordActions } from '@/components/common/RecordActions';
import { duplicateResponsibility, saveResponsibility, saveRole } from '@/lib/actions/work';
import { moveItem } from '@/lib/actions/records';
import { parseTags } from '@/lib/utils';
import { Chip } from '@/components/ui/primitives';
import type { Responsibility, Year } from '@/types';

function RespForm({ year, r }: { year: Year; r?: Responsibility }) {
  return (
    <ActionModal action={saveResponsibility} title={r ? 'Edit responsibility' : 'Add responsibility'} submitLabel={r ? 'Save changes' : 'Add'}
      triggerLabel={r ? 'Edit' : 'Add responsibility'} triggerIcon={r ? <Pencil className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />} triggerClass={r ? 'btn btn-sm' : 'btn btn-primary'}>
      {r ? <input type="hidden" name="id" value={r.id} /> : <input type="hidden" name="year_id" value={year.id} />}
      <Field label="Responsibility *"><input name="title" required defaultValue={r?.title} className="input" maxLength={200} /></Field>
      <Field label="Details"><textarea name="description" rows={3} defaultValue={r?.description ?? ''} className="input" /></Field>
    </ActionModal>
  );
}

export default async function RolePage({ params, searchParams }: { params: Promise<{ year: string }>; searchParams: Promise<{ archived?: string }> }) {
  const { year: seg } = await params;
  const sp = await searchParams;
  const { sb, viewer, year } = await getContext(seg);
  const admin = viewer.isAdmin;
  const showArchived = admin && sp.archived === '1';
  const d = await loadYearData(sb, year!, { includeArchived: showArchived });
  const y = year!.year, role = d.role;
  const resps = d.responsibilities.filter((r) => (showArchived ? !!r.archived_at : !r.archived_at));
  const focus = parseTags(role?.focus_areas);

  return (
    <>
      <PageHeader title="Role & Responsibilities" subtitle={`What you are expected to deliver in ${year!.label}`}
        actions={admin && (
          <ActionModal action={saveRole} title="Edit role details" submitLabel="Save role" triggerLabel="Edit role" triggerIcon={<Pencil className="h-4 w-4" aria-hidden />} wide>
            <input type="hidden" name="year_id" value={year!.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job title"><input name="job_title" defaultValue={role?.job_title ?? ''} className="input" /></Field>
              <Field label="Team / department"><input name="team" defaultValue={role?.team ?? ''} className="input" /></Field>
            </div>
            <Field label="Role summary"><textarea name="summary" rows={4} defaultValue={role?.summary ?? ''} className="input" /></Field>
            <Field label="Key focus areas" hint="Separate with commas."><input name="focus_areas" defaultValue={role?.focus_areas ?? ''} className="input" /></Field>
          </ActionModal>
        )} />

      <SectionCard title="Role" className="mb-6">
        {role && (role.job_title || role.team || role.summary) ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-x-3"><p className="text-lg font-semibold">{role.job_title}</p>{role.team && <p className="text-sm text-muted">{role.team}</p>}</div>
            {role.summary && <Text>{role.summary}</Text>}
            {focus.length > 0 && <div><p className="label">Key focus areas</p><div className="flex flex-wrap gap-1.5">{focus.map((f) => <Chip key={f} tone="accent">{f}</Chip>)}</div></div>}
          </div>
        ) : <EmptyState compact title={`No role details for ${year!.label} yet.`} body={admin ? 'Use “Edit role” to add your title, team and summary.' : undefined} />}
      </SectionCard>

      <SectionCard title="Core responsibilities" action={admin && !showArchived ? <RespForm year={year!} /> : undefined}>
        {admin && <div className="mb-4 text-sm"><Link href={showArchived ? `/${y}/role` : `/${y}/role?archived=1`} className="text-accent hover:underline">{showArchived ? '← Back to active' : 'Show archive'}</Link></div>}
        {resps.length === 0 ? <EmptyState compact title="No responsibilities defined yet." body={admin ? 'List the responsibilities you are accountable for, then link your work to them.' : undefined} /> : (
          <ol className="divide-y divide-line">
            {resps.map((r, i) => {
              const linked = d.accomplishments.filter((a) => a.responsibilityIds.includes(r.id));
              return (
                <li key={r.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{r.title}</p>
                      {r.description && <Text className="mt-1 text-muted">{r.description}</Text>}
                      <p className="mt-2 text-xs text-muted">{linked.length} related {linked.length === 1 ? 'accomplishment' : 'accomplishments'}</p>
                      {linked.length > 0 && <ul className="mt-1.5 space-y-0.5 text-sm">{linked.slice(0, 5).map((a) => <li key={a.id}><Link href={`/${y}/work/${a.id}`} className="hover:text-accent hover:underline">{a.title}</Link></li>)}{linked.length > 5 && <li className="text-xs text-muted">+{linked.length - 5} more</li>}</ul>}
                    </div>
                    {admin && (
                      <div className="no-print flex flex-wrap items-center gap-1.5">
                        {!showArchived && <>
                          <ActionButton action={moveItem} fields={{ table: 'responsibilities', id: r.id, dir: 'up', scopeCol: 'year_id', scopeVal: year!.id }} icon={<ArrowUp className="h-4 w-4" />} ariaLabel="Move up" className={`btn btn-ghost btn-sm ${i === 0 ? 'invisible' : ''}`} />
                          <ActionButton action={moveItem} fields={{ table: 'responsibilities', id: r.id, dir: 'down', scopeCol: 'year_id', scopeVal: year!.id }} icon={<ArrowDown className="h-4 w-4" />} ariaLabel="Move down" className={`btn btn-ghost btn-sm ${i === resps.length - 1 ? 'invisible' : ''}`} />
                          <RespForm year={year!} r={r} />
                        </>}
                        <RecordActions table="responsibilities" id={r.id} archived={!!r.archived_at} noun="responsibility" duplicate={duplicateResponsibility} compact />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </SectionCard>
    </>
  );
}
