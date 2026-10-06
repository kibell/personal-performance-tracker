'use client';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const toggle = () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('prt:theme', next); } catch { /* ignore */ }
  };
  return (
    <button type="button" onClick={toggle} className="btn btn-ghost btn-sm" aria-label="Toggle light/dark theme" title="Toggle theme">
      <Sun className="hidden h-4 w-4 dark-show" aria-hidden /><Moon className="h-4 w-4 dark-hide" aria-hidden />
    </button>
  );
}
