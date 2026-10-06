import Link from 'next/link';
import { Calendar, ExternalLink } from 'lucide-react';
import type { Goal, LearningItem, Accomplishment, YearData } from '@/types';
import { formatDate, safeUrl } from '@/lib/utils';
import { Chip, StatusChip, Text } from '@/components/ui/primitives';
import { Gallery } from '@/components/common/Gallery';
import { AttachmentManager } from '@/components/common/AttachmentManager';
import { RecordActions } from '@/components/common/RecordActions';
import { duplicateLearning } from '@/lib/actions/work';
import { LearningFormModal } from './LearningForm';

export function LearningCard({ item, goal, work, yearNumber, admin, data }: { item: LearningItem; goal?: Goal; work: Accomplishment[]; yearNumber: number; admin: boolean; data?: YearData }) {
  const url = safeUrl(item.resource_url);
  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">{item.title}</h3>
        <div className="flex items-center gap-1.5"><Chip tone="accent">{item.item_type}</Chip><StatusChip status={item.status} />{item.archived_at && <Chip>Archived</Chip>}</div>
      </div>
      {(item.start_date || item.completion_date) && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-muted"><Calendar className="h-3 w-3" aria-hidden />
          {item.start_date && formatDate(item.start_date)}{item.start_date && item.completion_date && ' → '}{item.completion_date && formatDate(item.completion_date)}
        </p>
      )}
      {item.description && <Text className="mt-3">{item.description}</Text>}
      {item.notes && <Text className="mt-2 text-muted">{item.notes}</Text>}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {goal && <Link href={`/${yearNumber}/goals#goal-${goal.id}`} className="text-accent hover:underline">Goal: {goal.title}</Link>}
        {url && <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">Resource<ExternalLink className="h-3 w-3" aria-hidden /></a>}
      </div>
      {work.length > 0 && (
        <p className="mt-3 text-xs text-muted">Applied in: {work.map((w, i) => <span key={w.id}>{i > 0 && ', '}<Link href={`/${yearNumber}/work/${w.id}`} className="text-accent hover:underline">{w.title}</Link></span>)}</p>
      )}
      {item.attachments.length > 0 && <div className="mt-4"><p className="label">Evidence</p><Gallery attachments={item.attachments} /></div>}
      {admin && data && (
        <div className="no-print mt-4 space-y-3 border-t border-line pt-4">
          <details><summary className="cursor-pointer text-sm font-medium text-accent">Manage certificate / evidence files</summary>
            <div className="mt-3"><AttachmentManager kind="learning" ownerId={item.id} yearNumber={yearNumber} attachments={item.attachments} /></div>
          </details>
          <div className="flex flex-wrap gap-2"><LearningFormModal data={data} item={item} trigger="edit" /><RecordActions table="learning_items" id={item.id} archived={!!item.archived_at} noun="learning item" duplicate={duplicateLearning} /></div>
        </div>
      )}
    </article>
  );
}
