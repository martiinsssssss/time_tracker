import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const TONES = {
  slate: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
  amber: 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
  sky: 'bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400',
};

interface Props {
  id: string;
  icon: LucideIcon;
  title: string;
  tone?: keyof typeof TONES;
  /** One-line current value, shown in the header while collapsed. */
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** A settings card that folds to its header; the open state is remembered per section. */
export function Section({ id, icon: Icon, title, tone = 'slate', summary, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useLocalStorage<boolean>(`tt.ui.section.${id}`, defaultOpen);
  const bodyId = `section-${id}`;
  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
      <h2>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="w-full flex items-center gap-3 p-5 text-left rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${TONES[tone]}`}>
            <Icon size={17} strokeWidth={2.25} aria-hidden />
          </span>
          <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{title}</span>
          {summary && !open && <span className="text-sm text-slate-500 dark:text-slate-400 truncate tabular-nums">{summary}</span>}
          <ChevronDown size={18} aria-hidden className={`ml-auto shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </h2>
      {open && (
        <div
          id={bodyId}
          className="px-6 pb-6 [&>*:first-child]:mt-0 [&>*:first-child]:pt-0 [&>*:first-child]:border-t-0"
        >
          {children}
        </div>
      )}
    </section>
  );
}
