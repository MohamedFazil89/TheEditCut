// ============================================================
// FILE: src/components/ui/Inspector.tsx
//
// PURPOSE:
//   The right-side docked inspector panel. Slides in when a clip
//   is selected. Shows project metadata, software stack, tags,
//   turnaround info, and CTA buttons ("Open Project" / "Close").
//
//   Mimics the Premiere Pro / DaVinci "Inspector" / "Metadata" panel.
//
// PROPS:
//   project     — the active Project, or null to close
//   onClose     — called when user clicks close or presses Escape
//   onOpenProject — called when "Open Project" is clicked (Phase 5: detail page)
//
// INTEGRATES WITH:
//   src/sections/HomeSection.tsx  — renders this panel alongside monitor+timeline
//   src/components/ui/Inspector.css
//   src/types/index.ts             — Project type
//
// POSITION: Absolutely positioned right:0, top:0 in the workspace.
//           Width animates 0 → 240px on open via CSS transition.
//           z-index: var(--z-monitor) so it layers above the timeline.
// ============================================================

import { useEffect } from 'react';
import type { Project } from '../../styles/types';
import './Inspector.css';

interface InspectorProps {
  project: Project | null;
  onClose: () => void;
  onOpenProject: (project: Project) => void;
}

export function Inspector({ project, onClose, onOpenProject }: InspectorProps) {
  // Escape key closes inspector
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isOpen = !!project;

  return (
    <aside
      className={`inspector ${isOpen ? 'inspector--open' : ''}`}
      aria-label="Clip Inspector"
      aria-hidden={!isOpen}
    >
      {/* Header */}
      <div className="inspector__header">
        <span className="ui-label">CLIP INSPECTOR</span>
        <button
          className="inspector__close"
          onClick={onClose}
          aria-label="Close inspector"
          title="Close (Esc)"
        >
          ✕
        </button>
      </div>

      {project && (
        <>
          {/* Track badge */}
          <div className="inspector__track-badge">
            <span className="inspector__track-id">{project.track}</span>
            <span className="inspector__track-cat">{project.category}</span>
          </div>

          {/* Title block */}
          <div className="inspector__title-block">
            <div className="inspector__title">{project.title}</div>
            <div className="inspector__client">{project.client}</div>
          </div>

          <div className="inspector__divider" />

          {/* Metadata rows */}
          <div className="inspector__rows">
            <MetaRow label="YEAR"       value={String(project.year)} />
            <MetaRow label="DURATION"   value={`${project.clipDuration}s`} />
            {project.turnaround && (
              <MetaRow label="TURNAROUND" value={project.turnaround} />
            )}
            <MetaRow
              label="STATUS"
              value={project.status.toUpperCase()}
              valueColor={
                project.status === 'online' ? 'var(--accent-green)' :
                project.status === 'offline' ? 'var(--accent-red)' :
                'var(--accent-amber)'
              }
            />
            {project.featured && (
              <MetaRow label="FEATURED" value="★ YES" valueColor="var(--accent-amber)" />
            )}
          </div>

          <div className="inspector__divider" />

          {/* Software stack */}
          {project.software && project.software.length > 0 && (
            <div className="inspector__section">
              <span className="ui-label inspector__section-title">SOFTWARE</span>
              <div className="inspector__tags">
                {project.software.map(s => (
                  <span key={s} className="inspector__tag inspector__tag--software">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="inspector__section">
              <span className="ui-label inspector__section-title">TAGS</span>
              <div className="inspector__tags">
                {project.tags.map(t => (
                  <span key={t} className="inspector__tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {project.deliverables && project.deliverables.length > 0 && (
            <div className="inspector__section">
              <span className="ui-label inspector__section-title">DELIVERABLES</span>
              <ul className="inspector__list">
                {project.deliverables.map(d => (
                  <li key={d} className="inspector__list-item">
                    <span className="inspector__bullet">›</span>{d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="inspector__divider" />

          {/* Description */}
          {project.description && (
            <div className="inspector__section">
              <p className="inspector__desc">{project.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="inspector__actions">
            <button
              className="inspector__btn inspector__btn--primary"
              onClick={() => onOpenProject(project)}
            >
              ↗ Open Project
            </button>
            <button
              className="inspector__btn inspector__btn--secondary"
              onClick={onClose}
            >
              ✕ Close
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

// ── MetaRow sub-component ─────────────────────────────────
function MetaRow({
  label, value, valueColor,
}: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="meta-row">
      <span className="meta-row__label ui-label">{label}</span>
      <span className="meta-row__value" style={{ color: valueColor }}>{value}</span>
    </div>
  );
}