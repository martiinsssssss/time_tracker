import { X } from 'lucide-react';
import { dismissToast, useToast } from '../hooks/useToast';

export function Toaster() {
  const toast = useToast();

  return (
    // The live region stays mounted so screen readers announce each new message.
    <div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(28rem,calc(100%-2rem))]">
      {toast && (
        <div
          key={toast.id}
          className="toast-in flex items-center gap-3 bg-slate-800 dark:bg-slate-700 text-white text-sm rounded-xl pl-4 pr-2 py-2 shadow-lg"
        >
          <span className="flex-1 min-w-0 tabular-nums">{toast.message}</span>
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.run();
                dismissToast();
              }}
              className="shrink-0 px-2.5 py-1 rounded-lg font-semibold text-indigo-300 hover:bg-white/10 transition-colors"
            >
              {toast.action.label}
            </button>
          )}
          <button
            onClick={dismissToast}
            aria-label="Dismiss"
            className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
