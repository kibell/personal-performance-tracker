import type { YearData } from '@/types';

const esc = (v: unknown) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralize spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function workToCsv(d: YearData): string {
  const goals = new Map(d.goals.map((g) => [g.id, g.title]));
  const resps = new Map(d.responsibilities.map((r) => [r.id, r.title]));
  const head = ['Title', 'Date', 'Status', 'Category', 'Project', 'Description', 'Contribution', 'Impact', 'Technologies', 'Goals', 'Responsibilities', 'Evidence link', 'Notes', 'Review highlight', 'Created', 'Last updated'];
  const rows = [...d.accomplishments].sort((a, b) => a.work_date.localeCompare(b.work_date)).map((a) => [
    a.title, a.work_date, a.status?.name, a.category?.name, a.project, a.description, a.contribution, a.impact, a.technologies.join('; '),
    a.goalIds.map((i) => goals.get(i)).filter(Boolean).join('; '), a.responsibilityIds.map((i) => resps.get(i)).filter(Boolean).join('; '),
    a.evidence_url, a.notes, a.is_highlight ? 'Yes' : 'No', a.created_at, a.updated_at,
  ]);
  return '﻿' + [head, ...rows].map((r) => r.map(esc).join(',')).join('\r\n') + '\r\n';
}
