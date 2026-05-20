// ============================================================
// FILE: src/components/work/StoryboardView.tsx
//
// PURPOSE:
//   View Mode 3 — "Storyboard View". Renders projects as large
//   filmstrip rows — each project gets a horizontal strip with
//   a big thumbnail on the left, and a row of scene frames on
//   the right (simulating a contact sheet or storyboard layout).
//
//   Good for directors or clients who prefer visual narrative
//   browsing over a timeline or grid.
//
// INTEGRATES WITH:
//   src/sections/WorkSection.tsx   — rendered when viewMode === 'storyboard'
//   src/components/work/StoryboardView.css
//   src/types/index.ts             — Project, Scene types
// ============================================================

import type { Project } from '../styles/types';
import './StoryboardView.css';

const CATEGORY_COLORS: Record<string, string> = {
  longform:   '#4A7FD4',
  shortform:  '#E87030',
  motion:     '#9B6FE8',
  commercial: '#40C880',
  cinematic:  '#E8A020',
  social:     '#E87030',
};

// Simulated frame count per project for storyboard strips
const FRAME_COUNTS: Record<string, number> = {
  longform: 8, shortform: 5, motion: 6, commercial: 5, cinematic: 7, social: 4,
};

interface StoryboardViewProps {
  projects: Project[];
  activeId?: string | null;
  onSelect: (project: Project) => void;
}

export function StoryboardView({ projects, activeId, onSelect }: StoryboardViewProps) {
  // Group by category for section headers
  const grouped = projects.reduce<Record<string, Project[]>>((acc, p) => {
    acc[p.category] = [...(acc[p.category] ?? []), p];
    return acc;
  }, {});

  if (projects.length === 0) {
    return (
      <div className="sb-empty">
        <span>⊘</span>
        <span>No projects match filter</span>
      </div>
    );
  }

  return (
    <div className="sb-view">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="sb-section">
          {/* Section header — like a bin label */}
          <div
            className="sb-section__header"
            style={{ '--sec-color': CATEGORY_COLORS[cat] ?? '#fff' } as React.CSSProperties}
          >
            <div className="sb-section__line" />
            <span className="sb-section__label">
              {cat.toUpperCase()}
            </span>
            <span className="sb-section__count">{items.length}</span>
            <div className="sb-section__line" />
          </div>

          {/* Storyboard rows */}
          {items.map(p => (
            <StoryboardRow
              key={p.id}
              project={p}
              isActive={activeId === p.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Individual storyboard row ──────────────────────────────
function StoryboardRow({
  project, isActive, onSelect,
}: { project: Project; isActive: boolean; onSelect: (p: Project) => void }) {
  const color       = CATEGORY_COLORS[project.category] ?? '#fff';
  const frameCount  = FRAME_COUNTS[project.category] ?? 6;
  const frames      = Array.from({ length: frameCount });

  return (
    <div
      className={`sb-row ${isActive ? 'sb-row--active' : ''}`}
      style={{ '--row-color': color } as React.CSSProperties}
      onClick={() => onSelect(project)}
      role="button"
      tabIndex={0}
      aria-label={`${project.title} — ${project.client}`}
      onKeyDown={e => e.key === 'Enter' && onSelect(project)}
    >
      {/* ── Left: main frame ── */}
      <div className="sb-row__main">
        <div
          className="sb-row__main-thumb"
          style={{
            background: `linear-gradient(135deg, ${color}20 0%, var(--bg-monitor) 70%)`
          }}
        >
          {/* Clip number */}
          <div className="sb-row__frame-num">01</div>

          {/* Featured badge */}
          {project.featured && (
            <div className="sb-row__featured">★ FEATURED</div>
          )}
        </div>

        {/* Main frame info */}
        <div className="sb-row__main-info">
          <div className="sb-row__title">{project.title}</div>
          <div className="sb-row__client">{project.client} · {project.year}</div>
          <div className="sb-row__dur">{project.clipDuration}s</div>
        </div>
      </div>

      {/* ── Right: filmstrip frames ── */}
      <div className="sb-row__strip">
        {frames.map((_, i) => (
          <div
            key={i}
            className="sb-frame"
            style={{
              background: `linear-gradient(
                ${135 + i * 15}deg,
                ${color}${(10 + i * 4).toString(16).padStart(2,'0')} 0%,
                var(--bg-monitor) 80%
              )`
            }}
          >
            {/* Frame number */}
            <span className="sb-frame__num">
              {String(Math.floor((i / frameCount) * project.clipDuration)).padStart(2, '0')}s
            </span>
          </div>
        ))}

        {/* "Open sequence" CTA on last frame */}
        <div className="sb-frame sb-frame--cta" onClick={(e) => { e.stopPropagation(); onSelect(project); }}>
          <span className="sb-frame__cta-icon">↗</span>
          <span className="sb-frame__cta-label">OPEN</span>
        </div>
      </div>

      {/* ── Meta strip ── */}
      <div className="sb-row__meta">
        {project.software.map(s => (
          <span key={s} className="sb-row__sw">{s}</span>
        ))}
        {project.tags.slice(0, 3).map(t => (
          <span key={t} className="sb-row__tag">{t}</span>
        ))}
      </div>
    </div>
  );
}