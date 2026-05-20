// ============================================================
// FILE: src/sections/HomeSection.tsx
//
// PURPOSE:
//   The main homepage workspace. This is the "editing suite" view:
//   a sticky Preview Monitor on top, a full Timeline panel on the
//   bottom, and a sliding Inspector panel on the right.
//
//   This component is the central integration point for Phase 2.
//   It wires together every hook and component built so far.
//
// COMPONENT TREE:
//   HomeSection
//     ├── Inspector           (right panel, slides in on clip select)
//     ├── PreviewMonitor      (top panel — sticky program monitor)
//     └── Timeline            (bottom panel — tracks + playhead + clips)
//
// DATA FLOW:
//   1. useTimeline() manages all state (currentTime, activeClip, play, etc.)
//   2. useScrollScrub() converts wheel events → seekTo() calls
//   3. Timeline renders tracks from SAMPLE_PROJECTS + SAMPLE_MARKERS
//   4. Clicking a clip calls setInspectorProject() → Inspector opens
//   5. PreviewMonitor reacts to activeClip + currentTime from useTimeline
//
// HOW TO MOUNT:
//   In App.tsx, replace <HomePlaceholder /> with:
//     import { HomeSection } from './sections/HomeSection';
//     {state.currentSection === 'home' && <HomeSection />}
//
// KEYBOARD SHORTCUTS handled here (delegated to useTimeline/useKeyboard):
//   Space / K  — play / pause
//   J          — nudge back 2s
//   L          — nudge forward 2s
//   S          — safe-area guides (handled inside PreviewMonitor)
//   C          — comparison mode (handled inside PreviewMonitor)
//   Esc        — close inspector
//   +/-        — zoom in/out
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { PreviewMonitor } from '../components/monitor/PreviewMonitor';
import { Timeline }       from '../components/timeline/Timeline';
import { Inspector }      from '../components/ui/Inspector';
import { useTimeline }    from '../hooks/useTimeline';
import { useScrollScrub } from '../hooks/useScrollScrub';
import {
  SAMPLE_PROJECTS,
  SAMPLE_MARKERS,
  buildTracks,
} from '../data/projects';
import type { Project }   from '../styles/types';
import './HomeSection.css';

const SEQUENCE_DURATION = 260; // seconds — total timeline length

// Build track definitions once (memoised outside component)
const TRACKS = buildTracks(SAMPLE_PROJECTS);

export function HomeSection() {
  // ── Inspector state ─────────────────────────────────────
  const [inspectorProject, setInspectorProject] = useState<Project | null>(null);

  // ── Workspace ref — scroll scrub attaches here ──────────
  const workspaceRef = useRef<HTMLDivElement>(null);

  // ── Timeline hook — the single source of truth ──────────
  const {
    state,
    pxPerSec,
    seekTo,
    seekByPx,
    nudge,
    togglePlay,
    setZoom,
    containerRef,
    timelineRef,
    formatTimecode,
  } = useTimeline({
    duration: SEQUENCE_DURATION,
    markers:  SAMPLE_MARKERS,
    projects: SAMPLE_PROJECTS,
    onClipEnter: (clip) => {
      // Auto-update inspector when playhead enters a clip
      // (only if inspector is already open)
      setInspectorProject(prev => prev ? clip : prev);
    },
    onClipLeave: () => {
      // Don't auto-close — let user close manually
    },
  });

  // ── Scroll = Scrub ──────────────────────────────────────
  useScrollScrub({
    containerRef: workspaceRef,
    duration: SEQUENCE_DURATION,
    onScrub: useCallback(
      (delta: number) => seekTo(state.currentTime + delta),
      [seekTo, state.currentTime]
    ),
    sensitivity: 0.05,
  });

  // ── Keyboard shortcuts ───────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      switch (e.key.toLowerCase()) {
        case ' ':    e.preventDefault(); togglePlay(); break;
        case 'k':    togglePlay();    break;
        case 'j':    nudge(-1);       break;
        case 'l':    nudge(1);        break;
        case '+':
        case '=':    setZoom(state.zoom + 0.2); break;
        case '-':    setZoom(state.zoom - 0.2); break;
        // I/O — set in/out points (Easter egg / future feature)
        case 'i':    console.log('[TCR] In point set at', formatTimecode(state.currentTime)); break;
        case 'o':    console.log('[TCR] Out point set at', formatTimecode(state.currentTime)); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, nudge, setZoom, state.zoom, state.currentTime, formatTimecode]);

  // ── Clip click handler ───────────────────────────────────
  const handleClipClick = useCallback((project: Project) => {
    setInspectorProject(project);
    // Seek playhead to the start of the clicked clip
    seekTo(project.clipStart + 1);
  }, [seekTo]);

  // ── Hover time — drives monitor preview frame ────────────
  const handleHoverTime = useCallback((time: number) => {
    // In Phase 3 we'll update a separate "hover preview" state.
    // For now, just log — keeps the interface clean.
    // seekTo(time); // ← uncomment to enable live scrub-to-hover
  }, []);

  // ── Seek by px (ruler / track body clicks) ───────────────
  const handleSeekByPx = useCallback((px: number) => {
    seekByPx(px);
  }, [seekByPx]);

  return (
    <div className="home-section" ref={workspaceRef}>
      {/* Right inspector panel */}
      <Inspector
        project={inspectorProject}
        onClose={() => setInspectorProject(null)}
        onOpenProject={(p) => {
          // Phase 5: navigate to project detail page
          console.log('[TCR] Open project:', p.slug);
        }}
      />

      {/* Monitor + Timeline stacked vertically */}
      <div
        className={`home-section__main ${inspectorProject ? 'home-section__main--shifted' : ''}`}
        ref={containerRef}
      >
        {/* Program monitor — top, flexible height */}
        <PreviewMonitor
          activeProject={state.activeClip}
          currentTime={state.currentTime}
          isPlaying={state.isPlaying}
          formatTimecode={formatTimecode}
          onTogglePlay={togglePlay}
          onNudge={nudge}
        />

        {/* Timeline — bottom, fixed height via CSS var */}
        <div ref={timelineRef} className="home-section__timeline-wrap">
          <Timeline
            tracks={TRACKS}
            markers={SAMPLE_MARKERS}
            currentTime={state.currentTime}
            duration={SEQUENCE_DURATION}
            pxPerSec={pxPerSec}
            activeClip={state.activeClip}
            onSeekByPx={handleSeekByPx}
            onClipClick={handleClipClick}
            onHoverTime={handleHoverTime}
            onZoom={setZoom}
          />
        </div>
      </div>

      {/* Scrub indicator (shows when scroll-scrubbing) */}
      <ScrubIndicator
        isScrubbing={state.isScrubbing}
        currentTime={state.currentTime}
        formatTimecode={formatTimecode}
      />
    </div>
  );
}

// ── Scrub indicator — flashes timecode while scrolling ────
function ScrubIndicator({
  isScrubbing, currentTime, formatTimecode,
}: {
  isScrubbing: boolean;
  currentTime: number;
  formatTimecode: (t: number) => string;
}) {
  if (!isScrubbing) return null;
  return (
    <div className="scrub-indicator">
      <span className="scrub-indicator__label ui-label">SCRUBBING</span>
      <span className="scrub-indicator__tc timecode">
        {formatTimecode(currentTime)}
      </span>
    </div>
  );
}