import { SUPABASE_URL } from '@/lib/env';
import { BUCKET } from '@/lib/constants';
import type { Accomplishment, Attachment, LearningItem } from '@/types';

export const publicUrl = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`;

/* eslint-disable @typescript-eslint/no-explicit-any */
export function normalizeAttachments(rows: any[] | null | undefined): Attachment[] {
  return (rows ?? [])
    .map((a) => ({ ...a, url: publicUrl(a.storage_path), isImage: String(a.mime_type ?? '').startsWith('image/') }) as Attachment)
    .sort((a, b) => a.sort_order - b.sort_order || a.file_name.localeCompare(b.file_name));
}

export function normalizeAccomplishment(r: any): Accomplishment {
  const { accomplishment_goals, accomplishment_responsibilities, attachments, work_date, search_blob: _s, ...rest } = r;
  void _s;
  return {
    ...rest,
    work_date,
    goalIds: (accomplishment_goals ?? []).map((g: any) => g.goal_id),
    responsibilityIds: (accomplishment_responsibilities ?? []).map((g: any) => g.responsibility_id),
    attachments: normalizeAttachments(attachments),
  } as Accomplishment;
}

export function normalizeLearning(r: any): LearningItem {
  const { learning_accomplishments, attachments, ...rest } = r;
  return {
    ...rest,
    accomplishmentIds: (learning_accomplishments ?? []).map((g: any) => g.accomplishment_id),
    attachments: normalizeAttachments(attachments),
  } as LearningItem;
}

export const ACC_SELECT =
  '*, category:categories(id,name), status:statuses(id,name,tone,phase), accomplishment_goals(goal_id), accomplishment_responsibilities(responsibility_id), attachments(id,accomplishment_id,learning_id,storage_path,file_name,mime_type,size_bytes,caption,sort_order)';
export const LEARN_SELECT =
  '*, status:statuses(id,name,tone,phase), learning_accomplishments(accomplishment_id), attachments(id,accomplishment_id,learning_id,storage_path,file_name,mime_type,size_bytes,caption,sort_order)';
export const GOAL_SELECT = '*, status:statuses(id,name,tone,phase)';
