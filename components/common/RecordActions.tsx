import { ArchiveRestore, Archive, Copy, Trash2 } from 'lucide-react';
import { ActionButton } from '@/components/ui/ActionButton';
import { archiveRecord, deleteRecord } from '@/lib/actions/records';
import type { Action } from '@/lib/actions/helpers';

interface Props { table: string; id: string; archived?: boolean; noun: string; duplicate?: Action; redirectTo?: string; compact?: boolean }

/** Duplicate / Archive-Restore / Delete for admins, with confirmation on destructive actions. */
export function RecordActions({ table, id, archived, noun, duplicate, redirectTo, compact }: Props) {
  const cls = compact ? 'btn btn-ghost btn-sm' : 'btn btn-sm';
  const lbl = (s: string) => (compact ? undefined : s);
  return (
    <>
      {duplicate && <ActionButton action={duplicate} fields={{ id }} icon={<Copy className="h-3.5 w-3.5" aria-hidden />} label={lbl('Duplicate')} ariaLabel={`Duplicate ${noun}`} className={cls} />}
      <ActionButton action={archiveRecord} fields={{ table, id, archive: archived ? '0' : '1' }} className={cls}
        icon={archived ? <ArchiveRestore className="h-3.5 w-3.5" aria-hidden /> : <Archive className="h-3.5 w-3.5" aria-hidden />}
        label={lbl(archived ? 'Restore' : 'Archive')} ariaLabel={`${archived ? 'Restore' : 'Archive'} ${noun}`} />
      <ActionButton action={deleteRecord} fields={{ table, id }} redirectTo={redirectTo} className={`${cls} text-danger`}
        icon={<Trash2 className="h-3.5 w-3.5" aria-hidden />} label={lbl('Delete')} ariaLabel={`Delete ${noun}`}
        confirm={{ title: `Delete this ${noun}?`, body: 'This permanently removes it and anything attached to it. Archiving is safer if you might need it later.', confirmLabel: 'Delete permanently' }} />
    </>
  );
}
