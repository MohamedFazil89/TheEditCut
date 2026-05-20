// ============================================================
// FILE: src/components/work/ViewSwitcher.tsx
//
// PURPOSE:
//   The 3-mode tab bar that switches between Sequence, Bin, and
//   Storyboard views. Rendered at the top of the Work section,
//   styled like a panel toggle in editing software.
//
// PROPS:
//   current   — active ViewMode
//   onChange  — called when a new mode is selected
//
// INTEGRATES WITH:
//   src/sections/WorkSection.tsx   — mounted in the work panel header
//   src/hooks/useViewMode.ts       — source of current + onChange
//   src/components/work/ViewSwitcher.css
//
// KEYBOARD: Press V to cycle (handled by useViewMode hook, not here).
// ============================================================

import type { ViewMode } from '../styles/types';
import './ViewSwitcher.css';

interface ViewSwitcherProps {
  current: ViewMode;
  onChange: (mode: ViewMode) => void;
  projectCount: number;
}

const MODES: { id: ViewMode; icon: string; label: string; shortcut: string; desc: string }[] = [
  { id: 'sequence',   icon: '▤', label: 'SEQUENCE',   shortcut: '1', desc: 'Multi-track timeline' },
  { id: 'bin',        icon: '⊞', label: 'BIN',        shortcut: '2', desc: 'Media browser grid' },
  { id: 'storyboard', icon: '⬚', label: 'STORYBOARD', shortcut: '3', desc: 'Visual filmstrip' },
];

export function ViewSwitcher({ current, onChange, projectCount }: ViewSwitcherProps) {
  return (
    <div className="view-switcher">
      {/* Left: mode tabs */}
      <div className="view-switcher__tabs">
        {MODES.map(m => (
          <button
            key={m.id}
            className={`view-switcher__tab ${current === m.id ? 'view-switcher__tab--active' : ''}`}
            onClick={() => onChange(m.id)}
            title={`${m.desc} (${m.shortcut})`}
          >
            <span className="view-switcher__icon">{m.icon}</span>
            <span className="view-switcher__label">{m.label}</span>
            <span className="view-switcher__shortcut">{m.shortcut}</span>
          </button>
        ))}
      </div>

      {/* Center: section label */}
      <div className="view-switcher__center">
        <span className="ui-label view-switcher__title">WORK — SEQUENCE EXPLORER</span>
      </div>

      {/* Right: count + keyboard hint */}
      <div className="view-switcher__right">
        <span className="view-switcher__count">
          <span className="view-switcher__count-n">{projectCount}</span>
          <span className="view-switcher__count-lbl">clips</span>
        </span>
        <span className="view-switcher__kbd-hint">
          <kbd>V</kbd> cycle view
        </span>
      </div>
    </div>
  );
}