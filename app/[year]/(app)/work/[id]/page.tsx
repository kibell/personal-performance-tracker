import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Inbox, Star } from 'lucide-react';
import { getContext } from '@/lib/page-context';
import { loadYearData } from '@/lib/db/year-data';
import { getAccomplishment } from '@/lib/db/work-query';
import { Chip, SectionCard, StatusChip, Text } from '@/components/ui/primitives';
import { Gallery } from '@/components/common/Gallery';
import { AttachmentManager } from '@/components/common/AttachmentManager';
import { RecordActions } from '@/components/common/RecordActions';
import { WorkFormModal } from '@/components/work/WorkForm';
import { duplicateAccomplishment } from '@/lib/actions/work';
import { formatDate, formatTimestamp, safeUrl } from '@/lib/utils';

export default async function WorkDetail({ params }: { params: Promise<{ year: string; id: string }> }) {
  const { year: seg, id } = await params;
  const { sb, viewer, year } = await getContext(seg);
  const acc = await getAccomplishment(sb, id);
  if (!acc || acc.year_id !== year!.id) notFound();
  const data = await loadYearData(sb, year!);
  const y = year!.year;
  const admin = viewer.isAdmin;
  const goals = data.goals.filter((g) => acc.goalIds.includes(g.id));
  const resps = data.responsibilities.filter((r) => acc.responsibilityIds.includes(r.id));
  const learning = data.learning.filter((l) => l.accomplishmentIds.includes(acc.id));
  const link = safeUrl(acc.evidence_url);
  const techs = [...new Set(data.accomplishments.flatMap((a) => a.technologies))];

  const block = (label: string, v: string | null) => v ? <div><p className="label">{label}</p><Text>{v}</Text></div> : null;
  return (
    <>
      <Link href={`/${y}/work`} className="no-print mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" aria-hidden />All work</Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">{acc.title}{acc.is_highlight && <Star className="h-5 w-5 fill-current text-warning" aria-label="Performance review highlight" />}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <time dateTime={acc.work_date}>{formatDate(acc.work_date)}</time>
            {acc.category && <Chip>{acc.category.name}</Chip>}<StatusChip status={acc.status} />
            {acc.project && <Chip tone="accent">{acc.project}</Chip>}
            {acc.archived_at && <Chip tone="warning">Archived</Chip>}
            {admin && acc.needs_details && <Chip tone="warning"><Inbox className="h-3 w-3" aria-hidden />Needs details</Chip>}
          </p>
        </div>
        {admin && (
          <div className="no-print flex flex-wrap gap-2">
            <WorkFormModal data={data} acc={acc} techSuggestions={techs} trigger="edit" />
            <RecordActions table="accomplishments" id={acc.id} archived={!!acc.archived_at} noun="accomplishment" duplicate={duplicateAccomplishment} redirectTo={`/${y}/work`} />
          </div>
        )}
      </div>

      {admin && acc.needs_details && (
        <p className="mb-5 rounded-lg bg-warningsoft px-4 py-3 text-sm text-warning">This quick entry is waiting for details. Use <strong>Edit</strong> to add a description, impact and goals — saving clears it from your inbox.</p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Details">
            <div className="space-y-5">
              {block('Description', acc.description)}{block('What I contributed', acc.contribution)}{block('Business / student / team impact', acc.impact)}{block('Notes', acc.notes)}
              {!acc.description && !acc.contribution && !acc.impact && !acc.notes && <p className="text-sm text-muted">No additional details recorded yet.</p>}
              {acc.technologies.length > 0 && <div><p className="label">Skills / technologies</p><div className="flex flex-wrap gap-1.5">{acc.technologies.map((t) => <Chip key={t}>{t}</Chip>)}</div></div>}
              {link && <div><p className="label">Evidence</p><a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-sm text-accent hover:underline">{link}<ExternalLink className="h-3 w-3 shrink-0" aria-hidden /></a></div>}
            </div>
          </SectionCard>
          {(acc.attachments.length > 0 || admin) && (
            <SectionCard title="Screenshots & attachments">
              {acc.attachments.length > 0 && <Gallery attachments={acc.attachments} />}
              {admin && <div className="no-print mt-4 border-t border-line pt-4 first:mt-0 first:border-0 first:pt-0"><AttachmentManager kind="accomplishment" ownerId={acc.id} yearNumber={y} attachments={acc.attachments} /></div>}
            </SectionCard>
          )}
        </div>
        <div className="space-y-6">
          <SectionCard title="Supports goals">
            {goals.length ? <ul className="space-y-3">{goals.map((g) => <li key={g.id}><Link href={`/${y}/goals#goal-${g.id}`} className="text-sm font-medium hover:text-accent">{g.title}</Link><div className="mt-1 flex items-center gap-2"><StatusChip status={g.status} /><span className="text-xs text-muted">{g.progress}%</span></div></li>)}</ul>
              : <p className="text-sm text-muted">Not linked to a goal.</p>}
          </SectionCard>
          <SectionCard title="Role responsibilities">
            {resps.length ? <ul className="list-disc space-y-1 pl-4 text-sm">{resps.map((r) => <li key={r.id}>{r.title}</li>)}</ul> : <p className="text-sm text-muted">Not linked to a responsibility.</p>}
          </SectionCard>
          {learning.length > 0 && <SectionCard title="Related learning"><ul className="space-y-1 text-sm">{learning.map((l) => <li key={l.id}><Link href={`/${y}/learning`} className="hover:text-accent">{l.title}</Link></li>)}</ul></SectionCard>}
          <p className="px-1 text-xs text-muted">Created {formatTimestamp(acc.created_at)}<br />Last updated {formatTimestamp(acc.updated_at)}</p>
        </div>
      </div>
    </>
  );
}
