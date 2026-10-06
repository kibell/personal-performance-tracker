import { cache } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOwnerProfile, getViewer } from '@/lib/auth/session';
import { listYears } from '@/lib/db/years';
import { getPreferences } from '@/lib/db/settings';

/** Shared per-request context for pages. Passing a year segment resolves it (404 if it doesn't exist / isn't visible). */
export const getContext = cache(async (yearSegment?: string) => {
  const sb = await createClient();
  const [viewer, years, owner, prefs] = await Promise.all([getViewer(), listYears(sb), getOwnerProfile(), getPreferences(sb)]);
  const year = yearSegment ? years.find((y) => String(y.year) === yearSegment) ?? null : null;
  if (yearSegment && !year) notFound();
  return { sb, viewer, years, year, owner, prefs };
});
