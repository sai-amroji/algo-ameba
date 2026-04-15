# AGENTS.md

## Purpose
This file defines how coding agents should work in this repository.

## Project Context
- This is an algorithm visualizer web app.
- Algorithms are visualized step-by-step for learning and debugging.
- GSAP is the primary animation engine used for timeline-based interactions.
- Agents should prioritize clear algorithm process visualization, not just final output states.

## Reference Links (Use When Stuck)
- GSAP Cheatsheet: https://gsap.com/cheatsheet
- GSAP LLM Context: https://gsap.com/llms.txt
- GSAP React Docs: https://gsap.com/resources/React

## Modular Structure Principles
- Keep the project modular so anyone can add, remove, or modify algorithms safely.
- Prefer algorithm registry files (maps/builders) over creating duplicate page components.
- Keep shared UI/control logic in shared components and hooks.
- Keep algorithm-specific logic isolated in dedicated algorithm modules.
- New algorithm additions should require minimal wiring changes.

## Primary Goals
- Keep algorithm visualizers stable and easy to extend.
- Prefer architecture that allows adding algorithms without cloning pages.
- Preserve GSAP timeline controls (play, pause, next, previous, speed).
- Avoid regressions in search and sort interactions.

## Repository Conventions
- Framework: React + TypeScript + Vite.
- Styling: Tailwind utility classes and shared component classes in src/index.css.
- Routing: react-router-dom routes in src/App.tsx.
- Shared visualizer shell: src/components/SharedLayout.tsx.

## Architecture Rules
- Search algorithms must be implemented in src/components/search/searchAlgorithms.ts.
- Sort algorithms must be implemented in src/components/sort/SortAlgos.ts.
- Search view logic belongs in src/components/search/SearchPage.tsx.
- Sort view logic belongs in src/components/sort/SortPage.tsx.
- Do not add separate page components for each algorithm unless explicitly requested.
- Prefer algorithm registries/maps over switch-heavy duplicated UI files.

## GSAP Rules
- Use @gsap/react useGSAP() for React lifecycle-safe animations.
- Use contextSafe for event-driven animation callbacks.
- Store reusable GSAP timeline instances in refs.
- Clear or revert GSAP side effects when starting a new run.
- Avoid direct global selectors when a scoped container ref is available.

## State and Rendering Rules
- Bar keys and ids must stay unique in every frame.
- Frame builders must never create duplicate ids in the same rendered frame.
- Search and sort frame definitions should be deterministic and side-effect free.
- Add explicit visual states for active, found/sorted, and discarded ranges when needed.

## Interaction Rules
- Dropdown algorithm switching should change algorithm mode in-page.
- Avoid full route remount behavior for same feature mode switches.
- Generate Random must always produce visible bars and reset old animation state.
- Show clear feedback for invalid input and not-found results.

## Testing and Validation
After modifying visualizer logic:
1. Run TypeScript/build validation.
2. Verify search:
   - linear: highlights each checked item.
   - binary: shows range reduction and discarded bars.
3. Verify sort:
   - controls react to play/pause/next/previous.
   - speed slider affects timeline speed.
4. Confirm no broken imports or duplicate architecture paths.

## Code Quality Rules
- Keep changes minimal and scoped.
- Do not leave unused builders, dead exports, or placeholder code.
- Prefer descriptive names over abbreviations for algorithm/frame functions.
- Add brief comments only for non-obvious logic.

## Pull Request Checklist
- [ ] No duplicated algorithm pages for same feature.
- [ ] Algorithms are added via registry files.
- [ ] SharedLayout controls still function.
- [ ] GSAP animation lifecycle is safe.
- [ ] Build passes.
