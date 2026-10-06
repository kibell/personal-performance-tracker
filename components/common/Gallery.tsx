'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText, X } from 'lucide-react';
import type { Attachment } from '@/types';
import { formatBytes } from '@/lib/utils';

/** Thumbnail grid with click-to-expand lightbox (←/→/Esc) plus downloadable non-image files. */
export function Gallery({ attachments }: { attachments: Attachment[] }) {
  const images = attachments.filter((a) => a.isImage);
  const files = attachments.filter((a) => !a.isImage);
  const [idx, setIdx] = useState<number | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => { if (idx !== null) ref.current?.showModal(); }, [idx]);
  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIdx((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === 'ArrowLeft') setIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, images.length]);

  const cur = idx !== null ? images[idx] : null;
  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((a, i) => (
            <li key={a.id}>
              <button type="button" onClick={() => setIdx(i)} className="group block w-full overflow-hidden rounded-lg border border-line bg-surface2 text-left" aria-label={`Expand image: ${a.caption || a.file_name}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt={a.caption || a.file_name} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-[1.02]" />
              </button>
              {a.caption && <p className="mt-1 text-xs text-muted">{a.caption}</p>}
            </li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((a) => (
            <li key={a.id}>
              <a href={a.url} target="_blank" rel="noopener noreferrer" download={a.file_name} className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2 text-sm hover:bg-surface2">
                <FileText className="h-4 w-4 text-muted" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{a.caption || a.file_name}<span className="ml-2 text-xs text-muted">{formatBytes(a.size_bytes)}</span></span>
                <Download className="h-4 w-4 text-muted" aria-hidden /><span className="sr-only">Download</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      {cur && (
        <dialog ref={ref} onClose={() => setIdx(null)} onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
          className="m-auto max-h-[96vh] w-[min(96vw,64rem)] rounded-2xl border border-line bg-surface p-3 shadow-pop" aria-label="Image viewer">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-muted">{idx! + 1} / {images.length}</p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => ref.current?.close()} aria-label="Close"><X className="h-4 w-4" /></button>
          </div>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur.url} alt={cur.caption || cur.file_name} className="mx-auto max-h-[75vh] w-auto max-w-full rounded-lg object-contain" />
            {images.length > 1 && (<>
              <button type="button" className="btn absolute left-1 top-1/2 -translate-y-1/2" onClick={() => setIdx((idx! - 1 + images.length) % images.length)} aria-label="Previous image"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" className="btn absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setIdx((idx! + 1) % images.length)} aria-label="Next image"><ChevronRight className="h-4 w-4" /></button>
            </>)}
          </div>
          {cur.caption && <p className="mt-2 text-center text-sm">{cur.caption}</p>}
        </dialog>
      )}
    </div>
  );
}
