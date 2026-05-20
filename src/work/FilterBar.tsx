// ============================================================
// FILE: src/components/work/FilterBar.tsx
//
// PURPOSE:
//   Horizontal filter bar below the ViewSwitcher in WorkSection.
//   Contains: category pills, search input, sort selector, featured toggle.
//   Styled like a media browser filter row in Premiere/Resolve.
//
// PROPS:
//   All props come directly from useProjectFilter() hook.
//
// INTEGRATES WITH:
//   src/sections/WorkSection.tsx
//   src/hooks/useProjectFilter.ts
//   src/components/work/FilterBar.css
// ============================================================

import type { ProjectCategory } from '../styles/types';
import './FilterBar.css';

type FilterCategory = ProjectCategory | 'all';

interface FilterBarProps {
  activeCategory: FilterCategory;
  onCategoryChange: (c: FilterCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  featuredOnly: boolean;
  onFeaturedToggle: () => void;
  counts: Record<string, number>;
}

const CATEGORIES: { id: FilterCategory; label: string; color: string }[] = [
  { id: 'all',        label: 'ALL',        color: 'var(--text-secondary)' },
  { id: 'longform',   label: 'LONG-FORM',  color: 'var(--track-longform)' },
  { id: 'shortform',  label: 'SHORT-FORM', color: 'var(--track-shortform)' },
  { id: 'motion',     label: 'MOTION',     color: 'var(--track-motion)' },
  { id: 'commercial', label: 'COMMERCIAL', color: 'var(--track-commercial)' },
  { id: 'cinematic',  label: 'CINEMATIC',  color: 'var(--track-cinematic)' },
  { id: 'social',     label: 'SOCIAL',     color: 'var(--accent-orange)' },
];

export function FilterBar({
  activeCategory, onCategoryChange,
  searchQuery, onSearchChange,
  featuredOnly, onFeaturedToggle,
  counts,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      {/* Category pills */}
      <div className="filter-bar__cats">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`filter-pill ${activeCategory === cat.id ? 'filter-pill--active' : ''}`}
            style={{ '--pill-color': cat.color } as React.CSSProperties}
            onClick={() => onCategoryChange(cat.id)}
          >
            <span className="filter-pill__dot" />
            {cat.label}
            <span className="filter-pill__count">{counts[cat.id] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Right controls */}
      <div className="filter-bar__right">
        {/* Featured toggle */}
        <button
          className={`filter-bar__featured ${featuredOnly ? 'active' : ''}`}
          onClick={onFeaturedToggle}
          title="Show featured only"
        >
          ★ {featuredOnly ? 'FEATURED' : 'ALL'}
        </button>

        {/* Search */}
        <div className="filter-bar__search">
          <span className="filter-bar__search-icon">⌕</span>
          <input
            type="text"
            className="filter-bar__search-input"
            placeholder="Search clips..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            aria-label="Search projects"
          />
          {searchQuery && (
            <button
              className="filter-bar__search-clear"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}