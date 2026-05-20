// ============================================================
// FILE: src/hooks/useViewMode.ts
//
// PURPOSE:
//   Manages switching between the 3 Work section view modes:
//   'sequence' → multi-track timeline explorer
//   'bin'      → filterable media-browser grid cards
//   'storyboard' → visual filmstrip narrative browsing
//
// USAGE in WorkSection.tsx:
//   const { viewMode, setViewMode } = useViewMode('sequence');
//
// KEYBOARD SHORTCUTS (when work section is active):
//   V → cycle view modes
//   1 → sequence, 2 → bin, 3 → storyboard (inside work section)
//
// INTEGRATES WITH:
//   src/sections/WorkSection.tsx
//   src/components/work/ViewSwitcher.tsx
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type { ViewMode } from '../styles/types';

const CYCLE_ORDER: ViewMode[] = ['sequence', 'bin', 'storyboard'];

export function useViewMode(initial: ViewMode = 'sequence') {
  const [viewMode, setViewMode] = useState<ViewMode>(initial);

  const cycleView = useCallback(() => {
    setViewMode(prev => {
      const idx = CYCLE_ORDER.indexOf(prev);
      return CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key.toLowerCase() === 'v') cycleView();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cycleView]);

  return { viewMode, setViewMode, cycleView };
}