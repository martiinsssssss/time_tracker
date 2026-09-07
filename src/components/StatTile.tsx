import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const ACCENTS: Record<NonNullable<Props['accent']>, string> = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
};

export function StatTile({ icon: Icon, label, value, hint, accent = 'indigo' }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 transition-colors">
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${ACCENTS[accent]}`}>
        <Icon size={20} strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">{label}</p>
        <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100 leading-tight truncate">{value}</p>
        {hint && <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{hint}</p>}
      </div>
    </div>
  );
}
