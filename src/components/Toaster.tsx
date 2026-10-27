import { useEffect } from 'react';
import { X } from 'lucide-react';
import { dismissToast, pauseToast, resumeToast, useToast } from '../hooks/useToast';

/** True when a keypress belongs to a text field rather than to the app. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function Toaster() {
  const toast = useToast();

  // Shift+Z runs the toast's action, so undo never depends on reaching the button in time.
  useEffect(() => {
    if (!toast?.action) return;
    const action = toast.action;
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== 'z' || !e.shiftKey || e.repeat || e.altKey || e.metaKey || e.ctrlKey || isTyping(e.target)) return;
      e.preventDefault();
      action.run();
      dismissToast();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toast]);

  return (
    // The live region stays mounted so screen readers announce each new message.
    <div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(30rem,calc(100%-2rem))]">
      {toast && (
        <div
          key={toast.id}
          onMouseEnter={pauseToast}
          onMouseLeave={() => resumeToast()}
          onFocus={pauseToast}
          onBlur={() => resumeToast()}
          className="toast-in flex items-center gap-3 bg-slate-800 dark:bg-slate-700 text-white text-sm rounded-xl pl-4 pr-2 py-2 shadow-lg"
        >
          <span className="flex-1 min-w-0 tabular-nums text-pretty">{toast.message}</span>
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.run();
                dismissToast();
              }}
              aria-keyshortcuts="Shift+Z"
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-indigo-300 hover:bg-white/10 transition-colors"
            >
              {toast.action.label}
              <kbd className="px-1 rounded bg-white/10 font-sans text-[11px] font-semibold leading-4 text-slate-300" aria-hidden>
                ⇧Z
              </kbd>
            </button>
          )}
          <button
            onClick={dismissToast}
            aria-label="Dismiss"
            className="shrink-0 p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={15} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
