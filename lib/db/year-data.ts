import type { SupabaseClient } from '@supabase/supabase-js';
import type { Year, YearData, Goal, Responsibility } from '@/types';
import { ACC_SELECT, GOAL_SELECT, LEARN_SELECT, normalizeAccomplishment, normalizeLearning } from './normalize';
import { getCategories, getStatuses } from './settings';

/** Everything belonging to one performance-review year, in a handful of queries. */
export async function loadYearData(sb: SupabaseClient, year: Year, opts: { includeArchived?: boolean } = {}): Promise<YearData> {
  const live = (q: any) => (opts.includeArchived ? q : q.is('archived_at', null)); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [cats, statuses, acc, goals, learn, resp, role, review] = await Promise.all([
    getCategories(sb),
    getStatuses(sb),
    live(sb.from('accomplishments').select(ACC_SELECT).eq('year_id', year.id)).order('work_date', { ascending: false }).order('created_at', { ascending: false }),
    live(sb.from('goals').select(GOAL_SELECT).eq('year_id', year.id)).order('created_at'),
    live(sb.from('learning_items').select(LEARN_SELECT).eq('year_id', year.id)).order('created_at'),
    live(sb.from('responsibilities').select('*').eq('year_id', year.id)).order('sort_order').order('created_at'),
    sb.from('year_roles').select('*').eq('year_id', year.id).maybeSingle(),
    sb.from('review_summaries').select('*').eq('year_id', year.id).maybeSingle(),
  ]);
  for (const r of [acc, goals, learn, resp]) if (r.error) throw new Error(r.error.message);
  return {
    year,
    categories: cats,
    workStatuses: statuses.filter((s) => s.kind === 'work'),
    goalStatuses: statuses.filter((s) => s.kind === 'goal'),
    learningStatuses: statuses.filter((s) => s.kind === 'learning'),
    accomplishments: (acc.data ?? []).map(normalizeAccomplishment),
    goals: (goals.data ?? []) as Goal[],
    learning: (learn.data ?? []).map(normalizeLearning),
    responsibilities: (resp.data ?? []) as Responsibility[],
    role: role.data ?? null,
    review: review.data ?? null,
  };
}
