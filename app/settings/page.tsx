import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isConfigured } from '@/lib/env';
import { SetupNotice } from '@/components/layout/SetupNotice';
import { getContext } from '@/lib/page-context';
import { getCategories, getStatuses } from '@/lib/db/settings';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/primitives';
import { CategoriesSection, StatusesSection } from '@/components/settings/lookups';
import { DataSection, PreferencesSection, ProfileSection, YearsSection } from '@/components/settings/misc';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types';

export const metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

const TABS = [['categories', 'Categories'], ['statuses', 'Status options'], ['years', 'Years'], ['profile', 'Profile'], ['preferences', 'Preferences'], ['data', 'Data']] as const;

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  if (!isConfigured) return <SetupNotice />;
  const { tab = 'categories' } = await searchParams;
  const ctx = await getContext();
  if (!ctx.viewer.isAdmin) redirect('/login?next=/settings');
  const { sb, years, owner, prefs } = ctx;
  const [categories, statuses, usage, samples] = await Promise.all([
    getCategories(sb), getStatuses(sb),
    sb.from('accomplishments').select('category_id'),
    Promise.all(['accomplishments', 'goals', 'learning_items', 'responsibilities'].map((t) => sb.from(t).select('id', { count: 'exact', head: true }).eq('is_sample', true))),
  ]);
  const usageMap: Record<string, number> = {};
  (usage.data ?? []).forEach((r: { category_id: string | null }) => { if (r.category_id) usageMap[r.category_id] = (usageMap[r.category_id] ?? 0) + 1; });
  const sampleCount = samples.reduce((n, r) => n + (r.count ?? 0), 0);
  let profile = owner;
  if (!profile) profile = null as Profile | null;
  const back = years.at(-1);

  return (
    <AppShell years={years} year={null} viewer={ctx.viewer} owner={owner} categories={categories}>
      <PageHeader title="Settings" subtitle="Manage categories, statuses, years and your profile." actions={back ? <Link href={`/${back.year}`} className="btn">Back to {back.label}</Link> : undefined} />
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Settings sections">
        {TABS.map(([k, l]) => <Link key={k} href={`/settings?tab=${k}`} role="tab" aria-selected={tab === k} className={cn('rounded-full px-3 py-1 text-sm', tab === k ? 'bg-accent text-accentfg' : 'bg-surface2 text-muted hover:text-ink')}>{l}</Link>)}
      </div>
      <div className="card p-5 sm:p-6">
        {tab === 'categories' && <CategoriesSection categories={categories} usage={usageMap} />}
        {tab === 'statuses' && <StatusesSection statuses={statuses} />}
        {tab === 'years' && <YearsSection years={years} />}
        {tab === 'profile' && <ProfileSection profile={profile} />}
        {tab === 'preferences' && <PreferencesSection prefs={prefs} />}
        {tab === 'data' && <DataSection sampleCount={sampleCount} />}
      </div>
    </AppShell>
  );
}
