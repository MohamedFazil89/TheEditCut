// ============================================================
// FILE: src/components/work/SequenceView.tsx
//
// PURPOSE:
//   View Mode 1 — "Sequence View". Reuses the Timeline component
//   inside the Work section for a dedicated project exploration
//   experience. Differences from HomeSection:
//
//   - Larger clip blocks (more height per track)
//   - No sticky monitor on top — uses a compact "now-playing" strip
//   - Filtered tracks based on activeCategory (hides empty tracks)
//   - Clicking a clip expands it inline (not just inspector)
//
// INTEGRATES WITH:
//   src/sections/WorkSection.tsx          — rendered when viewMode === 'sequence'
//   src/components/timeline/Timeline.tsx  — reused timeline component
//   src/hooks/useTimeline.ts
//   src/data/projects.ts
// ============================================================

import { useRef, useCallback, useState } from 'react';
import { Timeline }    from '../timeline/Timeline';
import { useTimeline } from '../../hooks/useTimeline';
import { useScrollScrub } from '../../hooks/useScrollScrub';
import { buildTracks } from '../../data/projects';
import type { Project, TimelineMarker } from '../styles/types';
import './SequenceView.css';

interface SequenceViewProps {
  projects: Project[];
  markers: TimelineMarker[];
  duration: number;
  activeId?: string | null;
  onSelect: (project: Project) => void;
}

export function SequenceView({
  projects, markers, duration, activeId, onSelect,
}: SequenceViewProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const [hoveredClip, setHoveredClip] = useState<Project | null>(null);

  const tracks = buildTracks(projects);

  const {
    state, pxPerSec, seekTo, seekByPx, nudge,
    togglePlay, setZoom, timelineRef, formatTimecode,
  } = useTimeline({ duration, markers, projects });

  // Scroll = scrub
  useScrollScrub({
    containerRef,
    duration,
    onScrub: useCallback(
      (delta: number) => seekTo(state.currentTime + delta),
      [seekTo, state.currentTime]
    ),
  });

  const handleClipClick = useCallback((project: Project) => {
    onSelect(project);
    seekTo(project.clipStart + 1);
  }, [onSelect, seekTo]);

  return (
    <div className="seq-view" ref={containerRef}>
      {/* Now-playing strip — compact version of the monitor */}
      <div className="seq-now-playing">
        <div className="seq-np__left">
          <div className="seq-np__tc timecode">{formatTimecode(state.currentTime)}</div>
          <div className="seq-np__transport">
            <button className="seq-np__btn" onClick={() => nudge(-1)} title="J">◀</button>
            <button
              className={`seq-np__btn seq-np__btn--play ${state.isPlaying ? 'playing' : ''}`}
              onClick={togglePlay}
              title="Space"
            >
              {state.isPlaying ? '⏸' : '▶'}
            </button>
            <button className="seq-np__btn" onClick={() => nudge(1)} title="L">▶</button>
          </div>
        </div>

        {/* Hovered / active clip info */}
        <div className="seq-np__center">
          {(hoveredClip ?? state.activeClip) ? (
            <>
              <span className="seq-np__title">
                {(hoveredClip ?? state.activeClip)!.title}
              </span>
              <span className="seq-np__sep">·</span>
              <span className="seq-np__client">
                {(hoveredClip ?? state.activeClip)!.client}
              </span>
            </>
          ) : (
            <span className="seq-np__idle">Hover clips to preview · Click to open</span>
          )}
        </div>

        <div className="seq-np__right">
          <button className="seq-np__btn" onClick={() => setZoom(state.zoom - 0.2)} title="Zoom out">−</button>
          <span className="seq-np__zoom ui-label">{Math.round(state.zoom * 100)}%</span>
          <button className="seq-np__btn" onClick={() => setZoom(state.zoom + 0.2)} title="Zoom in">+</button>
        </div>
      </div>

      {/* Main timeline */}
      <div className="seq-view__timeline" ref={timelineRef}>
        <Timeline
          tracks={tracks}
          markers={markers}
          currentTime={state.currentTime}
          duration={duration}
          pxPerSec={pxPerSec}
          activeClip={projects.find(p => p.id === activeId) ?? state.activeClip}
          onSeekByPx={seekByPx}
          onClipClick={handleClipClick}
          onHoverTime={(t) => {
            const clip = projects.find(
              p => t >= p.clipStart && t < p.clipStart + p.clipDuration
            );
            setHoveredClip(clip ?? null);
          }}
          onZoom={setZoom}
        />
      </div>
    </div>
  );
}