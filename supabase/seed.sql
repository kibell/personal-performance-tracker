-- OPTIONAL demo data (all rows flagged is_sample = true).
-- Run in the Supabase SQL editor AFTER 0001_init.sql.
-- Remove later from the app: Settings → Data → "Remove sample data".

insert into public.years (year, label, is_sample) values (2025, '2025', true), (2026, '2026', true);

-- ---------------- Role & responsibilities ----------------
insert into public.year_roles (year_id, job_title, team, summary, focus_areas)
select id, 'Front-End Developer', 'University Marketing — Digital Experience',
  'Build and maintain accessible, performant marketing experiences (landing pages, CloudPages, email templates) in Salesforce Marketing Cloud and support campaign launches with reusable front-end components.',
  'Accessibility, Salesforce Marketing Cloud, reusable components, performance'
from public.years where year = 2026;

insert into public.year_roles (year_id, job_title, team, summary, focus_areas)
select id, 'Front-End Developer', 'University Marketing — Digital Experience',
  'Supported campaign landing pages and email builds.', 'Landing pages, email'
from public.years where year = 2025;

insert into public.responsibilities (year_id, title, description, sort_order, is_sample)
select y.id, v.t, v.d, v.o, true
from public.years y,
(values
  ('Build and maintain campaign landing pages','Develop responsive, accessible landing pages and CloudPages for enrollment and nurture campaigns.',10),
  ('Ensure accessibility and quality standards','Audit and remediate WCAG issues across marketing experiences.',20),
  ('Maintain reusable component library','Create and document shared HTML/CSS patterns to speed up campaign builds.',30),
  ('Support email and SMS campaign execution','Partner with marketers on templates, dynamic content and QA.',40),
  ('Improve performance and workflow','Reduce page weight, improve Core Web Vitals and streamline development processes.',50),
  ('Collaborate with cross-functional partners','Work with marketing, design, analytics and IT on delivery.',60)
) as v(t,d,o)
where y.year = 2026;

-- ---------------- Goals ----------------
insert into public.goals (year_id, title, description, sustainable, measurable, attainable, relevant, time_based, aligned,
                          success_metric, target_date, status_id, progress, progress_notes, final_outcome, is_sample)
select y.id, v.title, v.descr, v.s, v.m, v.a, v.r, v.t, v.al, v.metric, v.target::date,
  (select id from public.statuses where kind='goal' and name = v.status), v.prog, v.pn, v.fo, true
from public.years y,
(values
  ('Improve Landing Page Accessibility',
   'Audit priority landing pages throughout the review period and implement accessibility improvements that address identified issues and improve consistency across marketing experiences.',
   'Fixes are folded into the shared component library so new pages inherit them.',
   'Number of priority pages audited and zero critical WCAG 2.2 AA failures remaining.',
   'Audit is scoped to the 12 highest-traffic pages, 2–3 per month.',
   'Supports university accessibility commitments and improves conversion for all users.',
   'Complete audits by Nov 30, 2026.',
   'Aligned with the department objective to deliver inclusive marketing experiences.',
   '12 priority pages audited; 0 critical issues remaining', '2026-11-30', 'In Progress', 65,
   'Nurture pages complete. Remaining: admissions event pages and two CloudPages forms.', null),
  ('Build a Reusable Component Library',
   'Document and publish a set of reusable HTML/CSS components for campaign pages.',
   'Components are versioned and documented.', '10 components published and used on 5+ pages.',
   'Roughly one component every five weeks.', 'Reduces build time and design drift.',
   'Publish v1 by Sep 30, 2026.', 'Supports the team goal of faster campaign delivery.',
   '10 components in production use', '2026-09-30', 'On Track', 80,
   'Buttons, form fields, hero, cards, accordion, alert, banner, and footer shipped.', null),
  ('Improve Core Web Vitals on Top Landing Pages',
   'Reduce LCP and layout shift on the highest-traffic pages.',
   'Performance budget documented in the workflow.', 'LCP under 2.5s on mobile for top 8 pages.',
   'Image optimization and CSS cleanup are within scope.', 'Page speed affects paid campaign quality scores.',
   'Q3 2026.', 'Aligned with digital performance KPIs.',
   'LCP < 2.5s on 8 pages', '2026-09-15', 'At Risk', 40,
   'Third-party scripts limit gains on two pages; evaluating deferral options.', null),
  ('Complete SFMC Data Extensions Training',
   'Strengthen skills in Data Extensions, AMPscript and dynamic content.',
   'Knowledge shared through a team brown-bag.', 'Course complete and one dynamic CloudPage shipped.',
   'About 2 hours per week.', 'Dynamic content is a growing share of campaign work.',
   'Complete by Jun 30, 2026.', 'Aligned with team upskilling plan.',
   'Course + one production dynamic page', '2026-06-30', 'Completed', 100,
   'Finished course in May; first dynamic CloudPage launched in June.',
   'Completed course and launched a personalized CloudPage using Data Extensions.'),
  ('Streamline Campaign QA Workflow',
   'Create a repeatable QA checklist and tooling for campaign builds.',
   'Checklist lives in the team wiki.', 'Defect rate on launch days reduced.',
   'Small process change.', 'Fewer post-launch fixes.', 'Dec 2026.', 'Aligned with team process goals.',
   'Checklist adopted by team', '2026-12-15', 'Not Started', 0, null, null)
) as v(title,descr,s,m,a,r,t,al,metric,target,status,prog,pn,fo)
where y.year = 2026;

