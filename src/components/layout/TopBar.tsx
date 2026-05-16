import { useState, useEffect } from 'react';
import type { Section } from '../../styles/types';
import './TopBar.css';

interface TopBarProps {
  currentSection: Section;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onNavigate: (section: Section) => void;
}

// Real-time timecode clock
function useTimecode() {
  const [timecode, setTimecode] = useState('00:00:00:00');

  useEffect(() => {
    const fps = 24;
    const update = () => {
      const now = new Date();
      const h  = String(now.getHours()).padStart(2, '0');
      const m  = String(now.getMinutes()).padStart(2, '0');
      const s  = String(now.getSeconds()).padStart(2, '0');
      const fr = String(Math.floor((now.getMilliseconds() / 1000) * fps)).padStart(2, '0');
      setTimecode(`${h}:${m}:${s}:${fr}`);
    };
    update();
    const id = setInterval(update, 1000 / fps);
    return () => clearInterval(id);
  }, []);

  return timecode;
}

export function TopBar({ currentSection, soundEnabled, onSoundToggle, onNavigate }: TopBarProps) {
  const timecode = useTimecode();
  const [fps] = useState('24');

  const navItems: { id: Section; label: string; shortcut: string }[] = [
    { id: 'home',    label: 'SEQUENCE',  shortcut: '01' },
    { id: 'work',    label: 'WORK',      shortcut: '02' },
    { id: 'about',   label: 'PROCESS',   shortcut: '03' },
    { id: 'contact', label: 'EXPORT',    shortcut: '04' },
  ];

  return (
    <header className="topbar">
      {/* Left: Logo + file name */}
      <div className="topbar__left">
        <div className="topbar__logo">
          <span className="topbar__logo-bracket">[</span>
          <span className="topbar__logo-text">TCR</span>
          <span className="topbar__logo-bracket">]</span>
        </div>
        <div className="topbar__divider-v" />
        <span className="topbar__filename">
          SHOWREEL_MASTER_v12_FINAL-FINAL.prproj
        </span>
      </div>

      {/* Center: Navigation */}
      <nav className="topbar__nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`topbar__nav-item ${currentSection === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-current={currentSection === item.id ? 'page' : undefined}
          >
            <span className="topbar__nav-num">{item.shortcut}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right: System info */}
      <div className="topbar__right">
        {/* Audio meter */}
        <div className="topbar__meters">
          <AudioMeter active={soundEnabled} />
        </div>

        {/* FPS indicator */}
        <div className="topbar__fps">
          <span className="ui-label">{fps}</span>
          <span className="ui-label" style={{ color: 'var(--text-ghost)' }}>fps</span>
        </div>

        {/* Sound toggle */}
        <button
          className={`topbar__sound-btn ${soundEnabled ? 'on' : 'off'}`}
          onClick={onSoundToggle}
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          title={soundEnabled ? 'Mute (M)' : 'Unmute (M)'}
        >
          {soundEnabled ? '◉' : '○'}
        </button>

        <div className="topbar__divider-v" />

        {/* Live timecode */}
        <div className="topbar__timecode timecode" aria-label="Current timecode">
          {timecode}
        </div>
      </div>
    </header>
  );
}

// ── Mini audio meter component ────────────────────────────
function AudioMeter({ active }: { active: boolean }) {
  const bars = [0.4, 0.7, 0.9, 0.6, 0.8, 0.5, 0.75, 0.45];

  return (
    <div className={`audio-meter ${active ? 'active' : ''}`} aria-hidden="true">
      {bars.map((height, i) => (
        <div
          key={i}
          className="audio-meter__bar"
          style={{
            animationDelay: `${i * 60}ms`,
            '--bar-h': height,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}