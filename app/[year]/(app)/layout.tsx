import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getContext } from '@/lib/page-context';
import { getCategories } from '@/lib/db/settings';

export const dynamic = 'force-dynamic';

export default async function YearLayout({ children, params }: { children: ReactNode; params: Promise<{ year: string }> }) {
  const { year: seg } = await params;
  const ctx = await getContext(seg);
  const categories = ctx.viewer.isAdmin ? await getCategories(ctx.sb) : [];
  return <AppShell years={ctx.years} year={ctx.year} viewer={ctx.viewer} owner={ctx.owner} categories={categories}><div id="main">{children}</div></AppShell>;
}
