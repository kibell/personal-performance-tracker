'use server';
import { bool, dateOrNull, guard, many, must, num, opt, req, str, urlOrNull, type ActionState } from './helpers';
import { parseTags } from '@/lib/utils';
import type { SupabaseClient } from '@supabase/supabase-js';

async function replaceLinks(sb: SupabaseClient, table: string, ownerCol: string, ownerId: string, otherCol: string, ids: string[]) {
  must(await sb.from(table).delete().eq(ownerCol, ownerId));
  if (ids.length) must(await sb.from(table).insert(ids.map((id) => ({ [ownerCol]: ownerId, [otherCol]: id }))));
}

/** Create or update an accomplishment. `quick=1` marks it as an inbox entry that still needs details. */
export async function saveAccomplishment(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const id = str(fd, 'id');
    const quick = str(fd, 'quick') === '1';
    let statusId = opt(fd, 'status_id');
    if (!id && !statusId) {
      const { data } = await sb.from('statuses').select('id').eq('kind', 'work').eq('phase', 'complete').is('archived_at', null).order('sort_order').limit(1);
      statusId = data?.[0]?.id ?? null;
    }
    const row: Record<string, unknown> = {
      title: req(fd, 'title', 'Title'),
      work_date: dateOrNull(fd, 'work_date') ?? new Date().toISOString().slice(0, 10),
      category_id: opt(fd, 'category_id'), is_highlight: bool(fd, 'is_highlight'),
    };
    if (statusId) row.status_id = statusId;
    if (!quick) {
      Object.assign(row, {
        description: opt(fd, 'description'), project: opt(fd, 'project'), contribution: opt(fd, 'contribution'),
        impact: opt(fd, 'impact'), technologies: parseTags(str(fd, 'technologies')), evidence_url: urlOrNull(fd, 'evidence_url'),
        notes: opt(fd, 'notes'), needs_details: false,
      });
    } else if (!id) row.needs_details = true;

    let accId = id;
    if (id) must(await sb.from('accomplishments').update(row).eq('id', id));
    else accId = must(await sb.from('accomplishments').insert({ ...row, year_id: req(fd, 'year_id', 'Year') }).select('id').single()).data!.id;

    if (!quick) {
      await replaceLinks(sb, 'accomplishment_goals', 'accomplishment_id', accId, 'goal_id', many(fd, 'goal_ids'));
      await replaceLinks(sb, 'accomplishment_responsibilities', 'accomplishment_id', accId, 'responsibility_id', many(fd, 'responsibility_ids'));
    }
    return { id: accId, message: quick ? 'Saved to your work inbox.' : id ? 'Accomplishment updated.' : 'Accomplishment added.' };
  });
}

export async function duplicateAccomplishment(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const id = req(fd, 'id', 'Record');
    const src = must(await sb.from('accomplishments').select('*, accomplishment_goals(goal_id), accomplishment_responsibilities(responsibility_id)').eq('id', id).single()).data!;
    const { id: _i, created_at: _c, updated_at: _u, archived_at: _a, search_blob: _s, is_sample: _x, accomplishment_goals: g, accomplishment_responsibilities: r, ...copy } = src;
    void [_i, _c, _u, _a, _s, _x];
    const nid = must(await sb.from('accomplishments').insert({ ...copy, title: `${src.title} (copy)`, needs_details: false }).select('id').single()).data!.id;
    await replaceLinks(sb, 'accomplishment_goals', 'accomplishment_id', nid, 'goal_id', g.map((x: { goal_id: string }) => x.goal_id));
    await replaceLinks(sb, 'accomplishment_responsibilities', 'accomplishment_id', nid, 'responsibility_id', r.map((x: { responsibility_id: string }) => x.responsibility_id));
    return { id: nid, message: 'Duplicated. Attachments are not copied.' };
  });
}

export async function saveGoal(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const id = str(fd, 'id');
    const row = {
      title: req(fd, 'title', 'Goal title'), description: opt(fd, 'description'),
      sustainable: opt(fd, 'sustainable'), measurable: opt(fd, 'measurable'), attainable: opt(fd, 'attainable'),
      relevant: opt(fd, 'relevant'), time_based: opt(fd, 'time_based'), aligned: opt(fd, 'aligned'),
      success_metric: opt(fd, 'success_metric'), target_date: dateOrNull(fd, 'target_date'), status_id: opt(fd, 'status_id'),
      progress: Math.min(100, Math.max(0, Math.round(num(fd, 'progress')))), progress_notes: opt(fd, 'progress_notes'),
      final_outcome: opt(fd, 'final_outcome'),
    };
    let gid = id;
    if (id) must(await sb.from('goals').update(row).eq('id', id));
    else gid = must(await sb.from('goals').insert({ ...row, year_id: req(fd, 'year_id', 'Year') }).select('id').single()).data!.id;
    if (fd.has('links_present')) await replaceLinks(sb, 'accomplishment_goals', 'goal_id', gid, 'accomplishment_id', many(fd, 'accomplishment_ids'));
    return { id: gid, message: id ? 'Goal updated.' : 'Goal added.' };
  });
}

