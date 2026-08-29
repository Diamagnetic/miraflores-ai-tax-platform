# Implementation Plan: AI-Powered Tax Platform (MiraFlores AI)

**Branch**: `001-ai-tax-platform` | **Date**: 2026-08-27 | **Spec**: [/specs/001-ai-tax-platform/spec.md](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/specs/001-ai-tax-platform/spec.md)

**Input**: Feature specification from `/specs/001-ai-tax-platform/spec.md`

---

## Summary

Build an interactive, role-aware, and trustworthy AI-powered tax platform prototype resolving all 10 candidate case study challenges. The platform features an authentic **Saved Logins (Account Chooser)** landing screen, an interactive return review workbench with side-by-side source document traceability (Form 1040/Schedule C to 1099/W-2 with coordinate bounding boxes) and AI output defensibility, an actionable CPA triage dashboard with dynamic prioritization, a streamlined Client Portal featuring a 6-stage **Return Progress Bar** centered at ~60% screen width with concise 2-3 word stage titles directly below the navbar, contextual threaded messaging with strict internal vs. external privacy, a top-right Navbar Account Menu with a post-login **"Switch to My Personal Return"** toggle for firm employees, a 5-tier visual affordance system (AI-extracted, verified, manual, locked, approval required), and a trustworthy AI explainability framework with inline correction workflows. All state is powered by a pure in-memory ephemeral Zustand store with real-time synchronous UI reactivity and zero LocalStorage/SessionStorage complexity.

---

## Technical Context

**Language/Version**: TypeScript 7 / Node.js 24.20  
**Primary Dependencies**: React 19, Vite 8.0, Tailwind CSS v4.3, shadcn/ui (`buHOvz6` preset with strict `--radius: 0rem` sharp corners), Lucide React Icons, Zustand (Pure In-Memory Reactive Store), Canvas/SVG Document Engine  
**Storage**: Pure In-Memory Ephemeral Zustand Store (Zero LocalStorage/SessionStorage serialization or caching complexity; state is live across in-app role switches and cleanly resets to pristine baseline fixtures on browser refresh)  
**Testing**: Vitest + React Testing Library (for unit/component tests & contract checks)  
**Target Platform**: Modern Web Browsers (Chrome, Edge, Safari, Firefox)  
**Project Type**: Interactive Web Application Prototype (Single-Page App with client routing & view switching)  
**Performance Goals**: < 100ms response time on search/filter across 170+ simulated documents and returns; instantaneous role and context switching; 0ms synchronous state propagation across mounted components  
**Constraints**: Zero external backend requirement (self-contained in-memory mock engine); realistic simulated Avengers-themed tax data and bounding-box coordinates; container-level horizontal scrolling (`overflow-x-auto` with `min-w-*` preservation) to eliminate content squeezing on dense professional views; strict `--radius: 0rem` sharp-corner geometry  
**Scale/Scope**: 10 distinct challenge workflows, 4 authentic persona logins on Saved Logins screen (Sam Wilson CPA, Steve Rogers Reviewer, Tony Stark Client, Peter Parker Client) plus in-app employee personal return mode (Dr. Bruce Banner), 8 realistic multi-schedule returns, 170+ mock source documents (including 155 expense receipts for Wakanda Tech)  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Interactive Prototype First**: Pass. All 10 challenges are modeled as clickable, interactive components backed by rich mock data.
- **Simulate AI with High Fidelity & Defensibility**: Pass. Plausible AI confidence scores, explainability cards, formula breakdowns, and uncertainty reasons are specified in `data-model.md` and `contracts/`.
- **Pure In-Memory Reactive State**: Pass. Pure ephemeral Zustand store without backend or storage complexity; verification and edits immediately update all views in real time.
- **Role Isolation & Context Switching**: Pass. Realistic Saved Logins chooser with clear firm vs. client separation and in-app employee-personal return dropdown toggle.
- **No Unjustified Complexity**: Pass. Clean client-side architecture using React 19 + shadcn/ui (`buHOvz6`) + Zustand + Tailwind v4.3 without unnecessary backend or storage infrastructure.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-tax-platform/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (/speckit-plan command output)
├── research.md          # Phase 0 technical research & design decisions
├── data-model.md        # Phase 1 domain entities, states & explainability models
├── quickstart.md        # Phase 1 step-by-step interactive validation guide
├── checklists/          # Quality checklists
│   └── requirements.md
└── contracts/           # Phase 1 TypeScript interfaces & mock API contracts
    ├── types.ts
    └── mock-api.ts
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── auth/               # SavedLoginsScreen (authentic account chooser landing page)
│   ├── common/             # Navigation header with Account Dropdown, Logout, Breadcrumbs
│   ├── dashboard/          # Actionable triage queue, manager vs. preparer views, metrics
│   ├── client-portal/      # Client stage progress bar (2-3 word titles), document upload, e-sign
│   ├── return-review/      # Form 1040/Schedule C grid, AffordanceCell, formula popups
│   ├── document-viewer/    # SVG/Canvas document renderer, bounding boxes, zoom/pan
│   ├── ai-explainability/  # Trust cards, confidence gauges, evidence breakdown, inline correction
│   ├── collaboration/      # Contextual thread drawer, internal notes vs. client requests
│   └── document-hub/       # Scalable document browser, multi-filter, search & batch actions
├── data/
│   ├── mockReturns.ts      # 8 diverse tax returns (1040, 1120S, 1065, etc.)
│   ├── mockDocuments.ts    # 170+ mock source documents with bounding boxes & text
│   └── mockThreads.ts      # Pre-seeded collaboration threads and requests
├── store/
│   ├── usePlatformStore.ts # Zustand global store (current user, active return, filters, audit logs)
│   └── triageLogic.ts      # Algorithmic triage score and queue categorization
├── types/
│   └── index.ts            # Type definitions mirroring contracts
├── App.tsx                 # Master shell, view switching (Saved Logins vs. Logged In Workspace)
├── main.tsx                # Application entry point
└── index.css               # Tailwind CSS & custom affordance styling (--radius: 0rem)
```

**Structure Decision**: Single React web application organized into domain-specific component modules, a central Zustand store, and deterministic mock data generators.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| *None* | Architecture strictly matches prototype requirements | N/A |