insert into public.goals (year_id, title, description, success_metric, status_id, progress, final_outcome, is_sample)
select y.id, 'Learn Salesforce Marketing Cloud Basics', 'Become productive with Email Studio and CloudPages.',
  'Ship three CloudPages independently',
  (select id from public.statuses where kind='goal' and name='Completed'), 100,
  'Shipped five CloudPages and completed Email Studio certification prep.', true
from public.years y where y.year = 2025;

-- ---------------- Accomplishments (2026) ----------------
insert into public.accomplishments (year_id, title, work_date, description, category_id, project, contribution, impact,
  technologies, evidence_url, notes, status_id, is_highlight, is_sample)
select y.id, v.title, v.d::date, v.descr,
  (select id from public.categories where name = v.cat),
  v.project, v.contrib, v.impact, string_to_array(v.tech, ','), v.url, v.notes,
  (select id from public.statuses where kind='work' and name = v.status), v.hl, true
from public.years y,
(values
 ('Accessibility Improvements — Nurture Landing Pages','2026-09-18',
  'Reviewed several campaign landing pages and corrected accessibility issues involving labels, heading hierarchy, keyboard navigation, and color contrast.',
  'Accessibility','Nurture Campaign',
  'Led the audit, wrote the remediation plan, and implemented all fixes in HTML/CSS.',
  'Pages now meet WCAG 2.2 AA; improved usability for keyboard and screen-reader users and reduced form abandonment complaints.',
  'HTML,CSS,Salesforce Marketing Cloud','https://example.com/jira/ACC-142','Axe and manual keyboard testing used for verification.','Completed',true),
 ('Built reusable hero and card components','2026-08-27',
  'Created documented hero, card and banner components used across campaign pages.',
  'Reusable Components','Component Library',
  'Designed the markup, wrote the CSS, and documented usage with examples.',
  'Cut average landing page build time by roughly a third for the campaign team.',
  'HTML,CSS,JavaScript','https://example.com/wiki/components',null,'Completed',true),
 ('Launched personalized CloudPage with Data Extensions','2026-06-12',
  'Built a CloudPage that pulls applicant program data from a Data Extension to personalize content.',
  'Data Extensions / Dynamic Content','Admissions Follow-up',
  'Wrote AMPscript lookups, built fallbacks for missing data, and QA''d with test records.',
  'Enabled personalized follow-up for ~8,000 prospective students.',
  'AMPscript,Salesforce Marketing Cloud,HTML','https://example.com/jira/MKT-377',null,'Completed',true),
 ('Reduced hero image weight on top landing pages','2026-07-22',
  'Converted hero images to responsive WebP and added explicit dimensions.',
  'Performance / Core Web Vitals','Speed Initiative',
  'Audited with Lighthouse, optimized assets and updated templates.',
  'Mobile LCP improved by ~0.9s on tested pages.',
  'HTML,CSS,Lighthouse',null,'Two pages still limited by third-party scripts.','Completed',true),
 ('Fixed form labels and error messaging on inquiry forms','2026-09-04',
  'Associated labels with inputs and added accessible inline error messages.',
  'Accessibility','Inquiry Forms','Implemented and tested fixes.','Fewer submission errors.',
  'HTML,CSS,JavaScript',null,null,'Completed',false),
 ('Updated heading structure on admissions event pages','2026-09-25',
  'Reworked heading hierarchy and landmarks on event pages.',
  'Accessibility','Admissions Events','Implemented fixes.',null,'HTML',null,null,'In Progress',false),
 ('Color contrast fixes for program pages','2026-09-10',
  'Adjusted palette tokens to meet 4.5:1 contrast.',
  'Accessibility','Nurture Campaign','Updated CSS variables.',null,'CSS',null,null,'Completed',false),
 ('Spring enrollment campaign landing page','2026-02-20',
  'Built and launched the spring enrollment landing page with tracking.',
  'Landing Pages','Spring Enrollment','Built the page and coordinated QA with marketing and analytics.',
  'Page supported the campaign''s highest-volume week of inquiries.',
  'HTML,CSS,JavaScript,Salesforce Marketing Cloud',null,null,'Completed',true),
 ('Email template refresh for transfer students','2026-03-30',
  'Rebuilt responsive email templates with dark-mode support.',
  'Email / SMS Support','Transfer Campaign','Built templates and tested across clients.',
  'Consistent rendering across major email clients.','HTML,CSS',null,null,'Completed',false),
 ('SMS opt-in CloudPage','2026-04-14',
  'Built a CloudPage to capture SMS consent.',
  'Email / SMS Support','SMS Program','Built the form and consent copy handling.',null,'HTML,CSS,AMPscript',null,null,'Completed',false),
 ('Introduced PR checklist for front-end changes','2026-05-05',
  'Created a lightweight review checklist covering accessibility, performance and cross-browser checks.',
  'Development Workflow','Workflow','Drafted checklist and presented to the team.',
  'Adopted by the team; fewer regressions at launch.','Markdown',null,null,'Completed',true),
 ('Refactored legacy landing page CSS','2026-05-28',
  'Removed duplicated styles and consolidated tokens.',
  'Technical Debt','Legacy CSS','Refactored and regression-tested pages.','Reduced CSS size by ~30%.','CSS',null,null,'Completed',false),
 ('Partnered with Analytics on conversion tracking','2026-04-02',
  'Aligned event naming and added consistent tracking to campaign pages.',
  'Collaboration','Analytics','Implemented data layer events.',null,'JavaScript,Google Tag Manager',null,null,'Completed',false),
 ('Weekly campaign support — October launch','2026-10-02',
  'Supported final QA and fixes for the October campaign launch.',
  'Campaign Support','October Campaign','Handled late-breaking content changes.',null,'HTML,CSS',null,null,'In Progress',false)
) as v(title,d,descr,cat,project,contrib,impact,tech,url,notes,status,hl)
where y.year = 2026;

