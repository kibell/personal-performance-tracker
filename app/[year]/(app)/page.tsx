import Link from 'next/link';
import { ArrowRight, Inbox, Star } from 'lucide-react';
import { getContext } from '@/lib/page-context';
import { loadYearData } from '@/lib/db/year-data';
import { yearStats } from '@/lib/stats';
import { Chip, EmptyState, ProgressBar, SectionCard, StatTile, StatusChip, PageHeader } from '@/components/ui/primitives';
import { WorkCard } from '@/components/work/WorkCard';
import { Timeline } from '@/components/work/Timeline';
import { BarList, MonthChart } from '@/components/common/charts';
import { WorkFormModal } from '@/components/work/WorkForm';
import { formatDate } from '@/lib/utils';

export default async function Dashboard({ params }: { params: Promise<{ year: string }> }) {
  const { year: seg } = await params;
  const { sb, viewer, year, owner } = await getContext(seg);
  const d = await loadYearData(sb, year!);
  const s = yearStats(d);
  const y = year!.year;
  const admin = viewer.isAdmin;
  const activeGoals = d.goals.filter((g) => g.status?.phase === 'active' || g.status?.phase === 'not_started');
  const activeLearning = d.learning.filter((l) => l.status?.phase !== 'inactive').sort((a, b) => Number(a.status?.phase === 'complete') - Number(b.status?.phase === 'complete'));

  return (
    <>
      <PageHeader title={`${year!.label} Performance Review`} subtitle={owner ? [owner.display_name, owner.job_title].filter(Boolean).join(' · ') : undefined}
        actions={admin ? <WorkFormModal data={d} techSuggestions={s.tech.map((t) => t.name)} /> : undefined} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatTile label="Accomplishments" value={s.accomplishments} hint={`${s.highlights.length} highlighted`} href={`/${y}/work`} />
        <StatTile label="Goals" value={s.goals} href={`/${y}/goals`} />
        <StatTile label="Completed" value={s.goalsCompleted} hint="goals" href={`/${y}/goals`} />
        <StatTile label="In Progress" value={s.goalsActive} hint="goals" href={`/${y}/goals`} />
        <StatTile label="Learning" value={s.learning} hint={`${s.learningActive} in progress`} href={`/${y}/learning`} />
      </div>

      {admin && s.inbox.length > 0 && (
        <Link href={`/${y}/work?inbox=1`} className="card mt-6 flex items-center gap-3 border-warning/40 bg-warningsoft px-5 py-3.5 text-sm text-warning">
          <Inbox className="h-4 w-4" aria-hidden /><span className="flex-1 font-medium">{s.inbox.length} quick {s.inbox.length === 1 ? 'entry needs' : 'entries need'} details</span><span className="inline-flex items-center gap-1">Open inbox <ArrowRight className="h-3.5 w-3.5" aria-hidden /></span>
        </Link>
      )}

      {s.accomplishments === 0 && d.goals.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={`No work recorded for ${year!.label} yet.`} body={admin ? 'Capture something you worked on — even a single sentence. You can add detail later.' : 'Nothing has been added to this year yet.'}>
            {admin && <WorkFormModal data={d} />}
          </EmptyState>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SectionCard title="Recent Work" action={<Link href={`/${y}/work`} className="text-sm text-accent hover:underline">View all</Link>}>
              {d.accomplishments.length ? <div className="grid gap-3">{[...d.accomplishments].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5).map((a) => <WorkCard key={a.id} acc={a} yearNumber={y} showAdminFlags={admin} />)}</div>
                : <EmptyState compact title="No work yet" />}
            </SectionCard>

            <SectionCard title="Performance Review Highlights" action={<Link href={`/${y}/review`} className="text-sm text-accent hover:underline">Review summary</Link>}>
              {s.highlights.length ? (
                <ul className="space-y-4">
                  {s.highlights.slice(0, 5).map((a) => (
                    <li key={a.id} className="flex gap-3">
                      <Star className="mt-0.5 h-4 w-4 shrink-0 fill-current text-warning" aria-hidden />
                      <div className="min-w-0">
                        <Link href={`/${y}/work/${a.id}`} className="font-medium hover:text-accent">{a.title}</Link>
                        <p className="text-xs text-muted">{formatDate(a.work_date)}{a.category && ` · ${a.category.name}`}</p>
                        {(a.impact || a.description) && <p className="mt-1 line-clamp-2 text-sm text-muted">{a.impact || a.description}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <EmptyState compact title="No highlights yet" body="Toggle “Include as Performance Review Highlight” on the work that matters most." />}
            </SectionCard>

            <SectionCard title="Activity by Month">
              <MonthChart year={y} counts={s.byMonth} />
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Goal Progress" action={<Link href={`/${y}/goals`} className="text-sm text-accent hover:underline">All goals</Link>}>
              {activeGoals.length ? (
                <ul className="space-y-4">{activeGoals.map((g) => (
                  <li key={g.id}><div className="mb-1.5 flex items-start justify-between gap-2"><Link href={`/${y}/goals#goal-${g.id}`} className="text-sm font-medium hover:text-accent">{g.title}</Link><StatusChip status={g.status} /></div><ProgressBar value={g.progress} tone={g.status?.tone} label={`${g.title} progress`} /></li>
                ))}</ul>
              ) : <EmptyState compact title="No active goals" body={s.goals ? 'All goals are completed or deferred.' : undefined} />}
            </SectionCard>

            <SectionCard title="Learning & Development" action={<Link href={`/${y}/learning`} className="text-sm text-accent hover:underline">View all</Link>}>
              {activeLearning.length ? (
                <ul className="space-y-3">{activeLearning.slice(0, 6).map((l) => (
                  <li key={l.id} className="flex items-start justify-between gap-2"><div><p className="text-sm font-medium">{l.title}</p><p className="text-xs text-muted">{l.item_type}</p></div><StatusChip status={l.status} /></li>
                ))}</ul>
              ) : <EmptyState compact title="Nothing tracked yet" />}
            </SectionCard>

            <SectionCard title="Work by Category">
              {s.categories.length ? <BarList rows={s.categories.slice(0, 6)} /> : <EmptyState compact title="No data yet" />}
            </SectionCard>

            <SectionCard title="Activity Timeline">
              {d.accomplishments.length ? <Timeline items={d.accomplishments} yearNumber={y} limit={8} grouped={false} /> : <EmptyState compact title="No activity yet" />}
              {s.tech.length > 0 && <div className="mt-5 flex flex-wrap gap-1.5 border-t border-line pt-4">{s.tech.slice(0, 8).map((t) => <Chip key={t.name}>{t.name} · {t.count}</Chip>)}</div>}
            </SectionCard>
          </div>
        </div>
      )}
    </>
  );
}