export async function updateGoalProgress(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    must(await sb.from('goals').update({
      status_id: opt(fd, 'status_id'), progress: Math.min(100, Math.max(0, Math.round(num(fd, 'progress')))),
    }).eq('id', req(fd, 'id', 'Goal')));
    return { message: 'Progress updated.' };
  });
}

export async function duplicateGoal(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const src = must(await sb.from('goals').select('*').eq('id', req(fd, 'id', 'Goal')).single()).data!;
    const { id: _i, created_at: _c, updated_at: _u, archived_at: _a, is_sample: _x, ...copy } = src;
    void [_i, _c, _u, _a, _x];
    must(await sb.from('goals').insert({ ...copy, title: `${src.title} (copy)`, progress: 0, final_outcome: null }));
    return { message: 'Goal duplicated (progress reset).' };
  });
}

export async function saveLearning(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const id = str(fd, 'id');
    const row = {
      title: req(fd, 'title', 'Title'), item_type: str(fd, 'item_type') || 'Skill', description: opt(fd, 'description'),
      start_date: dateOrNull(fd, 'start_date'), completion_date: dateOrNull(fd, 'completion_date'), status_id: opt(fd, 'status_id'),
      notes: opt(fd, 'notes'), goal_id: opt(fd, 'goal_id'), resource_url: urlOrNull(fd, 'resource_url'),
    };
    let lid = id;
    if (id) must(await sb.from('learning_items').update(row).eq('id', id));
    else lid = must(await sb.from('learning_items').insert({ ...row, year_id: req(fd, 'year_id', 'Year') }).select('id').single()).data!.id;
    await replaceLinks(sb, 'learning_accomplishments', 'learning_id', lid, 'accomplishment_id', many(fd, 'accomplishment_ids'));
    return { id: lid, message: id ? 'Learning item updated.' : 'Learning item added.' };
  });
}

export async function duplicateLearning(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const src = must(await sb.from('learning_items').select('*').eq('id', req(fd, 'id', 'Item')).single()).data!;
    const { id: _i, created_at: _c, updated_at: _u, archived_at: _a, is_sample: _x, ...copy } = src;
    void [_i, _c, _u, _a, _x];
    must(await sb.from('learning_items').insert({ ...copy, title: `${src.title} (copy)` }));
    return { message: 'Learning item duplicated.' };
  });
}

export async function saveResponsibility(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const id = str(fd, 'id');
    const row = { title: req(fd, 'title', 'Responsibility'), description: opt(fd, 'description') };
    if (id) must(await sb.from('responsibilities').update(row).eq('id', id));
    else {
      const yid = req(fd, 'year_id', 'Year');
      const { data: last } = await sb.from('responsibilities').select('sort_order').eq('year_id', yid).order('sort_order', { ascending: false }).limit(1);
      must(await sb.from('responsibilities').insert({ ...row, year_id: yid, sort_order: ((last?.[0]?.sort_order as number | undefined) ?? 0) + 10 }));
    }
    return { message: id ? 'Responsibility updated.' : 'Responsibility added.' };
  });
}

export async function duplicateResponsibility(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const src = must(await sb.from('responsibilities').select('*').eq('id', req(fd, 'id', 'Item')).single()).data!;
    must(await sb.from('responsibilities').insert({ year_id: src.year_id, title: `${src.title} (copy)`, description: src.description, sort_order: src.sort_order + 1 }));
    return { message: 'Responsibility duplicated.' };
  });
}

export async function saveRole(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    must(await sb.from('year_roles').upsert({
      year_id: req(fd, 'year_id', 'Year'), job_title: opt(fd, 'job_title'), team: opt(fd, 'team'),
      summary: opt(fd, 'summary'), focus_areas: opt(fd, 'focus_areas'),
    }));
    return { message: 'Role details saved.' };
  });
}

export async function saveReview(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    must(await sb.from('review_summaries').upsert({
      year_id: req(fd, 'year_id', 'Year'), narrative: opt(fd, 'narrative'), challenges: opt(fd, 'challenges'), next_priorities: opt(fd, 'next_priorities'),
    }));
    return { message: 'Review summary saved.' };
  });
}
