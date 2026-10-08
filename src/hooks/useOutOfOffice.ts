import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { OutOfOfficeBlock } from '../types';

const KEY = 'tt.outOfOffice';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useOutOfOffice() {
  const [blocks, setBlocks] = useLocalStorage<OutOfOfficeBlock[]>(KEY, []);

  const addBlock = useCallback(
    (block: Omit<OutOfOfficeBlock, 'id'>) => {
      setBlocks((prev) => [...prev, { ...block, id: uid() }]);
    },
    [setBlocks]
  );

  const removeBlock = useCallback(
    (id: string) => {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    },
    [setBlocks]
  );

  return { blocks, addBlock, removeBlock };
}
