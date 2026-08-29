# Tasks: AI-Powered Tax Platform (MiraFlores AI)

**Input**: Design documents from `/specs/001-ai-tax-platform/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)  
**Constitution**: `.specify/memory/constitution.md` (v1.0.0 — shadcn preset `buHOvz6`, zero backend, simulated AI, mandatory `DECISIONS.md`)  
**Scope**: 10 Product Challenges, 8 User Stories, 3 Core Roles (`individual_client`, `tax_preparer`, `tax_reviewer`) + personal return mode, 120+ mock documents.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization with Vite, React 19, Tailwind CSS v4.3, shadcn/ui (`buHOvz6`), and base TypeScript configuration.

- [X] T001 Initialize Vite React 19 project structure with TypeScript in package.json and vite.config.ts
- [X] T002 Configure Tailwind CSS v4.3 and PostCSS in src/index.css and tailwind.config.ts with container horizontal scroll utilities (overflow-x-auto, min-w-*) and custom scrollbars
- [X] T003 [P] Setup shadcn/ui components (buHOvz6 preset) and utils in src/lib/utils.ts and components.json
- [X] T004 [P] Create initial architecture documentation and master decision log in DECISIONS.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core TypeScript types, deterministic Avengers-themed mock dataset (120+ documents, 8 returns), and pure in-memory ephemeral Zustand store with role-gated session isolation.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 [P] Implement core TypeScript interfaces in src/types/index.ts (TaxReturn, ReturnField, SourceDocument, BoundingBox, CollaborationThread, Message, UserRoleType, AffordanceState)
- [X] T006 [P] Implement deterministic mock dataset generator in src/data/mockReturns.ts (8 Avengers returns: Tony Stark 1040/Sched C, Stark Industries 1120S, Peter Parker 1040, Natasha Romanoff 1040, Wakanda Tech 1065, Bruce Banner 1040 employee personal, Pym Quantum 1120S, Avengers Compound 1065)
- [X] T007 [P] Implement source documents and bounding box generator in src/data/mockDocuments.ts (120+ documents: W-2s, 1099-NEC, 1099-DIV, K-1s, 150+ receipts with exact coordinates)
- [X] T008 [P] Implement mock contextual threads and action requests in src/data/mockThreads.ts (pre-seeded internal notes and client action requests)
- [X] T009 Implement triage priority scoring algorithm in src/store/triageLogic.ts (urgency formula based on deadline, blockers, complexity, and reviewer status)
- [X] T010 Implement pure in-memory ephemeral Zustand store with session isolation, role selectors, and synchronous real-time mutation actions (zero LocalStorage/SessionStorage complexity) in src/store/usePlatformStore.ts
- [X] T011 Create master navigation layout with top-bar Role Switcher and breadcrumb context in src/components/common/Header.tsx

**Checkpoint**: Foundation ready — pure in-memory mock store and layout operational.

---

## Phase 3: User Story 1 - CPA Inspects Source Document Traceability & AI Trust (Priority: P1) 🎯 MVP

**Goal**: Enable a CPA reviewer to click on any Form 1040/Schedule C field (e.g. Tony Stark Gross Receipts $142,500), open an interactive side-by-side split screen showing source 1099-NEC documents with highlighted coordinate bounding boxes, inspect calculation formulas, and view trustworthy AI explainability with 1-click verification or inline correction (ensuring horizontal scrolling and min-width preservation prevent content squeezing).

**Independent Test**: Select Tony Stark -> Open Schedule C -> Click Line 1 ($142,500) -> Verify side-by-side drawer renders 1099-NEC with highlighted Box 1 bounding box, calculation breakdown ($45k + $55k + $42.5k), and AI explainability card -> Click "Verify" to lock field.

- [X] T012 [P] [US1] Build coordinate-based SVG document page renderer with bounding-box highlights in src/components/document-viewer/DocumentViewer.tsx
- [X] T013 [P] [US1] Build 5-state AffordanceCell component (AI-extracted, verified, manual, locked, approval required) with fixed non-collapsing widths in src/components/return-review/AffordanceCell.tsx
- [X] T014 [US1] Build Form 1040 & Schedule C interactive grid with min-width preservation (min-w-[850px]) and container horizontal scroll (overflow-x-auto) in src/components/return-review/TaxFormViewer.tsx
- [X] T015 [US1] Build AI Explainability Card (summary, confidence gauge, evidence list, uncertainty reasons, inline correction) in src/components/ai-explainability/AIExplainabilityCard.tsx
- [X] T016 [US1] Build calculation formula breakdown modal/drawer in src/components/return-review/FormulaBreakdown.tsx
- [X] T017 [US1] Integrate side-by-side split review workbench with dual-pane horizontal scrolling container in src/components/return-review/ReturnReviewWorkbench.tsx
- [X] T018 [US1] Record traceability, AI explainability, and horizontal scroll viewport decisions in DECISIONS.md

**Checkpoint**: User Story 1 (MVP) is fully functional and testable independently.

---

## Phase 4: User Story 2 - CPA Prioritizes Work via Actionable Dashboard (Priority: P1)

**Goal**: Deliver a CPA workbench that answers "What should I work on right now?" by organizing returns into decision-driven triage queues (Urgent / At Risk, Ready for Review, Blocked on Client, Ready to File) across 100+ returns, with primary action buttons and quick filters.

**Independent Test**: Navigate to CPA Dashboard as Steve Rogers (Reviewer) -> Verify triage ranking (Pym Quantum Tech ranked #1 due to <48h deadline) -> Filter by "Blocked on Client" -> Instant filter response across all returns -> Click "Start Review" to jump directly into return.

- [X] T019 [P] [US2] Build urgency metric KPI summary cards in src/components/dashboard/TriageKpiCards.tsx
- [X] T020 [P] [US2] Build actionable triage queue card with container horizontal scroll (overflow-x-auto) and fixed column widths in src/components/dashboard/TriageQueueCard.tsx
- [X] T021 [US2] Build multi-faceted return search and filter bar (by status, deadline, assigned preparer, blocker) in src/components/dashboard/DashboardFilters.tsx
- [X] T022 [US2] Build team workload distribution view for managers in src/components/dashboard/TeamWorkloadView.tsx
- [X] T023 [US2] Assemble master Actionable CPA Dashboard with scroll-safe container layout in src/components/dashboard/CpaDashboard.tsx
- [X] T024 [US2] Record triage prioritization and dashboard information architecture decisions in DECISIONS.md

**Checkpoint**: User Story 2 is functional and integrated with User Story 1.

---

## Phase 5: User Story 3 - Client Progress Lifecycle & Centered Stage Bar (Priority: P2)

**Goal**: Deliver a clean, reassuring client portal experience (Tony Stark / Peter Parker) featuring a 6-stage **Return Progress Bar** centered at ~60% screen width (`max-w-4xl mx-auto`) directly below the navbar with concise 2-3 word stage titles, and highlighting the immediate next action (document upload or Form 8879 e-sign).

**Independent Test**: Sign in as Tony Stark or Peter Parker -> Observe top progress bar spanning ~60% screen width in the center with 6 concise stage titles (1. Documents Intake, 2. Expert Prep, 3. Partner Review, 4. Client Signature, 5. IRS Submission, 6. Return Accepted) -> Observe active stage and direct action callout -> Upload a document or e-sign Form 8879 -> Verify instant progress bar advancement.

- [X] T025 [P] [US3] Build 6-stage ClientMilestoneProgress bar (centered ~60% screen width, max-w-4xl mx-auto, 6 concise 2-3 word stage titles: Documents Intake, Expert Prep, Partner Review, Client Signature, IRS Submission, Return Accepted) in src/components/client-portal/ClientMilestoneProgress.tsx
- [X] T026 [P] [US3] Build client pending action callout and Form 8879 e-signature banner in src/components/client-portal/ClientActionBanner.tsx
- [X] T027 [US3] Build client document intake dropzone and requested documents list in src/components/client-portal/ClientDocumentUpload.tsx
- [X] T028 [US3] Build client summary card displaying return status, estimated refund/tax due, and assigned CPA contact in src/components/client-portal/ClientSummaryCard.tsx
- [X] T029 [US3] Assemble master ClientPortalView (with centered 60% progress bar and clean next action focus) in src/components/client-portal/ClientPortalView.tsx
- [ ] T030 [US3] Record client progress bar geometry (60% centered width) and 6-stage lifecycle decisions in DECISIONS.md

**Checkpoint**: User Story 3 is functional and provides clean client portal with centered progress bar.

---

## Phase 6: User Story 4 - Contextual Collaboration & Request Tracking (Priority: P2)

**Goal**: Provide a communication layer directly attached to documents and return lines, with unambiguous visual separation between Internal Firm Notes (amber banner, hidden from client) and Client Questions (blue banner, creates actionable request on client dashboard).

**Independent Test**: As Sam Wilson (Preparer), create a "Client Question" thread on Tony Stark Schedule C Line 9 travel deduction -> Switch to Tony Stark (Client) -> Verify prominent notification banner on client dashboard with reply and upload button -> Verify internal notes from Steve Rogers are strictly invisible to client.

- [ ] T031 [P] [US4] Build ThreadMessageItem component with visual internal vs. client badge and permission indicators in src/components/collaboration/ThreadMessageItem.tsx
- [ ] T032 [P] [US4] Build ActionRequestCard component (with 1-click resolve, file attach, text response) in src/components/collaboration/ActionRequestCard.tsx
- [ ] T033 [US4] Build ContextualThreadDrawer component attached to specific fields/documents in src/components/collaboration/ContextualThreadDrawer.tsx
- [ ] T034 [US4] Build client-facing outstanding requests widget in src/components/collaboration/ClientRequestsWidget.tsx
- [ ] T035 [US4] Record contextual collaboration and permission boundary decisions in DECISIONS.md

**Checkpoint**: User Story 4 is functional with verified client/firm privacy isolation.

---

## Phase 7: User Story 5 - Saved Logins Account Chooser & Navbar Account Dropdown (Priority: P2)

**Goal**: Deliver an authentic enterprise **"Saved Logins / Account Chooser"** landing page (`SavedLoginsScreen`) with 4 realistic persona accounts (Sam Wilson CPA, Steve Rogers Reviewer, Tony Stark Client, Peter Parker Client), coupled with a top-right Navbar Account Menu with a post-login **"Switch to My Personal Return"** toggle for staff and a `Logout` button returning to Saved Logins.

**Independent Test**: On initial load or after Logout, verify Saved Logins page displays 4 authentic persona accounts (no fake "personal mode" card) -> Click Sam Wilson CPA to log in -> Open top-right Account Menu -> Click "Switch to My Personal Return" -> Verify workspace cleanly shifts to Dr. Bruce Banner's confidential employee 1040 -> Click Logout to return to Saved Logins.

- [ ] T036 [P] [US5] Build authentic corporate Saved Logins (Account Chooser) landing page with persona cards in src/components/auth/SavedLoginsScreen.tsx
- [ ] T037 [P] [US5] Build Navbar Account Menu dropdown with Account Holder Name, Logout to Saved Logins, placeholder Settings/Help, and "Switch to My Personal Return" for staff in src/components/common/UserAccountMenu.tsx
- [ ] T038 [US5] Update Header.tsx to integrate UserAccountMenu and display active return context in src/components/common/Header.tsx
- [ ] T039 [US5] Wire in-memory authentication state and personal return mode toggle (Dr. Bruce Banner 1040) in src/store/usePlatformStore.ts
- [ ] T040 [US5] Record Saved Logins architecture and post-login personal return access decisions in DECISIONS.md

**Checkpoint**: User Story 5 is functional with authentic login chooser and post-login personal return switching.

---

## Phase 8: User Story 6 - Shared Return Status & Progress (Priority: P3)

**Goal**: Deliver an unambiguous status experience with dual views: granular 7-stage internal tracking for CPAs (Intake, Extraction, Prep, Review, Client Sign, E-Filed, Accepted) vs. 6 reassuring milestone stages for clients, featuring explicit Next Action Owner and blocker badges.

**Independent Test**: View Tony Stark return as CPA (shows 7 granular stages with blocker flag) -> View as Client (shows Step 3: "Partner Review" with centered 60% progress bar and explicit Next Action: "CPA preparing Schedule C").

- [ ] T041 [P] [US6] Build CPA Granular Lifecycle Stepper with blocker indicators in src/components/status/CpaStatusStepper.tsx
- [ ] T042 [P] [US6] Build StatusLifecycleSync logic connecting CPA stages with the 6 Client progress milestones in src/components/status/StatusLifecycleSync.tsx
- [ ] T043 [US6] Build Next Action Owner & Blocker Callout Banner in src/components/status/NextActionBanner.tsx
- [ ] T044 [US6] Record status legibility and shared mental model decisions in DECISIONS.md

**Checkpoint**: User Story 6 is functional with zero status ambiguity.

**Checkpoint**: User Story 6 is functional with zero status ambiguity.

---

## Phase 9: User Story 7 - Consistent Visual Language for Affordances (Priority: P3)

**Goal**: Enforce the 5-state affordance visual language across every table, workpaper, and review screen so users immediately distinguish AI-extracted, verified, human-edited, calculated-locked, and approval-required data without layout squeezing.

**Independent Test**: Inspect Form 1040 line items -> Hover over calculated cell (shows lock and formula tooltip) -> Hover over human-edited cell (shows edit history) -> Click AI-extracted cell (opens explainability drawer).

- [ ] T045 [P] [US7] Build interactive AffordanceLegend guide component in src/components/return-review/AffordanceLegend.tsx
- [ ] T046 [US7] Apply 5-state affordance badges and fixed non-collapsing column widths (min-w-fit, overflow-x-auto) across all tax schedules in src/components/return-review/ScheduleTable.tsx
- [ ] T047 [US7] Build manual value edit modal with audit reason tracking in src/components/return-review/ManualEditModal.tsx
- [ ] T048 [US7] Record affordance design tokens and interaction standards in DECISIONS.md

**Checkpoint**: User Story 7 is functional across all data entry surfaces.

---

## Phase 10: User Story 8 - Scalable Navigation & Deep Search for Complex Returns (Priority: P3)

**Goal**: Enable fast navigation and search over complex returns with 150+ documents (Wakanda Tech & Design LLC 1065) using multi-attribute filters, tree views, and batch operations without UI lag or table squeezing.

**Independent Test**: Select Wakanda Tech & Design LLC -> Open Document Hub -> Search for "Vibranium" -> Filter by Type = RECEIPT, Amount > $5000 -> Verify sub-second response across 150+ items -> Select all filtered items and trigger batch verification.

- [ ] T049 [P] [US8] Build high-performance document tree and category sidebar in src/components/document-hub/DocumentCategoryTree.tsx
- [ ] T050 [P] [US8] Build multi-faceted document filter bar (type, category, amount, AI confidence, status) in src/components/document-hub/DocumentFilters.tsx
- [ ] T051 [US8] Build virtualized/paginated document list grid with horizontal scroll container (overflow-x-auto, min-w-[900px]) and batch action toolbar in src/components/document-hub/DocumentListGrid.tsx
- [ ] T052 [US8] Assemble scalable Document Hub view in src/components/document-hub/DocumentHub.tsx
- [ ] T053 [US8] Record progressive disclosure and scale handling decisions in DECISIONS.md

**Checkpoint**: User Story 8 is functional and smoothly handles 150+ documents.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Assemble the master App shell, wire all challenge views together, complete DECISIONS.md and README.md, and run end-to-end quickstart validation.

- [ ] T054 [P] Wire all domain views, role routes, and context drawers in src/App.tsx and src/main.tsx
- [ ] T055 [P] Complete master decision log documenting pure in-memory ephemeral store architecture, horizontal scrolling strategy, and all 10 challenge solutions in DECISIONS.md
- [ ] T056 [P] Complete README.md detailing what is reactive in the UI vs. what is simulated behind the scenes
- [ ] T057 Run end-to-end interactive validation against all 10 scenarios in quickstart.md including responsive viewport and horizontal scroll test

---

## Dependencies & Execution Order

```mermaid
graph TD
    Phase1[Phase 1: Setup] --> Phase2[Phase 2: Foundational]
    Phase2 --> US1[Phase 3: US1 - Traceability & AI Trust - MVP]
    Phase2 --> US2[Phase 4: US2 - Actionable Dashboard]
    Phase2 --> US3[Phase 5: US3 - Client Onboarding]
    Phase2 --> US4[Phase 6: US4 - Contextual Collaboration]
    Phase2 --> US5[Phase 7: US5 - Role Switcher]
    Phase2 --> US6[Phase 8: US6 - Shared Return Status]
    Phase2 --> US7[Phase 9: US7 - Affordance System]
    Phase2 --> US8[Phase 10: US8 - Scale & Deep Search]
    US1 & US2 & US3 & US4 & US5 & US6 & US7 & US8 --> Polish[Phase 11: Polish & DECISIONS.md]