insert into public.accomplishments (year_id, title, work_date, description, category_id, contribution, technologies, status_id, is_highlight, is_sample)
select y.id, v.title, v.d::date, v.descr, (select id from public.categories where name = v.cat), v.contrib,
  string_to_array(v.tech, ','), (select id from public.statuses where kind='work' and name='Completed'), v.hl, true
from public.years y,
(values
 ('Launched five CloudPages for fall campaigns','2025-09-15','Built and shipped CloudPages for fall enrollment.','CloudPages','Built all pages end to end.','HTML,CSS,AMPscript',true),
 ('Learned Email Studio fundamentals','2025-05-10','Completed internal training and shipped first templates.','Learning / Professional Development','Completed training and built templates.','HTML,Salesforce Marketing Cloud',false),
 ('Migrated landing pages to responsive grid','2025-11-03','Replaced fixed-width layouts with a responsive grid.','Front-End Development','Implemented the grid and updated 14 pages.','CSS,HTML',true),
 ('Winter campaign support','2025-12-08','Supported QA and fixes for winter campaigns.','Campaign Support','Handled QA and fixes.','HTML',false)
) as v(title,d,descr,cat,contrib,tech,hl)
where y.year = 2025;

-- ---------------- Links: accomplishments → goals ----------------
insert into public.accomplishment_goals (accomplishment_id, goal_id)
select a.id, g.id
from (values
  ('Accessibility Improvements — Nurture Landing Pages','Improve Landing Page Accessibility'),
  ('Fixed form labels and error messaging on inquiry forms','Improve Landing Page Accessibility'),
  ('Updated heading structure on admissions event pages','Improve Landing Page Accessibility'),
  ('Color contrast fixes for program pages','Improve Landing Page Accessibility'),
  ('Built reusable hero and card components','Build a Reusable Component Library'),
  ('Refactored legacy landing page CSS','Build a Reusable Component Library'),
  ('Reduced hero image weight on top landing pages','Improve Core Web Vitals on Top Landing Pages'),
  ('Launched personalized CloudPage with Data Extensions','Complete SFMC Data Extensions Training'),
  ('Introduced PR checklist for front-end changes','Streamline Campaign QA Workflow')
) v(at, gt)
join public.accomplishments a on a.title = v.at and a.is_sample
join public.goals g on g.title = v.gt and g.is_sample;

