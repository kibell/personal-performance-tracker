'use client';
import Link from 'next/link';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastItem { id: number; message: string; kind: 'success' | 'error'; href?: string; hrefLabel?: string }
const Ctx = createContext<{ push: (t: Omit<ToastItem, 'id'>) => void }>({ push: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Date.now() + Math.random();
    setItems((l) => [...l, { ...t, id }]);
    setTimeout(() => setItems((l) => l.filter((x) => x.id !== id)), t.href ? 8000 : 4500);
  }, []);
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="no-print fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="card flex items-start gap-2.5 p-3 text-sm shadow-pop">
            {t.kind === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />}
            <div className="min-w-0 flex-1">
              <p>{t.message}</p>
              {t.href && <Link href={t.href} className="mt-1 inline-block font-medium text-accent underline">{t.hrefLabel ?? 'Open'}</Link>}
            </div>
            <button className="text-muted hover:text-ink" aria-label="Dismiss" onClick={() => setItems((l) => l.filter((x) => x.id !== t.id))}><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
