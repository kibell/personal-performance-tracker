import { getContext } from '@/lib/page-context';
import { loadYearData } from '@/lib/db/year-data';
import { reviewToMarkdown } from '@/lib/export/markdown';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ year: string }> }) {
  const { year: seg } = await params;
  const { sb, year, owner } = await getContext(seg);
  const data = await loadYearData(sb, year!);
  void owner;
  return new Response(reviewToMarkdown(data, owner), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Content-Disposition': `attachment; filename="performance-review-${year!.year}-${new Date().toISOString().slice(0, 10)}.md"` },
  });
}
