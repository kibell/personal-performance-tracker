import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export type ActionState = { ok: boolean; message?: string; error?: string; id?: string } | null;
export type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

/** Returns a Supabase client bound to the signed-in admin, or throws. RLS re-checks this in the database. */
export async function adminClient(): Promise<SupabaseClient> {
  const sb = await createClient();
  const { data } = await sb.auth.getUser();
  if (!data.user) throw new Error('Please sign in to make changes.');
  const { data: p } = await sb.from('profiles').select('is_admin').eq('id', data.user.id).maybeSingle();
  if (!p?.is_admin) throw new Error('This account does not have edit access.');
  return sb;
}

export function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/violates foreign key constraint/i.test(msg)) return 'This item is still in use. Archive it instead, or remove what depends on it first.';
  if (/duplicate key|unique constraint/i.test(msg)) return 'That name already exists.';
  if (/row-level security/i.test(msg)) return 'You do not have permission to do that.';
  return msg;
}

/** Runs an admin-only mutation, revalidates every page, and converts thrown errors into form state. */
export async function guard(fn: (sb: SupabaseClient) => Promise<{ message?: string; id?: string } | void>): Promise<ActionState> {
  try {
    const sb = await adminClient();
    const r = (await fn(sb)) ?? {};
    revalidatePath('/', 'layout');
    return { ok: true, ...r };
  } catch (e) {
    if (e instanceof Error && (e as Error & { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw e;
    return { ok: false, error: friendlyError(e) };
  }
}

export const must = <T extends { error: { message: string } | null }>(r: T): T => {
  if (r.error) throw new Error(r.error.message);
  return r;
};

export const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
export const opt = (fd: FormData, k: string) => str(fd, k) || null;
export const num = (fd: FormData, k: string, d = 0) => { const n = Number(fd.get(k)); return Number.isFinite(n) ? n : d; };
export const bool = (fd: FormData, k: string) => fd.get(k) === 'on' || fd.get(k) === '1' || fd.get(k) === 'true';
export const many = (fd: FormData, k: string) => fd.getAll(k).map(String).filter(Boolean);
export const req = (fd: FormData, k: string, label: string) => { const v = str(fd, k); if (!v) throw new Error(`${label} is required.`); return v; };
export const dateOrNull = (fd: FormData, k: string) => { const v = str(fd, k); return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null; };
export const urlOrNull = (fd: FormData, k: string) => {
  const v = str(fd, k); if (!v) return null;
  if (!/^https?:\/\//i.test(v)) throw new Error('Links must start with http:// or https://');
  return v;
};
