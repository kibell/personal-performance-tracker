import { getContext } from '@/lib/page-context';
import { loadYearData } from '@/lib/db/year-data';
import { ReviewDocument } from '@/components/review/ReviewDocument';
import { PrintToolbar } from '@/components/review/PrintButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Print review' };

export default async function PrintPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: seg } = await params;
  const { sb, year, owner } = await getContext(seg);
  const data = await loadYearData(sb, year!);
  return (
    <>
      <PrintToolbar back={`/${year!.year}/review`} />
      <main className="mx-auto max-w-3xl bg-surface px-6 py-8 print:max-w-none print:p-0"><ReviewDocument data={data} owner={owner} /></main>
    </>
  );
}