-- ---------------- Links: accomplishments → responsibilities ----------------
insert into public.accomplishment_responsibilities (accomplishment_id, responsibility_id)
select a.id, r.id
from (values
  ('Accessibility Improvements — Nurture Landing Pages','Ensure accessibility and quality standards'),
  ('Accessibility Improvements — Nurture Landing Pages','Build and maintain campaign landing pages'),
  ('Fixed form labels and error messaging on inquiry forms','Ensure accessibility and quality standards'),
  ('Built reusable hero and card components','Maintain reusable component library'),
  ('Launched personalized CloudPage with Data Extensions','Build and maintain campaign landing pages'),
  ('Reduced hero image weight on top landing pages','Improve performance and workflow'),
  ('Spring enrollment campaign landing page','Build and maintain campaign landing pages'),
  ('Email template refresh for transfer students','Support email and SMS campaign execution'),
  ('SMS opt-in CloudPage','Support email and SMS campaign execution'),
  ('Introduced PR checklist for front-end changes','Improve performance and workflow'),
  ('Partnered with Analytics on conversion tracking','Collaborate with cross-functional partners'),
  ('Weekly campaign support — October launch','Support email and SMS campaign execution')
) v(at, rt)
join public.accomplishments a on a.title = v.at and a.is_sample
join public.responsibilities r on r.title = v.rt and r.is_sample;

-- ---------------- Learning & development ----------------
insert into public.learning_items (year_id, title, item_type, description, start_date, completion_date, status_id,
                                   notes, goal_id, resource_url, is_sample)
select y.id, v.title, v.type, v.descr, v.sd::date, v.cd::date,
  (select id from public.statuses where kind='learning' and name = v.status), v.notes,
  (select g.id from public.goals g where g.year_id = y.id and g.title = v.goal), v.url, true
from public.years y,
(values
 ('Salesforce Marketing Cloud Data Extensions','Skill',
  'Build a stronger understanding of Data Extensions and how they support dynamic content and personalized CloudPage experiences.',
  '2026-03-01',null,'In Progress','Practicing with sendable vs non-sendable DEs.','Complete SFMC Data Extensions Training','https://trailhead.salesforce.com'),
 ('Web Accessibility Fundamentals (WCAG 2.2)','Course','Course covering WCAG 2.2 AA success criteria and testing.',
  '2026-01-15','2026-03-10','Completed','Applied directly to landing page audits.','Improve Landing Page Accessibility','https://www.w3.org/WAI/'),
 ('AMPscript Deep Dive','Course','Advanced AMPscript for lookups and conditional content.',
  '2026-04-01','2026-05-20','Completed',null,'Complete SFMC Data Extensions Training',null),
 ('Core Web Vitals Optimization','Research Topic','Researching practical strategies for LCP and CLS improvements.',
  '2026-06-01',null,'In Progress',null,'Improve Core Web Vitals on Top Landing Pages','https://web.dev/vitals/'),
 ('CSS Container Queries','Technology','Exploring container queries for truly reusable components.',
  null,null,'Planned',null,'Build a Reusable Component Library',null),
 ('Internal brown-bag: Accessible Forms','Internal Learning','Presented accessible form patterns to the marketing team.',
  '2026-08-12','2026-08-12','Completed',null,'Improve Landing Page Accessibility',null)
) as v(title,type,descr,sd,cd,status,notes,goal,url)
where y.year = 2026;

insert into public.learning_accomplishments (learning_id, accomplishment_id)
select l.id, a.id
from (values
  ('Salesforce Marketing Cloud Data Extensions','Launched personalized CloudPage with Data Extensions'),
  ('Web Accessibility Fundamentals (WCAG 2.2)','Accessibility Improvements — Nurture Landing Pages'),
  ('AMPscript Deep Dive','Launched personalized CloudPage with Data Extensions')
) v(lt, at)
join public.learning_items l on l.title = v.lt and l.is_sample
join public.accomplishments a on a.title = v.at and a.is_sample;

-- ---------------- Review summary draft ----------------
insert into public.review_summaries (year_id, narrative, challenges, next_priorities)
select id,
 'This year I focused on making marketing experiences more accessible, faster to build, and easier to maintain. I led accessibility remediation across priority landing pages, shipped a reusable component set, and expanded my Salesforce Marketing Cloud skills with Data Extensions and AMPscript.',
 'Third-party scripts limited performance gains on two high-traffic pages; I learned to bring performance budgets into conversations earlier in the campaign planning process.',
 E'Finish the remaining accessibility audits\nPublish v2 of the component library\nBring Core Web Vitals to target on all priority pages'
from public.years where year = 2026;
