import Link from 'next/link';
import { Pencil } from 'lucide-react';
import type { Preferences, Profile, Year } from '@/types';
import { ActionModal } from '@/components/ui/ActionModal';
import { ActionButton } from '@/components/ui/ActionButton';
import { Chip, Field } from '@/components/ui/primitives';
import { RecordActions } from '@/components/common/RecordActions';
import { SettingsForm } from './SettingsForm';
import { removeSampleData, renameYear, savePreferences, saveProfile } from '@/lib/actions/admin';

export function YearsSection({ years }: { years: Year[] }) {
  return (
    <div>
      <p className="mb-4 text-sm text-muted">Use <strong>Add Year</strong> in the top bar to create a new blank year. Archived years are hidden from the public site. Deleting a year permanently removes everything in it.</p>
      <ul className="divide-y divide-line rounded-xl border border-line">
        {[...years].reverse().map((y) => (
          <li key={y.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5">
            <Link href={`/${y.year}`} className="font-medium hover:text-accent">{y.label}</Link>
            {y.label !== String(y.year) && <span className="text-xs text-muted">({y.year})</span>}
            {y.archived_at && <Chip>Archived</Chip>}{y.is_sample && <Chip tone="info">Sample</Chip>}
            <span className="flex-1" />
            <ActionModal action={renameYear} title="Rename year" submitLabel="Save" triggerIcon={<Pencil className="h-3.5 w-3.5" aria-hidden />} ariaLabel={`Rename ${y.label}`} triggerClass="btn btn-ghost btn-sm">
              <input type="hidden" name="id" value={y.id} />
              <Field label="Display label"><input name="label" required defaultValue={y.label} className="input" /></Field>
            </ActionModal>
            <RecordActions table="years" id={y.id} archived={!!y.archived_at} noun="year" compact />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProfileSection({ profile }: { profile: Profile | null }) {
  return (
    <SettingsForm action={saveProfile} submitLabel="Save profile">
      <Field label="Name"><input name="display_name" defaultValue={profile?.display_name ?? ''} className="input" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Job title"><input name="job_title" defaultValue={profile?.job_title ?? ''} className="input" /></Field>
        <Field label="Department"><input name="department" defaultValue={profile?.department ?? ''} className="input" /></Field>
      </div>
      <Field label="About (optional)"><textarea name="bio" rows={4} defaultValue={profile?.bio ?? ''} className="input" /></Field>
      <p className="text-xs text-muted">Name, title and department are shown on the public site. Your email is never displayed.</p>
    </SettingsForm>
  );
}

export function PreferencesSection({ prefs }: { prefs: Preferences }) {
  return (
    <SettingsForm action={savePreferences} submitLabel="Save preferences">
      <Field label="Default theme" hint="Visitors can still toggle light/dark for themselves."><select name="defaultTheme" defaultValue={prefs.defaultTheme} className="input"><option value="system">Match device</option><option value="light">Light</option><option value="dark">Dark</option></select></Field>
      <Field label="Work list page size"><input type="number" name="pageSize" min={5} max={100} defaultValue={prefs.pageSize} className="input w-32" /></Field>
    </SettingsForm>
  );
}

export function DataSection({ sampleCount }: { sampleCount: number }) {
  return (
    <div className="space-y-4">
      <p className="text-sm">Demo records (flagged as sample data) currently in the database: <strong>{sampleCount}</strong>.</p>
      <ActionButton action={removeSampleData} fields={{}} label="Remove sample data" className="btn btn-danger"
        confirm={{ title: 'Remove all sample data?', body: 'Deletes every demo accomplishment, goal, learning item and responsibility, plus demo years that contain nothing else. Your own records are untouched.', confirmLabel: 'Remove sample data' }} />
    </div>
  );
}
