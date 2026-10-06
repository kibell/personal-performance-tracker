import type { SupabaseClient } from '@supabase/supabase-js';
import type { Year } from '@/types';

export async function listYears(sb: SupabaseClient): Promise<Year[]> {
  const { data, error } = await sb.from('years').select('*').order('year', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Year[];
}

/** Default year = most recent non-archived year (falls back to the most recent of any). */
export function defaultYear(years: Year[]): Year | null {
  const live = years.filter((y) => !y.archived_at);
  const pool = live.length ? live : years;
  return pool.length ? pool[pool.length - 1] : null;
}
