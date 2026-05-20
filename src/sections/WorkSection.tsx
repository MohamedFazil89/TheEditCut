// ============================================================
// FILE: src/sections/WorkSection.tsx
//
// PURPOSE:
//   The complete Work / Portfolio section. Orchestrates:
//     1. ViewSwitcher  — toggle between 3 view modes
//     2. FilterBar     — category pills, search, featured toggle
//     3. SequenceView  — (Mode 1) multi-track timeline
//     4. BinView       — (Mode 2) media browser grid
//     5. StoryboardView— (Mode 3) filmstrip rows
//     6. Inspector     — slides in from right on project select
//
// HOW TO MOUNT in App.tsx:
//   {state.currentSection === 'work' && (
//     <WorkSection onOpenProject={(p) => navigate to detail} />
//   )}
//
// DATA FLOW:
//   SAMPLE_PROJECTS → useProjectFilter → filtered list
//   filtered list   → active view component (Sequence | Bin | Storyboard)
//   clip click      → setSelectedProject → Inspector opens
//   "Open Project"  → onOpenProject prop → Phase 5 (detail page)
//
// INTEGRATES WITH:
//   src/hooks/useViewMode.ts
//   src/hooks/useProjectFilter.ts
//   src/components/work/ViewSwitcher.tsx
//   src/components/work/FilterBar.tsx
//   src/components/work/SequenceView.tsx
//   src/components/work/BinView.tsx
//   src/components/work/StoryboardView.tsx
//   src/components/ui/Inspector.tsx
//   src/data/projects.ts
// ============================================================

import { useState, useCallback } from 'react';
import { ViewSwitcher }    from '../components/work/ViewSwitcher';
import { FilterBar }       from '../components/work/FilterBar';
import { SequenceView }    from '../components/work/SequenceView';
import { BinView }         from '../components/work/BinView';
import { StoryboardView }  from '../components/work/StoryboardView';
import { Inspector }       from '../components/ui/Inspector';
import { useViewMode }     from '../hooks/useViewMode';
import { useProjectFilter }from '../hooks/useProjectFilter';
import {
  SAMPLE_PROJECTS,
  SAMPLE_MARKERS,
  TIMELINE_DURATION,
} from '../data/projects';
import type { Project }    from '../types';
import './WorkSection.css';

interface WorkSectionProps {
  onOpenProject?: (project: Project) => void;
}

export function WorkSection({ onOpenProject }: WorkSectionProps) {
  const { viewMode, setViewMode }    = useViewMode('bin'); // Default to bin for discoverability
  const [selectedProject, setSelected] = useState<Project | null>(null);

  const {
    filtered, counts,
    activeCategory, setCategory,
    searchQuery,    setSearch,
    featuredOnly,   setFeaturedOnly,
  } = useProjectFilter(SAMPLE_PROJECTS);

  const handleSelect = useCallback((project: Project) => {
    setSelected(project);
  }, []);

  const handleOpenProject = useCallback((project: Project) => {
    onOpenProject?.(project);
    // Phase 5: navigate to /work/[slug] detail page
    console.log('[TCR] Open project detail:', project.slug);
  }, [onOpenProject]);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  const isInspectorOpen = !!selectedProject;

  return (
    <div className="work-section">
      {/* Right inspector — shared across all view modes */}
      <Inspector
        project={selectedProject}
        onClose={handleClose}
        onOpenProject={handleOpenProject}
      />

      {/* Main content area — shifts left when inspector opens */}
      <div className={`work-section__main ${isInspectorOpen ? 'work-section__main--shifted' : ''}`}>
        {/* Top: view mode switcher */}
        <ViewSwitcher
          current={viewMode}
          onChange={setViewMode}
          projectCount={filtered.length}
        />

        {/* Filter bar */}
        <FilterBar
          activeCategory={activeCategory}
          onCategoryChange={setCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearch}
          featuredOnly={featuredOnly}
          onFeaturedToggle={() => setFeaturedOnly(!featuredOnly)}
          counts={counts}
        />

        {/* View content */}
        <div className="work-section__content">
          {viewMode === 'sequence' && (
            <SequenceView
              projects={filtered}
              markers={SAMPLE_MARKERS}
              duration={TIMELINE_DURATION}
              activeId={selectedProject?.id}
              onSelect={handleSelect}
            />
          )}

          {viewMode === 'bin' && (
            <BinView
              projects={filtered}
              activeId={selectedProject?.id}
              onSelect={handleSelect}
            />
          )}

          {viewMode === 'storyboard' && (
            <StoryboardView
              projects={filtered}
              activeId={selectedProject?.id}
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
}