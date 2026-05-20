// ============================================================
// FILE: src/components/work/BinView.tsx
//
// PURPOSE:
//   View Mode 2 — "Bin View". Renders projects as a media-browser
//   card grid, like the Premiere Pro Project panel or DaVinci Media Pool.
//   Each card shows: thumbnail area with hover scrub, project title,
//   client, category badge, duration, and software chips.
//
// PROPS:
//   projects    — filtered Project[] from useProjectFilter
//   onSelect    — called when card is clicked (opens detail/inspector)
//
// HOVER BEHAVIOUR:
//   Hovering a card fires the useHoverScrub hook to animate a scrub
//   bar across the thumbnail. In production the thumbnail src would be
//   a sprite sheet image; here we simulate with a gradient placeholder.
//
// INTEGRATES WITH:
//   src/sections/WorkSection.tsx   — rendered when viewMode === 'bin'
//   src/hooks/useHoverScrub.ts
//   src/components/work/BinView.css
// ============================================================

import type { Project } from '../styles/types';
import { useHoverScrub } from '../../hooks/useHoverScrub';
import './BinView.css';

const CATEGORY_COLORS: Record<string, string> = {
  longform:   'var(--track-longform)',
  shortform:  'var(--track-shortform)',
  motion:     'var(--track-motion)',
  commercial: 'var(--track-commercial)',
  cinematic:  'var(--track-cinematic)',
  social:     'var(--accent-orange)',
  youtube:    'var(--accent-red)',
};

interface BinViewProps {
  projects: Project[];
  activeId?: string | null;
  onSelect: (project: Project) => void;
}

export function BinView({ projects, activeId, onSelect }: BinViewProps) {
  if (projects.length === 0) {
    return (
      <div className="bin-empty">
        <span className="bin-empty__icon">⊘</span>
        <span className="bin-empty__label">No clips match filter</span>
      </div>
    );
  }

  return (
    <div className="bin-view">
      {projects.map(p => (
        <BinCard
          key={p.id}
          project={p}
          isActive={activeId === p.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

// ── Individual bin card ────────────────────────────────────
function BinCard({
  project, isActive, onSelect,
}: { project: Project; isActive: boolean; onSelect: (p: Project) => void }) {
  const { scrubValue, isHovering, bind } = useHoverScrub({ frameCount: 8 });
  const color = CATEGORY_COLORS[project.category] ?? 'var(--accent-cyan)';

  return (
    <div
      className={`bin-card ${isActive ? 'bin-card--active' : ''}`}
      style={{ '--card-color': color } as React.CSSProperties}
      onClick={() => onSelect(project)}
      {...bind}
      role="button"
      tabIndex={0}
      aria-label={`${project.title} by ${project.client}`}
      onKeyDown={e => e.key === 'Enter' && onSelect(project)}
    >
      {/* ── Thumbnail area ── */}
      <div className="bin-card__thumb">
        {/* Placeholder gradient — replace with <img src={project.thumbnail} /> */}
        <div
          className="bin-card__thumb-bg"
          style={{
            background: `linear-gradient(135deg,
              ${color}18 0%,
              var(--bg-monitor) 60%)`
          }}
        />

        {/* Hover scrub bar */}
        {isHovering && (
          <div
            className="bin-card__scrub"
            style={{ width: `${scrubValue * 100}%`, background: color }}
          />
        )}

        {/* Duration badge */}
        <div className="bin-card__dur">{project.clipDuration}s</div>

        {/* Featured star */}
        {project.featured && (
          <div className="bin-card__star">★</div>
        )}

        {/* Category badge (top-left) */}
        <div
          className="bin-card__cat"
          style={{ color, borderColor: color + '55', background: color + '18' }}
        >
          {project.category.toUpperCase()}
        </div>

        {/* Hover overlay — scrub instruction */}
        <div className={`bin-card__overlay ${isHovering ? 'bin-card__overlay--visible' : ''}`}>
          <span className="bin-card__overlay-text">← SCRUB →</span>
        </div>
      </div>

      {/* ── Info area ── */}
      <div className="bin-card__info">
        <div className="bin-card__title">{project.title}</div>
        <div className="bin-card__client">{project.client}</div>

        <div className="bin-card__meta">
          <span className="bin-card__year">{project.year}</span>
          {project.turnaround && (
            <span className="bin-card__ta">{project.turnaround}</span>
          )}
        </div>

        {/* Software chips */}
        <div className="bin-card__chips">
          {project.software.slice(0, 2).map(s => (
            <span key={s} className="bin-card__chip">{s}</span>
          ))}
          {project.software.length > 2 && (
            <span className="bin-card__chip bin-card__chip--more">
              +{project.software.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}