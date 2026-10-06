import Link from 'next/link';
import { ChevronLeft, ChevronRight, Inbox, Star } from 'lucide-react';
import { getContext } from '@/lib/page-context';
import { loadYearData } from '@/lib/db/year-data';
import { queryAccomplishments } from '@/lib/db/work-query';
import { Chip, EmptyState, PageHeader, StatusChip } from '@/components/ui/primitives';
import { WorkFilters } from '@/components/work/WorkFilters';
import { WorkCard } from '@/components/work/WorkCard';
import { Timeline } from '@/components/work/Timeline';
import { WorkFormModal } from '@/components/work/WorkForm';
import { formatDate, plural } from '@/lib/utils';

const KEYS = ['q', 'category', 'status', 'goal', 'project', 'tech', 'from', 'to', 'highlight', 'inbox', 'show', 'sort', 'view'] as const;

export default async function WorkPage({ params, searchParams }: { params: Promise<{ year: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { year: seg } = await params;
  const sp = await searchParams;
  const { sb, viewer, year, prefs } = await getContext(seg);
  const admin = viewer.isAdmin;
  const y = year!.year;
  const values = Object.fromEntries(KEYS.map((k) => [k, sp[k] ?? ''])) as Record<string, string>;
  if (!admin) { values.show = ''; values.inbox = ''; }
  const [data, result] = await Promise.all([
    loadYearData(sb, year!),
    queryAccomplishments(sb, year!.id, {
      q: values.q, category: values.category, status: values.status, goal: values.goal, project: values.project, tech: values.tech,
      from: values.from, to: values.to, highlight: values.highlight, inbox: values.inbox,
      show: (values.show as 'active' | 'archived' | 'all') || 'active', sort: values.sort, page: Number(sp.page) || 1, pageSize: prefs.pageSize,
    }),
  ]);
  const projects = [...new Set(data.accomplishments.map((a) => a.project).filter(Boolean) as string[])].sort();
  const techs = [...new Map(data.accomplishments.flatMap((a) => a.technologies).map((t) => [t.toLowerCase(), t])).values()].sort((a, b) => a.localeCompare(b));
  const filtered = KEYS.some((k) => k !== 'sort' && k !== 'view' && values[k] && !(k === 'show' && values[k] === 'active'));
  const pages = Math.max(1, Math.ceil(result.total / prefs.pageSize));
  const link = (p: number) => { const qs = new URLSearchParams(); KEYS.forEach((k) => values[k] && qs.set(k, values[k])); qs.set('page', String(p)); return `/${y}/work?${qs}`; };

  return (
    <>
      <PageHeader title="Work & Accomplishments" subtitle={`${plural(result.total, 'entry', 'entries')}${filtered ? ' match your filters' : ` in ${year!.label}`}`}
        actions={admin ? <WorkFormModal data={data} techSuggestions={techs} /> : undefined} />
      <WorkFilters year={y} values={values} categories={data.categories} statuses={data.workStatuses} goals={data.goals} projects={projects} techs={techs} admin={admin} />

      {result.items.length === 0 ? (
        filtered ? <EmptyState title="No work matches these filters" body="Try removing a filter or searching for something broader."><Link className="btn" href={`/${y}/work`}>Reset filters</Link></EmptyState>
          : <EmptyState title={`No work recorded for ${year!.label} yet.`} body={admin ? 'Use Quick add (or press Q) to capture work as you finish it.' : undefined}>{admin && <WorkFormModal data={data} />}</EmptyState>
      ) : values.view === 'timeline' ? (
        <div className="card p-5"><Timeline items={result.items} yearNumber={y} /></div>
      ) : (
        <>
          <div className="card hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-surface2 text-xs uppercase tracking-wide text-muted">
                <tr><th scope="col" className="px-4 py-2.5 font-semibold">Date</th><th scope="col" className="px-4 py-2.5 font-semibold">Title</th><th scope="col" className="px-4 py-2.5 font-semibold">Category</th><th scope="col" className="px-4 py-2.5 font-semibold">Status</th><th scope="col" className="px-4 py-2.5 font-semibold">Technologies</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result.items.map((a) => (
                  <tr key={a.id} className="hover:bg-surface2/60">
                    <td className="whitespace-nowrap px-4 py-3 text-muted"><time dateTime={a.work_date}>{formatDate(a.work_date)}</time></td>
                    <td className="max-w-md px-4 py-3">
                      <Link href={`/${y}/work/${a.id}`} className="font-medium hover:text-accent">{a.title}</Link>
                      <span className="ml-2 inline-flex gap-1 align-middle">
                        {a.is_highlight && <span className="text-warning" title="Highlight"><Star className="h-3.5 w-3.5 fill-current" aria-hidden /><span className="sr-only">Highlight</span></span>}
                        {admin && a.needs_details && <Chip tone="warning"><Inbox className="h-3 w-3" aria-hidden />Needs details</Chip>}
                        {a.archived_at && <Chip>Archived</Chip>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{a.category?.name}</td>
                    <td className="px-4 py-3"><StatusChip status={a.status} /></td>
                    <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{a.technologies.slice(0, 3).map((t) => <Chip key={t}>{t}</Chip>)}{a.technologies.length > 3 && <Chip>+{a.technologies.length - 3}</Chip>}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">{result.items.map((a) => <WorkCard key={a.id} acc={a} yearNumber={y} showAdminFlags={admin} />)}</div>
        </>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-5 flex items-center justify-between text-sm">
          <Link aria-disabled={result.page <= 1} className={`btn ${result.page <= 1 ? 'pointer-events-none opacity-50' : ''}`} href={link(result.page - 1)}><ChevronLeft className="h-4 w-4" aria-hidden />Previous</Link>
          <span className="text-muted">Page {result.page} of {pages}</span>
          <Link aria-disabled={result.page >= pages} className={`btn ${result.page >= pages ? 'pointer-events-none opacity-50' : ''}`} href={link(result.page + 1)}>Next<ChevronRight className="h-4 w-4" aria-hidden /></Link>
        </nav>
      )}
    </>
  );
}
