'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { guard, many, must, num, opt, req, str, type ActionState } from './helpers';

export async function signIn(_p: ActionState, fd: FormData): Promise<ActionState> {
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({ email: str(fd, 'email'), password: String(fd.get('password') ?? '') });
  if (error) return { ok: false, error: 'Those credentials did not work. Please try again.' };
  revalidatePath('/', 'layout');
  const next = str(fd, 'next');
  redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/');
}

export async function signOut() {
  const sb = await createClient();
  await sb.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function createYear(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const y = Math.round(num(fd, 'year'));
    if (y < 1990 || y > 2200) throw new Error('Enter a valid year, e.g. 2027.');
    const row = must(await sb.from('years').insert({ year: y, label: str(fd, 'label') || String(y) }).select('id').single()).data!;
    return { id: String(y), message: `${y} created — a blank slate.` + (row ? '' : '') };
  });
}

export async function renameYear(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    must(await sb.from('years').update({ label: req(fd, 'label', 'Label') }).eq('id', req(fd, 'id', 'Year')));
    return { message: 'Year renamed.' };
  });
}

export async function saveCategory(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const id = str(fd, 'id'), name = req(fd, 'name', 'Name');
    if (id) must(await sb.from('categories').update({ name }).eq('id', id));
    else {
      const { data: last } = await sb.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1);
      must(await sb.from('categories').insert({ name, sort_order: ((last?.[0]?.sort_order as number | undefined) ?? 0) + 10 }));
    }
    return { message: id ? 'Category renamed.' : 'Category added.' };
  });
}

export async function saveStatus(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const id = str(fd, 'id');
    const row = { name: req(fd, 'name', 'Name'), phase: str(fd, 'phase') || 'active', tone: str(fd, 'tone') || 'neutral' };
    if (id) must(await sb.from('statuses').update(row).eq('id', id));
    else {
      const kind = req(fd, 'kind', 'Kind');
      const { data: last } = await sb.from('statuses').select('sort_order').eq('kind', kind).order('sort_order', { ascending: false }).limit(1);
      must(await sb.from('statuses').insert({ ...row, kind, sort_order: ((last?.[0]?.sort_order as number | undefined) ?? 0) + 10 }));
    }
    return { message: id ? 'Status updated.' : 'Status added.' };
  });
}

export async function saveProfile(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const { data } = await sb.auth.getUser();
    must(await sb.from('profiles').update({
      display_name: opt(fd, 'display_name'), job_title: opt(fd, 'job_title'), department: opt(fd, 'department'), bio: opt(fd, 'bio'),
    }).eq('id', data.user!.id));
    return { message: 'Profile saved.' };
  });
}

export async function savePreferences(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const theme = str(fd, 'defaultTheme');
    must(await sb.from('settings').upsert({
      key: 'preferences',
      value: { pageSize: Math.min(100, Math.max(5, Math.round(num(fd, 'pageSize', 20)))), defaultTheme: ['light', 'dark'].includes(theme) ? theme : 'system' },
    }));
    return { message: 'Preferences saved.' };
  });
}

/** Deletes demo rows (is_sample) and any demo year that has nothing of the owner's own left in it. */
export async function removeSampleData(_p: ActionState, _fd: FormData): Promise<ActionState> {
  void many; 
  return guard(async (sb) => {
    for (const t of ['accomplishments', 'goals', 'learning_items', 'responsibilities']) must(await sb.from(t).delete().eq('is_sample', true));
    const { data: years } = await sb.from('years').select('id').eq('is_sample', true);
    for (const y of years ?? []) {
      const counts = await Promise.all(['accomplishments', 'goals', 'learning_items', 'responsibilities'].map((t) =>
        sb.from(t).select('id', { count: 'exact', head: true }).eq('year_id', y.id)));
      if (counts.every((c) => (c.count ?? 0) === 0)) must(await sb.from('years').delete().eq('id', y.id));
    }
    return { message: 'Sample data removed.' };
  });
}
