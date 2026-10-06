import Link from 'next/link';
import { getContext } from '@/lib/page-context';
import { loadYearData } from '@/lib/db/year-data';
import { EmptyState, PageHeader } from '@/components/ui/primitives';
import { LearningCard } from '@/components/learning/LearningCard';
import { LearningFormModal } from '@/components/learning/LearningForm';
import { LEARNING_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default async function LearningPage({ params, searchParams }: { params: Promise<{ year: string }>; searchParams: Promise<{ status?: string; type?: string; archived?: string }> }) {
  const { year: seg } = await params;
  const sp = await searchParams;
  const { sb, viewer, year } = await getContext(seg);
  const admin = viewer.isAdmin;
  const showArchived = admin && sp.archived === '1';
  const d = await loadYearData(sb, year!, { includeArchived: showArchived });
  const y = year!.year;
  const items = d.learning.filter((l) => (showArchived ? !!l.archived_at : !l.archived_at)).filter((l) => (!sp.status || l.status_id === sp.status) && (!sp.type || l.item_type === sp.type));
  const qs = (o: Record<string, string | undefined>) => { const p = new URLSearchParams(); Object.entries({ status: sp.status, type: sp.type, ...o }).forEach(([k, v]) => v && p.set(k, v)); const s = p.toString(); return `/${y}/learning${s ? `?${s}` : ''}`; };
  const pill = (href: string, label: string, active: boolean) => <Link key={label} href={href} aria-current={active ? 'true' : undefined} className={cn('rounded-full px-3 py-1 text-sm', active ? 'bg-accent text-accentfg' : 'bg-surface2 text-muted hover:text-ink')}>{label}</Link>;

  return (
    <>
      <PageHeader title="Learning & Development" subtitle={`Skills, courses, certifications and growth in ${year!.label}`} actions={admin ? <LearningFormModal data={d} /> : undefined} />
      <div className="mb-5 space-y-2">
        <div className="flex flex-wrap gap-2" aria-label="Filter by status">{pill(qs({ status: undefined }), 'Any status', !sp.status)}{d.learningStatuses.filter((s) => !s.archived_at).map((s) => pill(qs({ status: s.id }), s.name, sp.status === s.id))}</div>
        <div className="flex flex-wrap gap-2" aria-label="Filter by type">{pill(qs({ type: undefined }), 'All types', !sp.type)}{LEARNING_TYPES.map((t) => pill(qs({ type: t }), t, sp.type === t))}
          {admin && <span className="ml-auto">{pill(showArchived ? `/${y}/learning` : `/${y}/learning?archived=1`, 'Archive', showArchived)}</span>}</div>
      </div>
      {items.length === 0 ? (
        <EmptyState title={d.learning.length ? 'Nothing matches these filters' : `No learning tracked for ${year!.label} yet.`} body={admin && !d.learning.length ? 'Track courses, certifications, new technologies and research topics.' : undefined}>
          {admin && !d.learning.length && <LearningFormModal data={d} />}
        </EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((l) => <LearningCard key={l.id} item={l} yearNumber={y} admin={admin} data={d} goal={d.goals.find((g) => g.id === l.goal_id)} work={d.accomplishments.filter((a) => l.accomplishmentIds.includes(a.id))} />)}
        </div>
      )}
    </>
  );
}
