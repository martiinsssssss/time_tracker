export const LAST_EXPORT_KEY = 'tt.lastExport';

/** Records a successful export so the reminder goes away. */
export function markExported() {
  try {
    localStorage.setItem(LAST_EXPORT_KEY, JSON.stringify(new Date().toISOString()));
    window.dispatchEvent(new StorageEvent('storage', { key: LAST_EXPORT_KEY }));
  } catch {
    /* storage unavailable: the reminder just stays */
  }
}

