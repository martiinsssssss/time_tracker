import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { OutOfOfficeBlock } from '../types';

const KEY = 'tt.outOfOffice';
const SKIPS_KEY = 'tt.oooSkips';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useOutOfOffice() {
  const [blocks, setBlocks] = useLocalStorage<OutOfOfficeBlock[]>(KEY, []);
  // `${blockId}@${YYYY-MM-DD}` — a block marked as skipped on that date.
  const [skips, setSkips] = useLocalStorage<string[]>(SKIPS_KEY, []);

  const addBlock = useCallback(
    (block: Omit<OutOfOfficeBlock, 'id'>) => {
      setBlocks((prev) => [...prev, { ...block, id: uid() }]);
    },
    [setBlocks]
  );

  const removeBlock = useCallback(
    (id: string) => {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      setSkips((prev) => prev.filter((k) => !k.startsWith(`${id}@`)));
    },
    [setBlocks, setSkips]
  );

  /** Marks (or unmarks) the given skip keys as skipped. */
  const setSkipped = useCallback(
    (keys: string[], skipped: boolean) => {
      setSkips((prev) => {
        const next = new Set(prev);
        for (const k of keys) {
          if (skipped) next.add(k);
          else next.delete(k);
        }
        return [...next].sort();
      });
    },
    [setSkips]
  );

  return { blocks, skips, addBlock, removeBlock, setSkipped };
}
