import type { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_PREFS } from '@/lib/constants';
import type { Category, Preferences, Status } from '@/types';

export async function getPreferences(sb: SupabaseClient): Promise<Preferences> {
  const { data } = await sb.from('settings').select('value').eq('key', 'preferences').maybeSingle();
  return { ...DEFAULT_PREFS, ...((data?.value as Partial<Preferences>) ?? {}) };
}
export async function getCategories(sb: SupabaseClient): Promise<Category[]> {
  const { data } = await sb.from('categories').select('*').order('sort_order').order('name');
  return (data ?? []) as Category[];
}
export async function getStatuses(sb: SupabaseClient): Promise<Status[]> {
  const { data } = await sb.from('statuses').select('*').order('sort_order').order('name');
  return (data ?? []) as Status[];
}
