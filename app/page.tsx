import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isConfigured } from '@/lib/env';
import { SetupNotice } from '@/components/layout/SetupNotice';
import { getContext } from '@/lib/page-context';
import { defaultYear } from '@/lib/db/years';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/ui/primitives';
import { ActionModal } from '@/components/ui/ActionModal';
import { createYear } from '@/lib/actions/admin';
import { Field } from '@/components/ui/primitives';

export const dynamic = 'force-dynamic';

export default async function Home() {
  if (!isConfigured) return <SetupNotice />;
  let ctx;
  try { ctx = await getContext(); } catch (e) { return <SetupNotice error={`Database error: ${e instanceof Error ? e.message : 'unknown'}. Have you run the migration?`} />; }
  const target = defaultYear(ctx.years);
  if (target) redirect(`/${target.year}`);
  const thisYear = new Date().getFullYear();
  return (
    <AppShell years={ctx.years} year={null} viewer={ctx.viewer} owner={ctx.owner}>
      <EmptyState title="No review years yet" body={ctx.viewer.isAdmin ? 'Create your first performance-review year to start recording work.' : 'Nothing has been published yet. Please check back soon.'}>
        {ctx.viewer.isAdmin
          ? <ActionModal title="Create your first year" action={createYear} triggerLabel="+ Add Your First Year" triggerClass="btn btn-primary" submitLabel="Create year" redirectBase="/">
              <Field label="Year"><input name="year" type="number" required defaultValue={thisYear} className="input" /></Field>
              <input type="hidden" name="label" value="" />
            </ActionModal>
          : <Link href="/login" className="btn">Admin login</Link>}
      </EmptyState>
    </AppShell>
  );
}
