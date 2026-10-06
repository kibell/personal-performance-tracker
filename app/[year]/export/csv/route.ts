import { getContext } from '@/lib/page-context';
import { loadYearData } from '@/lib/db/year-data';
import { workToCsv } from '@/lib/export/csv';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ year: string }> }) {
  const { year: seg } = await params;
  const { sb, year, owner } = await getContext(seg);
  const data = await loadYearData(sb, year!);
  void owner;
  return new Response(workToCsv(data), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="performance-review-${year!.year}-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