```

### Parallel Opportunities

- **Phase 1**: T003 (shadcn/ui setup) and T004 (DECISIONS.md) can run in parallel.
- **Phase 2**: T005 (Types), T006 (Returns data), T007 (Documents data), and T008 (Threads data) can run in parallel.
- **Phase 3 (MVP)**: T012 (SVG viewer) and T013 (AffordanceCell) can run in parallel.
- **Phase 4**: T019 (KPI cards) and T020 (Triage card) can run in parallel.
- **Phase 5**: T025 (Onboarding header) and T026 (Action cards) can run in parallel.
- **Phase 6**: T031 (Message item) and T032 (Action request) can run in parallel.
- **Phase 7**: T036 (Role switcher) and T037 (Permission buttons) can run in parallel.
- **Phase 8**: T041 (CPA stepper) and T042 (Client progress) can run in parallel.
- **Phase 10**: T049 (Category tree) and T050 (Filter bar) can run in parallel.
- **Phase 11**: T054 (App shell), T055 (DECISIONS.md), and T056 (README.md) can run in parallel.

---

## Implementation Strategy

### MVP Scope (Phase 1 + Phase 2 + Phase 3: User Story 1)
1. Initialize Vite React 19 + shadcn/ui + Tailwind CSS.
2. Build mock dataset (Tony Stark 1040, 1099-NECs with coordinate bounding boxes) and Zustand store.
3. Build side-by-side traceability review workbench with SVG document viewer, bounding-box highlights, formula breakdowns, and AI explainability card.
4. **Validate MVP**: Test Tony Stark Schedule C Gross Receipts ($142,500) tie-out to 1099-NEC with 1-click verification.

### Incremental Feature Additions
1. **MVP + Dashboard (US2)**: Actionable triage queue and manager views.
2. **+ Onboarding & Collaboration (US3, US4)**: Peter Parker 10-second flow and contextual internal/external threads.
3. **+ Role Architecture & Status (US5, US6, US7)**: 3-role switcher, Bruce Banner personal mode, dual status stepper, and affordance legend.
4. **+ Scale & Complexity (US8)**: Wakanda Tech 150+ receipt search and batch operations.
5. **+ Documentation (DECISIONS.md & README.md)**: Full decision rationale logging and real vs. simulated documentation.
