# Algo Ameba

Algo Ameba is an interactive algorithm visualizer built with React, TypeScript, Vite, Tailwind CSS, and GSAP.

It focuses on step-by-step motion, not just final results. Search and sort algorithms are animated frame-by-frame so you can see how the algorithm behaves while it runs.

## What It Shows

- Landing page with GSAP-driven intro motion
- Algorithm catalog homepage
- Search visualizers
  - Linear Search
  - Binary Search
- Sort visualizers
  - Bubble Sort
  - Selection Sort
  - Insertion Sort
  - Merge Sort

## Highlights

- In-page algorithm switching without route remounts for the main visualizers
- Shared control shell for insert, generate random, play, pause, next, previous, and speed
- Frame-based search and sort animation pipelines
- Merge sort visualized as a tree-style split and merge flow with clear phase labels
- Centralized route and algorithm metadata instead of duplicated pages

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- GSAP + @gsap/react
- React Router
- Sonner for toasts
- Radix UI components

## Project Structure

- `src/App.tsx` - app routes
- `src/constants/routes.ts` - route definitions
- `src/constants/algosInfo.ts` - algorithm catalog cards
- `src/components/SharedLayout.tsx` - shared visualizer shell
- `src/components/search/` - search visualizer UI and algorithm frames
- `src/components/sort/` - sort visualizer UI and algorithm frames
- `src/hooks/useSearchVizulizer.tsx` - shared search state and controls
- `src/pages/` - landing, homepage, and about pages

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

## Notes for Contributors

- Route values are centralized in `src/constants/routes.ts`.
- Algorithm cards use `src/constants/algosInfo.ts` as the single source of truth.
- Search and sort animations should stay frame-driven so controls remain predictable.
- Merge sort uses larger vertical spacing and labels so the split/merge tree is easier to follow.

## Current Build Status

The main app visualizers are wired up, but the repository still contains an unfinished `src/components/basic/basicAlgos.ts` file that causes TypeScript build errors.
If you want a clean `npm run build`, that file needs to be fixed or removed.
