import { useState } from 'react';
import { HardDriveDownload, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useIntervals } from '../hooks/useIntervals';
import { useNow } from '../hooks/useNow';
import { LAST_EXPORT_KEY as KEY } from '../lib/backup';

const DAY = 86_400_000;
const REMIND_AFTER_DAYS = 14;

/** Nudges an export when there's data and no backup in the last two weeks. */
export function BackupReminder({ onOpenSettings }: { onOpenSettings: () => void }) {
  const [lastExport] = useLocalStorage<string | null>(KEY, null);
  const [dismissed, setDismissed] = useState(false);
  const { intervals } = useIntervals();
  const now = useNow(3_600_000);
  const age = lastExport ? (now - new Date(lastExport).getTime()) / DAY : Infinity;
  if (dismissed || intervals.length === 0 || age < REMIND_AFTER_DAYS) return null;
  return (
    <div role="status" className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
      <HardDriveDownload size={18} aria-hidden className="shrink-0 text-slate-500" />
      <span className="flex-1">
        {lastExport ? `Last backup ${Math.floor(age)} days ago.` : 'No backup yet.'} Your data lives only in this browser.
      </span>
      <button onClick={onOpenSettings} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
        Export
      </button>
      <button onClick={() => setDismissed(true)} aria-label="Dismiss backup reminder" className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        <X size={15} aria-hidden />
      </button>
    </div>
  );
}
