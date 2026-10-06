import type { Profile, YearData } from '@/types';
import { yearStats } from '@/lib/stats';
import { formatDate, lines } from '@/lib/utils';

export function reviewToMarkdown(d: YearData, owner: Profile | null): string {
  const s = yearStats(d);
  const goals = new Map(d.goals.map((g) => [g.id, g.title]));
  const out: string[] = [`# ${d.year.label} Performance Review`];
  if (owner) out.push(`*${[owner.display_name, d.role?.job_title || owner.job_title, d.role?.team || owner.department].filter(Boolean).join(' · ')}*`);
  out.push(`${s.accomplishments} accomplishments (${s.highlights.length} highlighted) · ${s.goalsCompleted} of ${s.goals} goals completed · ${s.learning} learning items`);
  if (d.review?.narrative) out.push('## Summary', d.review.narrative);

  out.push('## Major Accomplishments');
  const hl = [...s.highlights].sort((a, b) => a.work_date.localeCompare(b.work_date));
  if (!hl.length) out.push('_No highlights marked yet._');
  for (const a of hl) {
    const bits = [`### ${a.title}`, `*${formatDate(a.work_date)}${a.category ? ` · ${a.category.name}` : ''}${a.project ? ` · ${a.project}` : ''}*`];
    if (a.description) bits.push(a.description);
    if (a.contribution) bits.push(`**Contribution:** ${a.contribution}`);
    if (a.impact) bits.push(`**Impact:** ${a.impact}`);
    if (a.technologies.length) bits.push(`**Skills & technologies:** ${a.technologies.join(', ')}`);
    const gl = a.goalIds.map((i) => goals.get(i)).filter(Boolean);
    if (gl.length) bits.push(`**Supports goals:** ${gl.join('; ')}`);
    if (a.evidence_url) bits.push(`**Evidence:** ${a.evidence_url}`);
    out.push(bits.join('\n\n'));
  }

  out.push('## Goals');
  if (!d.goals.length) out.push('_No goals set._');
  for (const g of d.goals) {
    out.push(`### ${g.title}\n\n**Status:** ${g.status?.name ?? '—'} · **Progress:** ${g.progress}%${g.target_date ? ` · **Target:** ${formatDate(g.target_date)}` : ''}` +
      (g.success_metric ? `\n\n**Success metric:** ${g.success_metric}` : '') + (g.final_outcome ? `\n\n**Outcome:** ${g.final_outcome}` : g.progress_notes ? `\n\n**Progress:** ${g.progress_notes}` : ''));
  }

  out.push('## Skills Developed');
  const done = d.learning.filter((l) => l.status?.phase === 'complete'), act = d.learning.filter((l) => l.status?.phase === 'active');
  if (done.length) out.push('**Completed**\n\n' + done.map((l) => `- ${l.title} (${l.item_type})`).join('\n'));
  if (act.length) out.push('**In progress**\n\n' + act.map((l) => `- ${l.title} (${l.item_type})`).join('\n'));
  if (s.tech.length) out.push('**Technologies applied:** ' + s.tech.map((t) => `${t.name} (${t.count})`).join(', '));

  out.push('## Role Alignment');
  if (d.role?.summary) out.push(d.role.summary);
  for (const r of d.responsibilities) {
    const all = d.accomplishments.filter((a) => a.responsibilityIds.includes(r.id));
    out.push(`- **${r.title}** — ${all.length} related, ${all.filter((a) => a.is_highlight).length} highlighted`);
  }
  out.push('## Challenges & Lessons Learned', d.review?.challenges || '_Not written yet._');
  out.push('## Next-Year Priorities', lines(d.review?.next_priorities).map((l) => `- ${l}`).join('\n') || '_Not written yet._');
  return out.join('\n\n').replace(/\n\n(- \*\*)/g, '\n$1') + '\n';
}
