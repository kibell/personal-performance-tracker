'use client';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

export function PrintToolbar({ back }: { back: string }) {
  return (
    <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-4 py-2.5">
      <Link href={back} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" aria-hidden />Back</Link>
      <div className="flex items-center gap-3"><span className="hidden text-xs text-muted sm:inline">Choose “Save as PDF” in the print dialog to export a PDF.</span>
        <button className="btn btn-primary" onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden />Print / Save as PDF</button></div>
    </div>
  );
}
