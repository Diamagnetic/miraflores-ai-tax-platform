# Master Decision Log: MiraFlores AI Tax Platform

**Repository**: `miraflores_ai_case_study`  
**Project**: AI-Powered Tax Platform (10 Challenges)  
**Governing Constitution**: `.specify/memory/constitution.md` (v1.0.0)

---

## 1. Technical Stack & Infrastructure (Phase 1)

### Decision 1.1: React 19 + TypeScript 7 + Vite 8.0 Bundler
- **Context**: Greenfield web application requiring instant HMR, fast production builds, and type-safe data modeling for complex IRS tax schedules.
- **Decision**: Standardized on React 19, TypeScript, and Vite.
- **Rationale**:
  - Sub-second build and reload performance for interactive prototyping.
  - Strict type checking ensures zero runtime type errors across complex multi-schedule tax models and coordinate bounding boxes.
- **Alternatives Considered**:
  - *Next.js / Remix SSR*: Rejected due to zero backend requirement and unnecessary server hydration overhead for client-side prototype.

### Decision 1.2: shadcn/ui Preset `buHOvz6` & Tailwind CSS v4.3
- **Context**: Need high-craft, professional financial tooling interface that resists generic UI slop and maintains consistent visual hierarchy.
- **Decision**: Configured shadcn/ui preset `buHOvz6` (Slate palette, border variables, Radix UI accessibility primitives).
- **Rationale**:
  - Accessible, fully customizable unstyled primitives (Radix UI) styled with Tailwind CSS tokens.
  - Avoids bloated UI component libraries with rigid themes.

### Decision 1.3: Viewport Strategy & Container Horizontal Scrolling
- **Context**: Dense financial tables (Form 1040, Schedule C, 150+ document grid) become unreadable and squeeze columns when rendered on smaller viewports or inside side-by-side split screens.
- **Decision**: Enforce minimum readable content widths (`min-w-[850px]`, `min-w-[1100px]`) wrapped in container-level horizontal scrollbars (`overflow-x-auto`) with custom slim scrollbar styles.
- **Rationale**:
  - Guarantees financial numbers, line labels, and status badges never wrap awkwardly or truncate.
  - Isolates horizontal scrolling to the data table container without causing body window overflow.

### Decision 1.4: Pure In-Memory Ephemeral State Architecture
- **Context**: State persistence vs. demo repeatability during case study evaluations.
- **Decision**: Centralized in-memory Zustand store without LocalStorage or SessionStorage persistence.
- **Rationale**:
  - In-app role switching and view navigation happen purely in React memory without page reloads, fully preserving multi-user workflows live during user exploration.
  - Cleanly resets to baseline pristine fixtures on browser refresh, eliminating stale cache bugs and LocalStorage serialization overhead.
