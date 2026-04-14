# Algo Ameba

Algo Ameba is an interactive algorithm visualizer built with React, TypeScript, Vite, Tailwind CSS, and GSAP.

## Current Features

- Landing page with intro animation and quick navigation
- Algorithm catalog homepage
- Search visualizers:
  - Linear Search
  - Binary Search
- Sort visualizers:
  - Bubble Sort
  - Selection Sort
  - Insertion Sort

## Architecture Overview

- App routing and route constants:
  - `src/App.tsx`
  - `src/constants/routes.ts`
- Algorithm catalog metadata:
  - `src/constants/algosInfo.ts`
- Shared visualizer layout shell:
  - `src/components/visualizer/SharedLayout.tsx`
- Search-specific state and controls:
  - `src/hooks/useSearchVizulizer.tsx`
- Page entry points:
  - `src/pages/LandingPage.tsx`
  - `src/pages/Homepage.tsx`
  - `src/pages/AboutPage.tsx`

## Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Lint project:

```bash
npm run lint
```

Build production bundle:

```bash
npm run build
```

## Notes

- Route values are centralized in `src/constants/routes.ts`.
- Algorithm cards use `src/constants/algosInfo.ts` as the single source of truth.
- Some lint warnings remain around React Fast Refresh export style and hook cleanup refs; there are currently no lint errors.
