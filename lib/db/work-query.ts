import type { SupabaseClient } from '@supabase/supabase-js';
import type { Accomplishment } from '@/types';
import { ACC_SELECT, normalizeAccomplishment } from './normalize';

export interface WorkFilters {
  q?: string; category?: string; status?: string; goal?: string; project?: string; tech?: string;
  from?: string; to?: string; highlight?: string; inbox?: string; show?: 'active' | 'archived' | 'all';
  sort?: string; page?: number; pageSize: number;
}

const SORTS: Record<string, { col: string; asc: boolean }> = {
  date_desc: { col: 'work_date', asc: false }, date_asc: { col: 'work_date', asc: true },
  title_asc: { col: 'title', asc: true }, updated_desc: { col: 'updated_at', asc: false },
};

/** Server-side filtered, sorted, paginated work list (RLS hides archived rows from the public). */
export async function queryAccomplishments(sb: SupabaseClient, yearId: string, f: WorkFilters) {
  let q = sb.from('accomplishments').select(ACC_SELECT, { count: 'exact' }).eq('year_id', yearId);
  if (f.show === 'archived') q = q.not('archived_at', 'is', null);
  else if (f.show !== 'all') q = q.is('archived_at', null);
  if (f.category) q = q.eq('category_id', f.category);
  if (f.status) q = q.eq('status_id', f.status);
  if (f.project) q = q.eq('project', f.project);
  if (f.tech) q = q.contains('technologies', [f.tech]);
  if (f.from) q = q.gte('work_date', f.from);
  if (f.to) q = q.lte('work_date', f.to);
  if (f.highlight === '1') q = q.eq('is_highlight', true);
  if (f.inbox === '1') q = q.eq('needs_details', true);
  if (f.goal) {
    const { data } = await sb.from('accomplishment_goals').select('accomplishment_id').eq('goal_id', f.goal);
    q = q.in('id', (data ?? []).map((r) => r.accomplishment_id));
  }
  const term = (f.q ?? '').trim().replace(/[,()"*\\%_]/g, ' ').trim().toLowerCase();
  if (term) {
    const { data: cats } = await sb.from('categories').select('id').ilike('name', `%${term}%`);
    const ors = [`search_blob.ilike.%${term}%`];
    if (cats?.length) ors.push(`category_id.in.(${cats.map((c) => c.id).join(',')})`);
    q = q.or(ors.join(','));
  }
  const s = SORTS[f.sort ?? ''] ?? SORTS.date_desc;
  const page = Math.max(1, f.page ?? 1);
  const from = (page - 1) * f.pageSize;
  const { data, count, error } = await q.order(s.col, { ascending: s.asc }).order('created_at', { ascending: false }).range(from, from + f.pageSize - 1);
  if (error) throw new Error(error.message);
  return { items: (data ?? []).map(normalizeAccomplishment) as Accomplishment[], total: count ?? 0, page };
}

export async function getAccomplishment(sb: SupabaseClient, id: string): Promise<Accomplishment | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await sb.from('accomplishments').select(ACC_SELECT).eq('id', id).maybeSingle();
  return data ? normalizeAccomplishment(data) : null;
}
