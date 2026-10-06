import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { isConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import { getPreferences } from '@/lib/db/settings';

export const metadata: Metadata = { title: { default: 'Performance Review Tracker', template: '%s · Performance Review Tracker' }, description: 'A running record of accomplishments, goals and growth for annual performance reviews.' };

export default async function RootLayout({ children }: { children: ReactNode }) {
  let theme = 'system';
  if (isConfigured) { try { theme = (await getPreferences(await createClient())).defaultTheme; } catch { /* first run */ } }
  const init = `try{var t=localStorage.getItem('prt:theme')||${JSON.stringify(theme)};if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}`;
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: init }} /></head>
      <body><a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-surface focus:p-2">Skip to content</a><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
