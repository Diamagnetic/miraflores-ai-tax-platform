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

### Decision 1.2: shadcn/ui Preset `buHOvz6` & Sharp-Corner Design Contract
- **Context**: Need high-craft, professional financial tooling interface that resists generic UI slop and maintains consistent visual hierarchy.
- **Decision**: Configured shadcn/ui preset `buHOvz6` with `--radius: 0rem` (strict sharp corners, Slate palette, border variables, Radix UI accessibility primitives).
- **Rationale**:
  - Crisp, sharp zero-radius geometry conveys architectural precision and density suitable for professional financial ledgers.
  - Standardizes all interactive primitives (buttons, cards, badges, tabs, tooltips, progress bars) on sharp corners and theme-default primary color tokens.
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

---

## 2. Foundational Data Modeling & State Management (Phase 2)

### Decision 2.1: Unified Multi-Entity Avengers Dataset Model
- **Context**: The platform needs realistic, diverse tax scenarios covering individuals, high-net-worth investors, S-Corporations, and partnerships with high document volume.
- **Decision**: Created 8 interconnected returns:
  - Tony Stark (Form 1040 / Schedule C / Schedule D / 1099-DIV / 1099-B)
  - Stark Industries Inc. (Form 1120-S)
  - Peter Parker (Form 1040 W-2 + Freelance 1099-NEC)
  - Natasha Romanoff (Form 1040 Foreign Earned Income Form 2555)
  - Wakanda Tech & Design LLC (Form 1065 + 150+ receipt ledger items)
  - Dr. Bruce Banner (Form 1040 Personal Return Mode)
  - Pym Quantum Solutions Inc. (Form 1120-S R&D credit)
  - Avengers Compound LLC (Form 1065 multi-partner facility)
- **Rationale**: Provides immediate, tangible testing ground for all 10 product challenges with deterministic numbers and coordinates.

### Decision 2.2: Dual-Role Mode Switching (Preparer, Reviewer, Client, Personal Return)
- **Context**: CPAs also file their own personal tax returns as employees of the firm, creating a distinct user experience need.
- **Decision**: Implemented 4 switcher options in `Header.tsx`:
  1. `tax_preparer` (Sam Wilson CPA - firm workspace)
  2. `tax_reviewer` (Steve Rogers Senior Tax Director - firm workspace)
  3. `individual_client` (Tony Stark - external taxpayer portal)
  4. `personal_return` (Dr. Bruce Banner - firm employee personal return portal)
- **Rationale**: Demonstrates clear role-gated UI boundaries and prevents confidential internal firm notes from leaking into client views while allowing staff to file their personal returns.

### Decision 2.3: Deterministic Triage Scoring Algorithm
- **Context**: Preparers and Reviewers need automated work queue prioritization without manual sorting.
- **Decision**: Implemented formula in `src/store/triageLogic.ts`:
  `TriageScore = Base(50) + DeadlineWeight(0-30) + BlockerPenalty(15) + StatusWeight(4-20) + IssueWeight(0-15) + VolumeWeight(8)`.
- **Rationale**: Produces intuitive Critical, High, Medium, and Low urgency badges that dynamically recalculate upon status changes or blocker toggles.

### Decision 2.4: 5-Tier Return Field Affordance Hierarchy
- **Context**: Users must instantly distinguish between AI extractions, CPA verifications, manual edits, and calculated totals.
- **Decision**: Implemented 5 distinct affordance states (`ai_extracted`, `verified`, `user_edited`, `calculated_locked`, `requires_approval`).
- **Rationale**: Prevents accidental editing of IRS formula lines while giving immediate visual confidence on source verification status.


---

## 3. Source Document Traceability, AI Defensibility & Review Workbench (Phase 3 - US1 MVP)

### Decision 3.1: Coordinate-Based Vector Document Viewer with Interactive Bounding Boxes
- **Context**: Challenge 01 requires connecting any number on the return back to its source document, page, and exact coordinates.
- **Decision**: Implemented an SVG/Vector-based authentic tax document renderer (`DocumentViewer.tsx`) with coordinate-based bounding box overlays (`{ x, y, width, height }`).
- **Rationale**:
  - Delivers zero-latency click-throughs from Form 1040 fields directly into source W-2s, 1099-NECs, and receipts without external PDF rendering delays or CORS quirks.
  - Bi-directional interactivity: clicking a return field highlights the document bounding box with high contrast; clicking a document box selects the return line in the global store.

### Decision 3.2: 5-State Affordance Token System with Fixed Non-Collapsing Widths
- **Context**: Challenge 08 requires clear visual distinction between AI-extracted, verified, manual, locked, and approval-pending values without layout jank.
- **Decision**: Built `AffordanceCell.tsx` enforcing strict minimum widths (`min-w-[150px]`) and semantic color tokens:
  1. `ai_extracted`: Purple badge + Sparkles icon + confidence score pill (`98%`).
  2. `verified`: Emerald badge + ShieldCheck icon + LOCKED audit state.
  3. `user_edited`: Sky blue badge + Edit3 icon + author attribution on hover.
  4. `calculated_locked`: Slate neutral badge + Lock icon + formula tooltip.
  5. `requires_approval`: Rose/Amber badge + AlertTriangle warning pulse.
- **Rationale**: Solves the "clickable vs. editable" ambiguity across all data tables and prevents cell text truncation.

### Decision 3.3: 4-Pillar AI Explainability Framework with Inline Correction
- **Context**: Challenge 10 requires explainable, trustworthy AI with friction-free correction workflows.
- **Decision**: Implemented `AIExplainabilityCard.tsx` covering the 4 core pillars:
  1. *What AI Extracted*: Natural language summary of the extraction and multi-document summation.
  2. *Evidence & Provenance*: Document name, page number, box label, and visual coordinate link.
  3. *Calculation Breakdown*: Explicit mathematical formula tree.
  4. *Uncertainty & Rationale*: Rationale for confidence score (e.g. 100% OCR clarity vs. handwritten note flag).
- **Rationale**: Gives CPAs full defensibility behind every number and allows inline corrections that immediately update state to `user_edited` with audit logging.

### Decision 3.4: Dual-Pane Side-by-Side Review Workbench Layout
- **Context**: CPAs need simultaneous visibility of the IRS tax schedule and the supporting source workpapers.
- **Decision**: Created `ReturnReviewWorkbench.tsx` with a dual-pane layout: Left pane for Form 1040 / Schedule C with container-level horizontal scroll (`min-w-[850px]`), Right pane for Document Viewer and AI Explainability, with quick toggle buttons for Split, Form-Only, and Document-Only layouts.
- **Rationale**: Enables rapid verification without modal popup fatigue or lost context.
