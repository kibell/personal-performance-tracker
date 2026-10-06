'use client';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, FileText, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase/client';
import { BUCKET, MAX_UPLOAD_BYTES } from '@/lib/constants';
import { addAttachment, deleteRecord, discardUploads, moveItem, updateCaption } from '@/lib/actions/records';
import { ActionButton } from '@/components/ui/ActionButton';
import { useToast } from '@/components/ui/Toast';
import type { Attachment } from '@/types';
import { formatBytes } from '@/lib/utils';

interface Props { kind: 'accomplishment' | 'learning'; ownerId: string; yearNumber: number; attachments: Attachment[] }

/** Admin-only: upload (browse, drag, or paste a screenshot), caption, reorder and delete attachments. */
export function AttachmentManager({ kind, ownerId, yearNumber, attachments }: Props) {
  const [busy, setBusy] = useState(false);
  const [, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const { push } = useToast();
  const router = useRouter();
  const scopeCol = kind === 'learning' ? 'learning_id' : 'accomplishment_id';

  async function upload(files: File[]) {
    if (!files.length) return;
    setBusy(true);
    const sb = createBrowserSupabase();
    const failedPaths: string[] = [];
    for (const file of files) {
      if (file.size > MAX_UPLOAD_BYTES) { push({ message: `${file.name} is larger than 10 MB.`, kind: 'error' }); continue; }
      const safe = file.name.replace(/[^\w.\-]+/g, '_').slice(-80) || 'file';
      const path = `${yearNumber}/${kind}/${ownerId}/${crypto.randomUUID()}-${safe}`;
      const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined, upsert: false });
      if (error) { push({ message: `Upload failed: ${error.message}`, kind: 'error' }); continue; }
      const fd = new FormData();
      Object.entries({ kind, owner_id: ownerId, storage_path: path, file_name: file.name || safe, mime_type: file.type, size_bytes: String(file.size) }).forEach(([k, v]) => fd.set(k, v));
      const r = await addAttachment(null, fd);
      if (!r?.ok) { failedPaths.push(path); push({ message: r?.error ?? 'Could not save attachment.', kind: 'error' }); }
    }
    if (failedPaths.length) { const fd = new FormData(); failedPaths.forEach((p) => fd.append('paths', p)); await discardUploads(null, fd); }
    setBusy(false); start(() => router.refresh());
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-3"
      onPaste={(e) => { const f = Array.from(e.clipboardData.files); if (f.length) { e.preventDefault(); void upload(f); } }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); void upload(Array.from(e.dataTransfer.files)); }}>
      <label tabIndex={0} className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-4 py-6 text-center text-sm hover:bg-surface2 focus-visible:bg-surface2"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin text-accent" aria-hidden /> : <UploadCloud className="h-5 w-5 text-muted" aria-hidden />}
        <span className="font-medium">{busy ? 'Uploading…' : 'Add screenshots or files'}</span>
        <span className="text-xs text-muted">Click, drag & drop, or paste a screenshot here. Images, PDFs, documents up to 10 MB.</span>
        <input ref={inputRef} type="file" multiple className="sr-only" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.md"
          onChange={(e) => void upload(Array.from(e.target.files ?? []))} disabled={busy} />
      </label>

      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map((a, i) => (
            <li key={a.id} className="flex items-center gap-3 rounded-lg border border-line p-2">
              {a.isImage /* eslint-disable-next-line @next/next/no-img-element */
                ? <img src={a.url} alt="" className="h-14 w-20 shrink-0 rounded-md object-cover" />
                : <span className="grid h-14 w-20 shrink-0 place-items-center rounded-md bg-surface2"><FileText className="h-5 w-5 text-muted" aria-hidden /></span>}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-muted">{a.file_name} · {formatBytes(a.size_bytes)}</p>
                <CaptionField id={a.id} initial={a.caption ?? ''} />
              </div>
              <div className="flex items-center">
                <ActionButton action={moveItem} fields={{ table: 'attachments', id: a.id, dir: 'up', scopeCol, scopeVal: ownerId }} icon={<ArrowUp className="h-4 w-4" />} ariaLabel="Move up" className={`btn btn-ghost btn-sm ${i === 0 ? 'invisible' : ''}`} />
                <ActionButton action={moveItem} fields={{ table: 'attachments', id: a.id, dir: 'down', scopeCol, scopeVal: ownerId }} icon={<ArrowDown className="h-4 w-4" />} ariaLabel="Move down" className={`btn btn-ghost btn-sm ${i === attachments.length - 1 ? 'invisible' : ''}`} />
                <ActionButton action={deleteRecord} fields={{ table: 'attachments', id: a.id }} icon={<Trash2 className="h-4 w-4" />} ariaLabel="Delete attachment" className="btn btn-ghost btn-sm text-danger"
                  confirm={{ title: 'Delete this attachment?', body: 'The file is removed from storage permanently.', confirmLabel: 'Delete' }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CaptionField({ id, initial }: { id: string; initial: string }) {
  const [val, setVal] = useState(initial);
  const { push } = useToast();
  const save = async () => {
    if (val === initial) return;
    const fd = new FormData(); fd.set('id', id); fd.set('caption', val);
    const r = await updateCaption(null, fd);
    push({ message: r?.ok ? 'Caption saved.' : r?.error ?? 'Could not save caption.', kind: r?.ok ? 'success' : 'error' });
  };
  return <input value={val} onChange={(e) => setVal(e.target.value)} onBlur={save} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} placeholder="Add a caption (optional)" aria-label="Caption" className="input mt-1 py-1" />;
}
