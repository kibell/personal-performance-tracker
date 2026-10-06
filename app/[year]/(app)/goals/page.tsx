import Link from 'next/link';
import { getContext } from '@/lib/page-context';
import { loadYearData } from '@/lib/db/year-data';
import { EmptyState, PageHeader } from '@/components/ui/primitives';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalFormModal } from '@/components/goals/GoalForm';
import { cn } from '@/lib/utils';

export default async function GoalsPage({ params, searchParams }: { params: Promise<{ year: string }>; searchParams: Promise<{ status?: string; archived?: string }> }) {
  const { year: seg } = await params;
  const sp = await searchParams;
  const { sb, viewer, year } = await getContext(seg);
  const admin = viewer.isAdmin;
  const showArchived = admin && sp.archived === '1';
  const d = await loadYearData(sb, year!, { includeArchived: showArchived });
  const y = year!.year;
  const goals = d.goals.filter((g) => (showArchived ? !!g.archived_at : !g.archived_at)).filter((g) => !sp.status || g.status_id === sp.status);
  const tab = (href: string, label: string, active: boolean) => <Link key={label} href={href} aria-current={active ? 'true' : undefined} className={cn('rounded-full px-3 py-1 text-sm', active ? 'bg-accent text-accentfg' : 'bg-surface2 text-muted hover:text-ink')}>{label}</Link>;

  return (
    <>
      <PageHeader title="Goals" subtitle={`${d.goals.filter((g) => !g.archived_at).length} goals for ${year!.label}`} actions={admin ? <GoalFormModal data={d} /> : undefined} />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {tab(`/${y}/goals`, 'All', !sp.status && !showArchived)}
        {d.goalStatuses.filter((s) => !s.archived_at).map((s) => tab(`/${y}/goals?status=${s.id}`, s.name, sp.status === s.id))}
        {admin && <span className="ml-auto">{tab(`/${y}/goals?archived=1`, 'Archive', showArchived)}</span>}
      </div>
      {goals.length === 0 ? (
        <EmptyState title={showArchived ? 'No archived goals' : sp.status ? 'No goals with this status' : `No goals set for ${year!.label} yet.`} body={admin && !showArchived && !sp.status ? 'Define what you want to achieve this year, then link your work to it.' : undefined}>
          {admin && !showArchived && !sp.status && <GoalFormModal data={d} />}
        </EmptyState>
      ) : (
        <div className="grid gap-5">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} yearNumber={y} admin={admin} data={d} statuses={d.goalStatuses}
              related={d.accomplishments.filter((a) => a.goalIds.includes(g.id))} />
          ))}
        </div>
      )}
    </>
  );
}
