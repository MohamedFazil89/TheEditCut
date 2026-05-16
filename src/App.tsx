import { useState, useEffect } from 'react';
import { BootScreen } from './components/ui/BootScreen';
import { TopBar } from './components/layout/TopBar';
import type { AppState, Section } from './styles/types';
import './styles/global.css';
import './App.css';

const INITIAL_STATE: AppState = {
  currentSection: 'home',
  viewMode: 'sequence',
  activeProject: null,
  bootComplete: false,
  soundEnabled: false,
  reducedMotion: false,
  theme: 'dark',
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setState(s => ({ ...s, reducedMotion: mq.matches }));
    const handler = (e: MediaQueryListEvent) =>
      setState(s => ({ ...s, reducedMotion: e.matches }));
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Keyboard shortcuts — editing software style
  useEffect(() => {
    if (!state.bootComplete) return;

    const handleKey = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key.toLowerCase()) {
        case 'm':
          setState(s => ({ ...s, soundEnabled: !s.soundEnabled }));
          break;
        case '1':
          handleNavigate('home');
          break;
        case '2':
          handleNavigate('work');
          break;
        case '3':
          handleNavigate('about');
          break;
        case '4':
          handleNavigate('contact');
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state.bootComplete]);

  const handleBootComplete = () => {
    setState(s => ({ ...s, bootComplete: true }));
  };

  const handleNavigate = (section: Section) => {
    setState(s => ({ ...s, currentSection: section }));
  };

  const handleSoundToggle = () => {
    setState(s => ({ ...s, soundEnabled: !s.soundEnabled }));
  };

  return (
    <div className="app" data-theme={state.theme}>
      {/* Atmospheric overlays */}
      <div className="app-grain" aria-hidden="true" />
      <div className="app-scanlines" aria-hidden="true" />

      {/* Boot sequence */}
      {!state.bootComplete && (
        <BootScreen onComplete={handleBootComplete} />
      )}

      {/* Main application shell */}
      {state.bootComplete && (
        <div className="app-shell">
          {/* Top chrome bar */}
          <TopBar
            currentSection={state.currentSection}
            soundEnabled={state.soundEnabled}
            onSoundToggle={handleSoundToggle}
            onNavigate={handleNavigate}
          />

          {/* Main workspace */}
          <main className="app-workspace">
            {/* ── Sections rendered here (Phase 2+) ── */}
            {state.currentSection === 'home' && (
              <div className="workspace-placeholder">
                {/* Preview Monitor + Timeline — Phase 2 */}
                <HomePlaceholder />
              </div>
            )}

            {state.currentSection === 'work' && (
              <div className="workspace-placeholder">
                {/* Work Sequence Explorer — Phase 4 */}
                <WorkPlaceholder />
              </div>
            )}

            {state.currentSection === 'about' && (
              <div className="workspace-placeholder">
                <PlaceholderPanel label="PROCESS / ABOUT" color="var(--accent-purple)" />
              </div>
            )}

            {state.currentSection === 'contact' && (
              <div className="workspace-placeholder">
                <PlaceholderPanel label="EXPORT QUEUE / CONTACT" color="var(--accent-red)" />
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

// ── Temporary placeholders until Phase 2 components are built ──

function HomePlaceholder() {
  return (
    <div className="home-placeholder">
      {/* Monitor placeholder */}
      <div className="placeholder-monitor">
        <div className="placeholder-monitor__inner">
          <span className="timecode">SEQUENCE 01 — MASTER TIMELINE</span>
          <div className="placeholder-monitor__label">PREVIEW MONITOR</div>
          <div className="placeholder-monitor__sub">Phase 2 — Coming next</div>
        </div>
        {/* Safe area corners */}
        <div className="safe-area" />
      </div>

      {/* Timeline placeholder */}
      <div className="placeholder-timeline">
        <div className="timeline-ruler">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="ruler-tick">
              <span>{String(i * 5).padStart(2, '0')}s</span>
            </div>
          ))}
        </div>
        <div className="timeline-tracks">
          {['V1 — LONG-FORM', 'V2 — SHORT-FORM', 'V3 — MOTION', 'A1 — AUDIO'].map((label, i) => (
            <div key={label} className="track-row">
              <div className="track-header">
                <span className="ui-label">{label}</span>
              </div>
              <div className="track-body">
                {/* Fake clips for visual */}
                {Array.from({ length: 3 + i }).map((_, j) => (
                  <div
                    key={j}
                    className="fake-clip"
                    style={{
                      width: `${60 + Math.random() * 80}px`,
                      marginLeft: j === 0 ? `${20 + i * 15}px` : '4px',
                      opacity: 0.6 + i * 0.1,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Playhead */}
        <div className="fake-playhead" />
      </div>
    </div>
  );
}

function WorkPlaceholder() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PlaceholderPanel label="WORK / SEQUENCE EXPLORER" color="var(--accent-cyan)" />
    </div>
  );
}

function PlaceholderPanel({ label, color }: { label: string; color: string }) {
  return (
    <div className="placeholder-panel" style={{ '--panel-color': color } as React.CSSProperties}>
      <div className="placeholder-panel__corner tl" />
      <div className="placeholder-panel__corner tr" />
      <div className="placeholder-panel__corner bl" />
      <div className="placeholder-panel__corner br" />
      <span className="ui-label" style={{ color }}>{label}</span>
      <span className="placeholder-panel__sub">In development</span>
    </div>
  );
}