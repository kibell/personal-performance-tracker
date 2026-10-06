import Link from 'next/link';
import { Inbox, Paperclip, Star } from 'lucide-react';
import type { Accomplishment } from '@/types';
import { formatDate } from '@/lib/utils';
import { Chip, StatusChip } from '@/components/ui/primitives';

export function WorkCard({ acc, yearNumber, showAdminFlags }: { acc: Accomplishment; yearNumber: number; showAdminFlags?: boolean }) {
  const thumb = acc.attachments.find((a) => a.isImage);
  return (
    <article className="card relative flex gap-3 p-4 transition-colors hover:border-accent/40">
      {thumb && /* eslint-disable-next-line @next/next/no-img-element */ <img src={thumb.url} alt="" loading="lazy" className="hidden h-16 w-24 shrink-0 rounded-md object-cover sm:block" />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="font-medium leading-snug">
            <Link href={`/${yearNumber}/work/${acc.id}`} className="after:absolute after:inset-0 hover:text-accent">{acc.title}</Link>
          </h3>
          {acc.is_highlight && <span title="Performance review highlight" className="text-warning"><Star className="h-3.5 w-3.5 fill-current" aria-hidden /><span className="sr-only">Highlight</span></span>}
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <time dateTime={acc.work_date}>{formatDate(acc.work_date)}</time>
          {acc.category && <Chip>{acc.category.name}</Chip>}
          <StatusChip status={acc.status} />
          {showAdminFlags && acc.needs_details && <Chip tone="warning"><Inbox className="h-3 w-3" aria-hidden />Needs details</Chip>}
          {acc.attachments.length > 0 && <span className="inline-flex items-center gap-0.5"><Paperclip className="h-3 w-3" aria-hidden />{acc.attachments.length}</span>}
        </p>
        {acc.description && <p className="mt-2 line-clamp-2 text-sm text-muted">{acc.description}</p>}
      </div>
    </article>
  );
}
