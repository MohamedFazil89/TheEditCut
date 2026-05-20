// ============================================================
// FILE: src/hooks/useProjectFilter.ts
//
// PURPOSE:
//   Handles category filtering, search, and sort for the Work section.
//   Returns a filtered + sorted subset of projects.
//
// USAGE in WorkSection.tsx:
//   const { filtered, activeCategory, setCategory, searchQuery, setSearch } =
//     useProjectFilter(SAMPLE_PROJECTS);
//
// INTEGRATES WITH:
//   src/sections/WorkSection.tsx
//   src/components/work/FilterBar.tsx
//   src/data/projects.ts
// ============================================================

import { useState, useMemo } from 'react';
import type { Project, ProjectCategory } from '../styles/types';

type FilterCategory = ProjectCategory | 'all';
type SortKey = 'year' | 'title' | 'client' | 'duration';

export function useProjectFilter(projects: Project[]) {
  const [activeCategory, setCategory] = useState<FilterCategory>('all');
  const [searchQuery,    setSearch]   = useState('');
  const [sortKey,        setSortKey]  = useState<SortKey>('year');
  const [featuredOnly,   setFeaturedOnly] = useState(false);

  const filtered = useMemo(() => {
    let result = [...projects];

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Featured filter
    if (featuredOnly) {
      result = result.filter(p => p.featured);
    }

    // Search filter (title, client, tags, software)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q)    ||
        p.client.toLowerCase().includes(q)   ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.software.some(s => s.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortKey) {
        case 'year':     return b.year - a.year;
        case 'title':    return a.title.localeCompare(b.title);
        case 'client':   return a.client.localeCompare(b.client);
        case 'duration': return b.clipDuration - a.clipDuration;
        default:         return 0;
      }
    });

    return result;
  }, [projects, activeCategory, searchQuery, sortKey, featuredOnly]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: projects.length };
    projects.forEach(p => {
      map[p.category] = (map[p.category] ?? 0) + 1;
    });
    return map;
  }, [projects]);

  return {
    filtered,
    counts,
    activeCategory, setCategory,
    searchQuery,    setSearch,
    sortKey,        setSortKey,
    featuredOnly,   setFeaturedOnly,
  };
}