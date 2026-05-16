// ============================================================
// THE CUT ROOM — Core TypeScript Types
// ============================================================

// ── Project / Clip Types ──────────────────────────────────

export type TrackLane = 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'A1' | 'A2';

export type ProjectCategory =
  | 'longform'
  | 'shortform'
  | 'motion'
  | 'commercial'
  | 'cinematic'
  | 'youtube'
  | 'social';

export type ProjectStatus = 'online' | 'offline' | 'teaser' | 'locked';

export interface ScrubFrame {
  timestamp: number;   // seconds
  src: string;         // image URL
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  client: string;
  category: ProjectCategory;
  track: TrackLane;

  // Display
  thumbnail: string;
  posterSrc: string;
  teaserSrc?: string;        // Short muted MP4 loop
  scrubFrames?: ScrubFrame[]; // Hover-scrub sprite frames

  // Timeline placement
  clipStart: number;         // Position on timeline (seconds)
  clipDuration: number;      // Width of clip block
  trackIndex: number;        // Visual row order

  // Metadata
  year: number;
  description: string;
  tags: string[];
  software: string[];        // Premiere, DaVinci, AE, etc.
  deliverables: string[];
  turnaround?: string;       // "3 weeks"
  featured: boolean;
  status: ProjectStatus;
  markerColor?: string;

  // Content for detail page
  scenes?: Scene[];
  layers?: Layer[];
  outcomes?: string[];
  liveUrl?: string;
  videoUrl?: string;
}

export interface Scene {
  id: string;
  title: string;
  thumbnail: string;
  timecode: string;
  note?: string;
}

export interface Layer {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'motion' | 'grade' | 'text' | 'vfx';
  visible: boolean;
  color: string;
}

// ── Timeline Types ────────────────────────────────────────

export interface TimelineMarker {
  id: string;
  position: number;      // seconds on timeline
  label: string;
  color: string;
  type: 'category' | 'milestone' | 'award' | 'cta';
}

export interface Track {
  id: TrackLane;
  label: string;
  color: string;
  height: number;        // px
  clips: Project[];
  muted?: boolean;
  locked?: boolean;
}

export interface TimelineState {
  currentTime: number;        // Playhead position (seconds)
  duration: number;           // Total sequence duration
  zoom: number;               // px per second
  scrollX: number;            // Horizontal scroll offset
  isPlaying: boolean;
  isScrubbing: boolean;
  activeClip: Project | null;
  inPoint?: number;
  outPoint?: number;
}

// ── Monitor Types ─────────────────────────────────────────

export interface MonitorState {
  mode: 'source' | 'program' | 'comparison';
  activeProject: Project | null;
  isPlaying: boolean;
  volume: number;
  currentFrame: number;
}

// ── Boot Sequence ─────────────────────────────────────────

export type BootPhase =
  | 'idle'
  | 'gpu-scan'
  | 'loading-project'
  | 'building-tracks'
  | 'ready';

export interface BootState {
  phase: BootPhase;
  progress: number;          // 0–100
  messages: string[];
  currentMessage: string;
}

// ── Contact / Export Queue ────────────────────────────────

export type ProjectType =
  | 'short-form'
  | 'long-form'
  | 'motion-graphics'
  | 'commercial'
  | 'social-campaign'
  | 'documentary'
  | 'other';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  projectType: ProjectType;
  timeline: string;
  budget: string;
  deadline?: string;
  referenceLinks?: string;
  message: string;
  submittedAt: Date;
  status: 'queued' | 'read' | 'replied';
}

// ── UI State ──────────────────────────────────────────────

export type ViewMode = 'sequence' | 'bin' | 'storyboard';
export type Section = 'home' | 'work' | 'about' | 'contact' | 'project';
export type ThemeMode = 'dark' | 'darker'; // Always dark; option for deeper black

export interface AppState {
  currentSection: Section;
  viewMode: ViewMode;
  activeProject: Project | null;
  bootComplete: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  theme: ThemeMode;
}

// ── Admin Types ───────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'editor';
}

export interface UploadJob {
  id: string;
  filename: string;
  progress: number;
  status: 'queued' | 'uploading' | 'processing' | 'complete' | 'error';
  projectId?: string;
}