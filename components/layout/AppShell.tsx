import Link from 'next/link';
import type { ReactNode } from 'react';
import { Download, FileText, LogIn, LogOut, Plus, Settings, Sparkles, Eye } from 'lucide-react';
import type { Viewer } from '@/lib/auth/session';
import type { Category, Profile, Year } from '@/types';
import { signOut } from '@/lib/actions/admin';
import { createYear } from '@/lib/actions/admin';
import { saveAccomplishment } from '@/lib/actions/work';
import { ActionModal } from '@/components/ui/ActionModal';
import { Field } from '@/components/ui/primitives';
import { Check, QuickTitle, TodayDate } from '@/components/ui/inputs';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SideNav, YearNav } from './nav';

interface Props { years: Year[]; year: Year | null; viewer: Viewer; owner: Profile | null; categories?: Category[]; children: ReactNode }

export function AppShell({ years, year, viewer, owner, categories = [], children }: Props) {
  const nextYear = (years.at(-1)?.year ?? new Date().getFullYear()) + 1;
  const navYear = year?.year ?? years.at(-1)?.year;
  return (
    <div className="min-h-screen lg:flex">
      <aside className="no-print hidden w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex lg:sticky lg:top-0 lg:h-screen">
        <div className="px-5 pb-4 pt-5">
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accentfg"><Sparkles className="h-4 w-4" aria-hidden /></span>
            <span className="leading-tight">Performance<br />Review Tracker</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3">{navYear && <SideNav year={navYear} />}</div>
        <div className="space-y-3 border-t border-line p-4 text-sm">
          {owner && <div><p className="font-medium">{owner.display_name}</p><p className="text-xs text-muted">{[owner.job_title, owner.department].filter(Boolean).join(' · ')}</p></div>}
          <div className="flex items-center justify-between">
            {viewer.isAdmin ? (
              <div className="flex items-center gap-1">
                <Link href="/settings" className="btn btn-ghost btn-sm"><Settings className="h-4 w-4" aria-hidden />Settings</Link>
                <form action={signOut}><button className="btn btn-ghost btn-sm" aria-label="Sign out"><LogOut className="h-4 w-4" aria-hidden /></button></form>
              </div>
            ) : (
              <Link href="/login" className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"><LogIn className="mr-1 inline h-3 w-3" aria-hidden />Admin login</Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="no-print sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-2.5 lg:px-8">
            <Link href="/" className="font-semibold lg:hidden" aria-label="Home"><Sparkles className="h-5 w-5 text-accent" aria-hidden /></Link>
            <div className="min-w-0 flex-1">
              <YearNav
                years={years.map((y) => ({ year: y.year, label: y.label, archived: !!y.archived_at }))}
                current={year?.year ?? null}
                addSlot={viewer.isAdmin ? (
                  <ActionModal title="Add a review year" description="New years start blank — nothing is copied from previous years." action={createYear}
                    triggerLabel="Add Year" triggerIcon={<Plus className="h-4 w-4" aria-hidden />} triggerClass="btn btn-ghost btn-sm shrink-0 whitespace-nowrap" submitLabel="Create year" redirectBase="/">
                    <Field label="Year"><input name="year" type="number" required min={1990} max={2200} defaultValue={nextYear} className="input" /></Field>
                    <Field label="Display label" hint="Optional. Defaults to the year, e.g. “FY2027”."><input name="label" className="input" placeholder={String(nextYear)} /></Field>
                  </ActionModal>
                ) : null}
              />
            </div>
            <div className="flex items-center gap-2">
              {year && <ExportMenu year={year.year} />}
              {viewer.isAdmin && year && <QuickAdd year={year} categories={categories} />}
              <div className="lg:hidden"><ThemeToggle /></div>
            </div>
          </div>
          {navYear && <div className="border-t border-line lg:hidden"><SideNav year={navYear} orientation="horizontal" /></div>}
          {!viewer.isAdmin && (
            <p className="flex items-center gap-1.5 border-t border-line bg-surface2 px-4 py-1 text-xs text-muted lg:px-8"><Eye className="h-3 w-3" aria-hidden />Read-only view{owner?.display_name ? ` of ${owner.display_name}’s performance review` : ''}</p>
          )}
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        <footer className="no-print border-t border-line px-4 py-4 text-xs text-muted lg:hidden">
          {viewer.isAdmin ? <Link href="/settings">Settings</Link> : <Link href="/login">Admin login</Link>}
        </footer>
      </div>
    </div>
  );
}

function ExportMenu({ year }: { year: number }) {
  return (
    <details className="relative">
      <summary className="btn cursor-pointer list-none [&::-webkit-details-marker]:hidden"><Download className="h-4 w-4" aria-hidden /><span className="hidden sm:inline">Export</span></summary>
      <div className="card absolute right-0 z-40 mt-2 w-60 p-1 shadow-pop">
        {[
          { href: `/${year}/print`, label: 'Print / PDF review', note: 'Opens a print-friendly page', icon: FileText },
          { href: `/${year}/export/csv`, label: 'Work as CSV', note: 'Spreadsheet-ready', icon: Download },
          { href: `/${year}/export/md`, label: 'Review as Markdown', note: 'Plain text', icon: Download },
        ].map(({ href, label, note, icon: I }) => (
          <a key={href} href={href} className="flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-surface2">
            <I className="mt-0.5 h-4 w-4 text-muted" aria-hidden /><span><span className="block font-medium">{label}</span><span className="text-xs text-muted">{note}</span></span>
          </a>
        ))}
      </div>
    </details>
  );
}

function QuickAdd({ year, categories }: { year: Year; categories: Category[] }) {
  return (
    <ActionModal title="Quick add work" description={`Saved to your ${year.label} work inbox. Add details later.`} action={saveAccomplishment}
      triggerLabel="Quick add" triggerIcon={<Plus className="h-4 w-4" aria-hidden />} triggerClass="btn btn-primary" submitLabel="Save to inbox"
      hotkey="q" draftKey={`quick-${year.id}`} toastLink={{ base: `/${year.year}/work/`, label: 'Add details' }}>
      <input type="hidden" name="year_id" value={year.id} />
      <input type="hidden" name="quick" value="1" />
      <Field label="What did you do?" hint="Ctrl/⌘ + Enter to save. Press Q anywhere to open this."><QuickTitle /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date"><TodayDate name="work_date" /></Field>
        <Field label="Category (optional)">
          <select name="category_id" className="input" defaultValue=""><option value="">—</option>{categories.filter((c) => !c.archived_at).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </Field>
      </div>
      <Check name="is_highlight" label="Include as Performance Review Highlight" />
    </ActionModal>
  );
}
