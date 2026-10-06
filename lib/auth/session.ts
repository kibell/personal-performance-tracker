import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types';

export interface Viewer { isAdmin: boolean; userId: string | null; email: string | null }

/** Who is looking at the page? Admin status comes from the database (profiles.is_admin), not the client. */
export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { isAdmin: false, userId: null, email: null };
  const { data: p } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  return { isAdmin: Boolean(p?.is_admin), userId: user.id, email: user.email ?? null };
});

export async function getOwnerProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').eq('is_admin', true).order('created_at').limit(1).maybeSingle();
  return (data as Profile) ?? null;
}
