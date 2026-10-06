'use server';
import { BUCKET } from '@/lib/constants';
import { guard, many, must, req, str, type ActionState } from './helpers';
import type { SupabaseClient } from '@supabase/supabase-js';

const ARCHIVABLE = ['accomplishments', 'goals', 'learning_items', 'responsibilities', 'categories', 'statuses', 'years'] as const;
const DELETABLE = [...ARCHIVABLE, 'attachments'] as const;
const check = (t: string, list: readonly string[]) => { if (!list.includes(t)) throw new Error('Unsupported record type.'); return t; };

async function removeFiles(sb: SupabaseClient, paths: string[]) {
  if (paths.length) await sb.storage.from(BUCKET).remove(paths);
}

/** Collect storage paths of attachments owned by the given records, before they are deleted. */
async function filesFor(sb: SupabaseClient, table: string, id: string): Promise<string[]> {
  const col = (rows: { storage_path: string }[] | null) => (rows ?? []).map((r) => r.storage_path);
  if (table === 'attachments') return col((await sb.from('attachments').select('storage_path').eq('id', id)).data);
  if (table === 'accomplishments') return col((await sb.from('attachments').select('storage_path').eq('accomplishment_id', id)).data);
  if (table === 'learning_items') return col((await sb.from('attachments').select('storage_path').eq('learning_id', id)).data);
  if (table === 'years') {
    const [a, l] = await Promise.all([
      sb.from('accomplishments').select('id').eq('year_id', id), sb.from('learning_items').select('id').eq('year_id', id),
    ]);
    const aIds = (a.data ?? []).map((r) => r.id), lIds = (l.data ?? []).map((r) => r.id);
    const out: string[] = [];
    if (aIds.length) out.push(...col((await sb.from('attachments').select('storage_path').in('accomplishment_id', aIds)).data));
    if (lIds.length) out.push(...col((await sb.from('attachments').select('storage_path').in('learning_id', lIds)).data));
    return out;
  }
  return [];
}

/** Archive (soft delete) or restore. Fields: table, id, archive=1|0 */
export async function archiveRecord(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const table = check(str(fd, 'table'), ARCHIVABLE);
    const archive = str(fd, 'archive') !== '0';
    must(await sb.from(table).update({ archived_at: archive ? new Date().toISOString() : null }).eq('id', req(fd, 'id', 'Record')));
    return { message: archive ? 'Archived. Find it under the Archive filter.' : 'Restored.' };
  });
}

/** Permanent delete. Fields: table, id */
export async function deleteRecord(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const table = check(str(fd, 'table'), DELETABLE);
    const id = req(fd, 'id', 'Record');
    const files = await filesFor(sb, table, id);
    must(await sb.from(table).delete().eq('id', id));
    await removeFiles(sb, files);
    return { message: 'Deleted.' };
  });
}

/** Swap an item with its neighbour. Fields: table, id, dir=up|down, scopeCol?, scopeVal? */
export async function moveItem(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const table = check(str(fd, 'table'), ['categories', 'statuses', 'responsibilities', 'attachments']);
    const id = req(fd, 'id', 'Record');
    const dir = str(fd, 'dir') === 'up' ? -1 : 1;
    const scopeCol = str(fd, 'scopeCol');
    if (scopeCol) check(scopeCol, ['kind', 'year_id', 'accomplishment_id', 'learning_id']);
    let q = sb.from(table).select('id, sort_order').order('sort_order').order('id');
    if (scopeCol) q = q.eq(scopeCol, str(fd, 'scopeVal'));
    const rows = must(await q).data as { id: string; sort_order: number }[];
    const i = rows.findIndex((r) => r.id === id), j = i + dir;
    if (i < 0 || j < 0 || j >= rows.length) return;
    [rows[i], rows[j]] = [rows[j], rows[i]];
    await Promise.all(rows.map((r, idx) => (r.sort_order === (idx + 1) * 10 ? null : sb.from(table).update({ sort_order: (idx + 1) * 10 }).eq('id', r.id))).filter(Boolean) as PromiseLike<unknown>[]);
  });
}

export async function addAttachment(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    const kind = str(fd, 'kind') === 'learning' ? 'learning_id' : 'accomplishment_id';
    const ownerId = req(fd, 'owner_id', 'Owner');
    const { data: last } = await sb.from('attachments').select('sort_order').eq(kind, ownerId).order('sort_order', { ascending: false }).limit(1);
    must(await sb.from('attachments').insert({
      [kind]: ownerId, storage_path: req(fd, 'storage_path', 'File'), file_name: req(fd, 'file_name', 'File name'),
      mime_type: str(fd, 'mime_type') || null, size_bytes: Number(str(fd, 'size_bytes')) || null,
      sort_order: ((last?.[0]?.sort_order as number | undefined) ?? 0) + 10,
    }));
    return { message: 'Attachment added.' };
  });
}

export async function updateCaption(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => {
    must(await sb.from('attachments').update({ caption: str(fd, 'caption') || null }).eq('id', req(fd, 'id', 'Attachment')));
    return { message: 'Caption saved.' };
  });
}

/** Remove uploaded files that never got a database row (e.g. failed insert). */
export async function discardUploads(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async (sb) => { await removeFiles(sb, many(fd, 'paths')); });
}
