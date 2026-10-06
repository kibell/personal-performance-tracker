import Link from 'next/link';
import { Pencil, Printer } from 'lucide-react';
import { getContext } from '@/lib/page-context';
import { loadYearData } from '@/lib/db/year-data';
import { PageHeader } from '@/components/ui/primitives';
import { ReviewDocument } from '@/components/review/ReviewDocument';
import { ActionModal } from '@/components/ui/ActionModal';
import { Field } from '@/components/ui/primitives';
import { saveReview } from '@/lib/actions/work';

export default async function ReviewPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: seg } = await params;
  const { sb, viewer, year, owner } = await getContext(seg);
  const data = await loadYearData(sb, year!);
  const r = data.review;
  return (
    <>
      <PageHeader title="Review Summary" subtitle="Built live from this year’s work, goals, learning and responsibilities."
        actions={<>
          <Link href={`/${year!.year}/print`} className="btn"><Printer className="h-4 w-4" aria-hidden />Print / PDF</Link>
          {viewer.isAdmin && (
            <ActionModal wide action={saveReview} title="Edit review narrative" description="These three sections are the only hand-written parts; everything else updates automatically."
              triggerLabel="Edit narrative" triggerIcon={<Pencil className="h-4 w-4" aria-hidden />} triggerClass="btn btn-primary" submitLabel="Save">
              <input type="hidden" name="year_id" value={year!.id} />
              <Field label="Summary narrative" hint="Optional wording shown at the top of the review."><textarea name="narrative" rows={6} defaultValue={r?.narrative ?? ''} className="input" /></Field>
              <Field label="Challenges / lessons learned"><textarea name="challenges" rows={5} defaultValue={r?.challenges ?? ''} className="input" /></Field>
              <Field label="Next-year priorities" hint="One priority per line."><textarea name="next_priorities" rows={5} defaultValue={r?.next_priorities ?? ''} className="input" /></Field>
            </ActionModal>
          )}
        </>} />
      <div className="card px-6 py-8 sm:px-10"><ReviewDocument data={data} owner={owner} links /></div>
    </>
  );
}
