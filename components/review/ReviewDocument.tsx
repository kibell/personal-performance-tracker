import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Profile, YearData } from '@/types';
import { yearStats } from '@/lib/stats';
import { formatDate, lines, safeUrl, parseTags } from '@/lib/utils';
import { Chip, ProgressBar, StatusChip } from '@/components/ui/primitives';

const H = ({ children, id }: { children: ReactNode; id: string }) => <h2 id={id} className="mb-3 mt-9 border-b border-line pb-2 text-lg font-semibold tracking-tight first:mt-0">{children}</h2>;
const P = ({ children }: { children: ReactNode }) => <p className="prose-pre text-sm leading-relaxed">{children}</p>;
const Empty = ({ children }: { children: ReactNode }) => <p className="text-sm italic text-muted">{children}</p>;

/** Live-computed review. Only the narrative / challenges / priorities are stored text; everything else is derived. */
export function ReviewDocument({ data, owner, links }: { data: YearData; owner: Profile | null; links?: boolean }) {
  const s = yearStats(data);
  const y = data.year.year;
  const hl = [...s.highlights].sort((a, b) => a.work_date.localeCompare(b.work_date));
  const goalById = new Map(data.goals.map((g) => [g.id, g]));
  const role = data.role;
  const A = ({ id, children }: { id: string; children: ReactNode }) => links ? <Link href={`/${y}/work/${id}`} className="hover:text-accent hover:underline">{children}</Link> : <>{children}</>;

  const groups = new Map<string, typeof hl>();
  hl.forEach((a) => { const k = a.project || a.category?.name || 'Other'; groups.set(k, [...(groups.get(k) ?? []), a]); });
  const completedLearning = data.learning.filter((l) => l.status?.phase === 'complete');
  const activeLearning = data.learning.filter((l) => l.status?.phase === 'active');
  const goalsOrdered = [...data.goals].sort((a, b) => Number(b.status?.phase === 'complete') - Number(a.status?.phase === 'complete'));
  const narrative = data.review?.narrative, challenges = data.review?.challenges, next = lines(data.review?.next_priorities);

  return (
    <div className="text-ink">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Annual Performance Review</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{data.year.label}</h1>
        {owner && <p className="mt-1 text-sm text-muted">{[owner.display_name, role?.job_title || owner.job_title, role?.team || owner.department].filter(Boolean).join(' · ')}</p>}
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[['Accomplishments', s.accomplishments], ['Highlights', s.highlights.length], ['Goals completed', `${s.goalsCompleted} of ${s.goals}`], ['Learning items', s.learning]].map(([k, v]) => (
            <div key={String(k)} className="rounded-lg border border-line px-3 py-2"><dt className="text-xs text-muted">{k}</dt><dd className="text-xl font-semibold tabular-nums">{v}</dd></div>
          ))}
        </dl>
      </header>

      {narrative && (<><H id="r-summary">Summary</H><P>{narrative}</P></>)}

      <H id="r-major">Major Accomplishments</H>
      {hl.length === 0 ? <Empty>No accomplishments are marked as performance review highlights yet.</Empty> : (
        <ol className="space-y-5">
          {hl.map((a) => {
            const gl = a.goalIds.map((id) => goalById.get(id)?.title).filter(Boolean) as string[];
            const ev = safeUrl(a.evidence_url);
            return (
              <li key={a.id} className="avoid-break">
                <h3 className="font-semibold"><A id={a.id}>{a.title}</A></h3>
                <p className="text-xs text-muted">{formatDate(a.work_date)}{a.category && ` · ${a.category.name}`}{a.project && ` · ${a.project}`}</p>
                {a.description && <div className="mt-1.5"><P>{a.description}</P></div>}
                {a.impact && <p className="mt-1.5 text-sm"><span className="font-semibold">Impact: </span>{a.impact}</p>}
                {a.technologies.length > 0 && <p className="mt-1.5 text-xs text-muted">Skills & technologies: {a.technologies.join(', ')}</p>}
                {gl.length > 0 && <p className="mt-1 text-xs text-muted">Supports goal{gl.length > 1 ? 's' : ''}: {gl.join('; ')}</p>}
                {ev && <p className="mt-1 break-all text-xs text-muted">Evidence: {ev}</p>}
              </li>
            );
          })}
        </ol>
      )}

      <H id="r-contrib">Key Contributions</H>
      {groups.size === 0 ? <Empty>Highlighted work will be summarized here by project.</Empty> : (
        <div className="space-y-4">
          {[...groups].map(([name, rows]) => (
            <div key={name} className="avoid-break"><h3 className="text-sm font-semibold">{name}</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{rows.map((a) => <li key={a.id}><span className="font-medium">{a.title}</span>{a.contribution ? ` — ${a.contribution}` : ''}</li>)}</ul></div>
          ))}
        </div>
      )}

      <H id="r-goals">Goals</H>
      {goalsOrdered.length === 0 ? <Empty>No goals were set for this year.</Empty> : (
        <ul className="space-y-5">
          {goalsOrdered.map((g) => {
            const n = data.accomplishments.filter((a) => a.goalIds.includes(g.id));
            return (
              <li key={g.id} className="avoid-break">
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{g.title}</h3><StatusChip status={g.status} /></div>
                <div className="my-2 max-w-md"><ProgressBar value={g.progress} tone={g.status?.tone} label={`${g.title} progress`} /></div>
                {g.success_metric && <p className="text-sm"><span className="font-semibold">Success metric: </span>{g.success_metric}</p>}
                {g.final_outcome ? <p className="mt-1 text-sm"><span className="font-semibold">Outcome: </span>{g.final_outcome}</p> : g.progress_notes && <p className="mt-1 text-sm"><span className="font-semibold">Progress: </span>{g.progress_notes}</p>}
                <p className="mt-1 text-xs text-muted">{n.length} related {n.length === 1 ? 'accomplishment' : 'accomplishments'}{g.target_date && ` · Target ${formatDate(g.target_date)}`}</p>
              </li>
            );
          })}
        </ul>
      )}

      <H id="r-skills">Skills Developed</H>
      {completedLearning.length + activeLearning.length + s.tech.length === 0 ? <Empty>Learning items and technologies used will appear here.</Empty> : (
        <div className="space-y-4">
          {completedLearning.length > 0 && <div><h3 className="text-sm font-semibold">Completed</h3><ul className="mt-1 list-disc pl-5 text-sm">{completedLearning.map((l) => <li key={l.id}>{l.title} <span className="text-muted">({l.item_type}{l.completion_date && `, ${formatDate(l.completion_date, { month: 'short', year: 'numeric' })}`})</span></li>)}</ul></div>}
          {activeLearning.length > 0 && <div><h3 className="text-sm font-semibold">In progress</h3><ul className="mt-1 list-disc pl-5 text-sm">{activeLearning.map((l) => <li key={l.id}>{l.title} <span className="text-muted">({l.item_type})</span></li>)}</ul></div>}
          {s.tech.length > 0 && <div><h3 className="text-sm font-semibold">Technologies applied in work</h3><div className="mt-1.5 flex flex-wrap gap-1.5">{s.tech.map((t) => <Chip key={t.name}>{t.name} · {t.count}</Chip>)}</div></div>}
        </div>
      )}

      <H id="r-role">Role Alignment</H>
      {role?.summary && <div className="mb-4"><P>{role.summary}</P>{parseTags(role.focus_areas).length > 0 && <p className="mt-1.5 text-xs text-muted">Focus areas: {parseTags(role.focus_areas).join(', ')}</p>}</div>}
      {data.responsibilities.length === 0 ? <Empty>No responsibilities defined for this year.</Empty> : (
        <ul className="space-y-3">
          {data.responsibilities.map((r) => {
            const all = data.accomplishments.filter((a) => a.responsibilityIds.includes(r.id));
            const top = all.filter((a) => a.is_highlight);
            return (
              <li key={r.id} className="avoid-break"><p className="text-sm font-semibold">{r.title}</p>
                <p className="text-xs text-muted">{all.length} related accomplishment{all.length === 1 ? '' : 's'}{top.length > 0 && `, ${top.length} highlighted`}</p>
                {top.length > 0 && <ul className="mt-1 list-disc pl-5 text-sm">{top.map((a) => <li key={a.id}>{a.title}</li>)}</ul>}
              </li>
            );
          })}
        </ul>
      )}

      <H id="r-challenges">Challenges & Lessons Learned</H>
      {challenges ? <P>{challenges}</P> : <Empty>Not written yet.</Empty>}

      <H id="r-next">Next-Year Priorities</H>
      {next.length ? <ul className="list-disc space-y-1 pl-5 text-sm">{next.map((n, i) => <li key={i}>{n}</li>)}</ul> : <Empty>Not written yet.</Empty>}
    </div>
  );
}
