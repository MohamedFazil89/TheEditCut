import { useEffect, useState, useRef } from 'react';
import type { BootPhase } from '../../styles/types';
import './BootScreen.css';

// ── Boot messages — editorial personality ──────────────────
const BOOT_MESSAGES = [
  'Initializing post-production environment...',
  'Loading GPU acceleration...',
  'Mounting project: SHOWREEL_MASTER_v12_FINAL-FINAL.prproj',
  'Building sequence tracks...',
  'Caching preview renders...',
  'Linking media assets...',
  'Syncing audio waveforms...',
  'Sequence ready.',
];

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [phase, setPhase] = useState<BootPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [glitching, setGlitching] = useState(false);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Phase 1: GPU scan lines flash
    const t1 = setTimeout(() => {
      setPhase('gpu-scan');
      setGlitching(true);
    }, 200);

    // Phase 2: Start loading messages
    const t2 = setTimeout(() => {
      setGlitching(false);
      setPhase('loading-project');
    }, 800);

    // Phase 3: Progress bar + messages
    const t3 = setTimeout(() => {
      setPhase('building-tracks');

      let msg = 0;
      let prog = 0;

      const msgInterval = setInterval(() => {
        msg++;
        setMessageIndex(Math.min(msg, BOOT_MESSAGES.length - 1));
        if (msg >= BOOT_MESSAGES.length - 1) clearInterval(msgInterval);
      }, 220);

      progressRef.current = setInterval(() => {
        prog += Math.random() * 4 + 1;
        if (prog >= 100) {
          prog = 100;
          if (progressRef.current) clearInterval(progressRef.current);
        }
        setProgress(Math.min(prog, 100));
      }, 60);

      return () => clearInterval(msgInterval);
    }, 1000);

    // Phase 4: Ready state, then exit
    const t4 = setTimeout(() => {
      setPhase('ready');
      setProgress(100);
    }, 2600);

    const t5 = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 600);
    }, 3100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className={`boot-screen ${phase} ${!visible ? 'exiting' : ''}`}>
      {/* Scan line flash on GPU init */}
      {glitching && <div className="boot-glitch" />}

      {/* Center content */}
      <div className="boot-content">
        {/* Logo mark */}
        <div className="boot-logo">
          <span className="boot-logo__bracket">[</span>
          <span className="boot-logo__text">THE CUT ROOM</span>
          <span className="boot-logo__bracket">]</span>
        </div>

        {/* Project file name */}
        <div className="boot-filename">
          <span className="boot-filename__label">OPENING PROJECT</span>
          <span className="boot-filename__name blink">
            SHOWREEL_MASTER_v12_FINAL-FINAL.prproj
          </span>
        </div>

        {/* Progress bar */}
        <div className="boot-progress">
          <div
            className="boot-progress__fill"
            style={{ width: `${progress}%` }}
          />
          <span className="boot-progress__pct timecode">
            {Math.round(progress).toString().padStart(3, '0')}%
          </span>
        </div>

        {/* Status messages */}
        <div className="boot-messages">
          {BOOT_MESSAGES.slice(0, messageIndex + 1).map((msg, i) => (
            <div
              key={i}
              className={`boot-message ${i === messageIndex ? 'active' : 'done'}`}
            >
              <span className="boot-message__tick">
                {i < messageIndex ? '✓' : '›'}
              </span>
              {msg}
            </div>
          ))}
        </div>

        {/* Spec readout */}
        <div className="boot-specs">
          <span>1920×1080</span>
          <span className="divider">·</span>
          <span>24fps</span>
          <span className="divider">·</span>
          <span>48kHz</span>
          <span className="divider">·</span>
          <span>ProRes 422</span>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="boot-corner boot-corner--tl" />
      <div className="boot-corner boot-corner--tr" />
      <div className="boot-corner boot-corner--bl" />
      <div className="boot-corner boot-corner--br" />

      {/* Version stamp */}
      <div className="boot-version">v1.0.0 — POST PRODUCTION PORTFOLIO</div>
    </div>
  );
}