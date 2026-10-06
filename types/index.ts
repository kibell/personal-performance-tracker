export type StatusKind = 'work' | 'goal' | 'learning';
export type StatusPhase = 'not_started' | 'active' | 'complete' | 'inactive';
export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface Year { id: string; year: number; label: string; is_sample: boolean; archived_at: string | null; created_at: string }
export interface Category { id: string; name: string; sort_order: number; archived_at: string | null }
export interface Status { id: string; kind: StatusKind; name: string; phase: StatusPhase; tone: Tone; sort_order: number; archived_at: string | null }
export interface StatusRef { id: string; name: string; tone: Tone; phase: StatusPhase }

export interface Attachment {
  id: string; accomplishment_id: string | null; learning_id: string | null; storage_path: string;
  file_name: string; mime_type: string | null; size_bytes: number | null; caption: string | null; sort_order: number;
  url: string; isImage: boolean;
}

export interface Accomplishment {
  id: string; year_id: string; title: string; work_date: string; description: string | null;
  category_id: string | null; project: string | null; contribution: string | null; impact: string | null;
  technologies: string[]; evidence_url: string | null; notes: string | null; status_id: string | null;
  is_highlight: boolean; needs_details: boolean; is_sample: boolean; archived_at: string | null;
  created_at: string; updated_at: string;
  category: { id: string; name: string } | null;
  status: StatusRef | null;
  goalIds: string[]; responsibilityIds: string[]; attachments: Attachment[];
}

export interface Goal {
  id: string; year_id: string; title: string; description: string | null;
  sustainable: string | null; measurable: string | null; attainable: string | null; relevant: string | null;
  time_based: string | null; aligned: string | null; success_metric: string | null; target_date: string | null;
  status_id: string | null; progress: number; progress_notes: string | null; final_outcome: string | null;
  is_sample: boolean; archived_at: string | null; created_at: string; updated_at: string;
  status: StatusRef | null;
}

export interface LearningItem {
  id: string; year_id: string; title: string; item_type: string; description: string | null;
  start_date: string | null; completion_date: string | null; status_id: string | null; notes: string | null;
  goal_id: string | null; resource_url: string | null; is_sample: boolean; archived_at: string | null;
  created_at: string; updated_at: string; status: StatusRef | null;
  accomplishmentIds: string[]; attachments: Attachment[];
}

export interface Responsibility { id: string; year_id: string; title: string; description: string | null; sort_order: number; is_sample: boolean; archived_at: string | null }
export interface YearRole { year_id: string; job_title: string | null; team: string | null; summary: string | null; focus_areas: string | null }
export interface ReviewSummary { year_id: string; narrative: string | null; challenges: string | null; next_priorities: string | null }
export interface Profile { id: string; display_name: string | null; job_title: string | null; department: string | null; bio: string | null; is_admin: boolean }
export interface Preferences { pageSize: number; defaultTheme: 'system' | 'light' | 'dark' }

export interface YearData {
  year: Year;
  categories: Category[];
  workStatuses: Status[]; goalStatuses: Status[]; learningStatuses: Status[];
  accomplishments: Accomplishment[];   // non-archived (or incl. archived for admin when requested)
  goals: Goal[]; learning: LearningItem[]; responsibilities: Responsibility[];
  role: YearRole | null; review: ReviewSummary | null;
}
