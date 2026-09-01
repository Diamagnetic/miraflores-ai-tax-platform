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

---

## 4. Actionable CPA Triage Command Center & Workload Balancing (Phase 4 - US2)

### Decision 4.1: Deterministic 5-Factor Triage Prioritization Engine
- **Context**: Challenge 02 and Challenge 05 require solving the fundamental practitioner question: *"What return should I work on right now?"* across 100+ concurrent returns.
- **Decision**: Implemented `calculateTriageScore(ret)` in `triageLogic.ts` based on 5 weighted factors:
  1. *Deadline Proximity*: Dynamic window scoring (+30 pts for <15 days, +18 pts for <30 days, +8 pts for <45 days).
  2. *Active Blocker Penalty*: Returns with client or third-party blockers receive +15 pts urgency.
  3. *Workflow Stage Weight*: Prioritizes returns ready for partner sign-off (`REVIEW`: +20 pts, `PREPARATION`: +12 pts, `EXTRACTION`: +8 pts).
  4. *Open Issues & Exceptions*: Scaled based on discrepancy count (+4 pts per open issue, max 15 pts).
  5. *Document & Entity Complexity*: Volume weighting (+8 pts for high-volume pass-throughs).
- **Rationale**: Replaces subjective sorting with an auditable, deterministic priority queue where urgent returns (e.g. March 15 corporate deadlines or blocked returns) float directly to the top.

### Decision 4.2: Actionable Triage Queue Table with Scroll-Safe Containers
- **Context**: Multi-column tax queue tables collapse and truncate on standard laptop viewports.
- **Decision**: Created `TriageQueueCard.tsx` with container-level horizontal scroll (`min-w-[960px]`) and fixed column metrics:
  - Triage Score & Rank (`w-24 text-center`)
  - Taxpayer / Entity & Form Type (`min-w-[220px]`)
  - Deadline & Proximity Callout (`w-32`)
  - Workflow Status & AI Confidence (`w-36`)
  - Immediate Next Action & Owner (`min-w-[240px]`)
  - Assigned Team Staff (`w-40`)
  - Primary Action Button (`w-28 text-right`)
- **Rationale**: Guarantees zero text truncation while providing a single-click `[Review]` action that immediately opens the selected return in the Workbench.

### Decision 4.3: 4-KPI Queue Synchronization & Team Workload Balancing
- **Context**: Reviewers and managing partners need instant visibility into bottlenecks across team members.
- **Decision**: Built `TriageKpiCards.tsx` (4 interactive queue cards: Critical/At-Risk, Ready for Review, Blocked on Client, Ready to File) that instantly filter the queue on click, accompanied by `TeamWorkloadView.tsx` tracking capacity utilization (returns assigned vs. capacity limit) and stage breakdown per practitioner.
- **Rationale**: Prevents practitioner burnout and ensures balanced distribution across complex Form 1040, 1120-S, and 1065 workflows.

---

## 5. Client Portal Lifecycle & Centered Progress Geometry (Phase 5 - US3)

### Decision 5.1: 6-Stage Client Lifecycle with Centered Geometry (~60% Screen Width)
- **Context**: Challenge 04 requires delivering a reassuring, transparent client portal that eliminates status anxiety without overwhelming taxpayers with internal accounting jargon.
- **Decision**: Implemented `ClientMilestoneProgress.tsx` centered at ~60% screen width (`max-w-4xl mx-auto`) directly below the navigation bar, featuring 6 concise 2-3 word stage titles:
  1. *Documents Intake* (`DOCUMENTS_NEEDED` / `PROCESSING`)
  2. *Expert Prep* (`PREPARATION`)
  3. *Partner Review* (`EXPERT_REVIEW`)
  4. *Client Signature* (`READY_FOR_SIGNATURE`)
  5. *IRS Submission* (`SUBMITTED_TO_IRS`)
  6. *Return Accepted* (`ACCEPTED`)
- **Rationale**: A centered 60% viewport width (`max-w-4xl mx-auto`) anchors the taxpayer's focus directly onto lifecycle progress without peripheral clutter. Concise 2-3 word titles communicate milestone clarity without confusing accounting jargon.

### Decision 5.2: Action-Oriented Client Experience with Integrated Form 8879 E-Signing
- **Context**: Taxpayers need clear instruction on their exact required action (e.g. uploading missing documents or e-signing) without navigating multi-level menus.
- **Decision**: Built `ClientActionBanner.tsx`, `ClientSummaryCard.tsx`, and `ClientDocumentUpload.tsx` with dynamic state handling:
  - *Blocked State*: Direct missing document alert that enables drag-and-drop file upload and instantly unblocks the return upon intake.
  - *Client Sign State*: Form 8879 IRS e-file authorization with perjury declaration, AGI & refund/tax liability summary, and typed electronic signature that transitions the return immediately to `E_FILED`.
  - *Prep/Review State*: Reassuring status notice displaying the assigned CPA contact and direct question trigger.
- **Rationale**: Keeps the client portal actionable, transparent, and frictionless.

### Decision 5.3: Document Upload Accessibility Beyond Initial Intake Stage
- **Context**: Evaluating whether document upload capability should be restricted strictly to Stage 1 (Documents Intake) or remain accessible across later lifecycle stages.
- **Decision**: Maintained document intake accessibility across subsequent stages (Stages 2–4: Expert Prep, Partner Review, Client Signature) for three critical tax practice reasons:
  1. *Late-Arriving & Corrected Tax Forms*: Brokerage Form 1099-B/DIV statements and Schedule K-1s frequently arrive late (mid-March through April) or receive "Corrected 1099" amendments after preparation has already begun.
  2. *CPA-Requested Supporting Workpapers & Blocker Resolution*: Reviewers and preparers frequently request additional substantiation (e.g. donation receipts, 1099-NEC workpapers, Section 179 vehicle logs) during review, requiring client upload access to resolve blockers.
  3. *Client Document Vault & Audit-Defense Records*: Serves as a persistent digital repository for permanent taxpayer workpapers.
- **Rationale**: Restricting uploads strictly to intake would break real-world accounting workflows where supplemental files and amended source documents are commonplace during prep and review.

### Decision 5.4: 2-Step E-File Transmission, 10s Invisible IRS Gateway Simulation, and CPA Acknowledgment Lifecycle
- **Context**: Regulatory Treasury Circular 230 and IRS Pub 1345 rules require distinct separation between Client Form 8879 Authorization and CPA EFIN transmission, followed by IRS electronic acceptance acknowledgment.
- **Decision**: Implemented an authentic 4-step e-filing lifecycle:
  1. *Step 1 (Client E-Sign Form 8879)*: Taxpayer electronically authorizes Form 8879 in the Client Portal. Stage 4 marks complete with a checkmark ($\checkmark$). The return moves to `CLIENT_SIGN` with `clientSigned: true`, awaiting CPA EFIN transmission.
  2. *Step 2 (CPA EFIN Transmission)*: The CPA reviews the authorization in the Workbench/Triage Queue and clicks `[Transmit to IRS MeF Gateway ➔]`. The return advances to `E_FILED` (`SUBMITTED_TO_IRS`), making Stage 5 active in-flight on the client portal.
  3. *Step 3 (10-Second Invisible IRS Gateway Simulation)*: An invisible 10-second timer simulates IRS electronic processing. When approval arrives (`irsApproved: true`, Code 0000), it appears strictly to the CPA first with an action banner.
  4. *Step 4 (CPA Acknowledgment & Client Notification)*: The CPA clicks `[Acknowledge & Notify Client of IRS Acceptance ➔]`. The return updates to `ACCEPTED`, advancing Stage 5 and Stage 6 to full completed status with green checkmarks ($\checkmark$) across both CPA and Client portals.
- **Rationale**: Complies with IRS EFIN regulatory power-of-attorney requirements while providing an interactive, verifiable multi-persona demo loop without unnatural frontend countdown timers.

## Phase 6 Decisions: Contextual Collaboration & Privacy Boundaries

### Decision 6.1: Strict Internal Firm Note vs. Client-Facing Communication Isolation
- **Context**: Tax preparers and reviewers need to exchange raw calculations, audit risk notes, and IRC citations without exposing internal deliberations to taxpayers. Conversely, client questions must be prominent, actionable, and clearly distinguished.
- **Decision**: Built `ThreadMessageItem.tsx` and `ContextualThreadDrawer.tsx` with explicit privacy scopes:
  1. *Internal Firm Notes* (Amber Banner & Lock Icon): Visible strictly to CPA Preparers (`tax_preparer`) and Reviewers (`tax_reviewer`). If an individual client (`individual_client`) views the thread or return, internal notes are completely filtered out and never rendered into the DOM.
  2. *Client Questions & Inquiries* (Blue/Sky Banner & Globe Icon): Visible to both firm staff and taxpayers, enabling threaded discussions directly attached to returns, fields, or source documents.
- **Rationale**: Eliminates client confusion and liability risks by preventing internal reviewer critiques and IRC risk analyses from leaking to taxpayers.

### Decision 6.2: Action-Oriented Request Cards with Direct Inline Resolution
- **Context**: Tax inquiries frequently require discrete client actions (uploading receipts, clarifying numeric deductions, or confirming yes/no questions).
- **Decision**: Built `ActionRequestCard.tsx` and `ClientRequestsWidget.tsx` supporting 4 actionable interaction types:
  1. `upload_document`: Triggers immediate file dropzone upload with automatic blocker resolution.
  2. `clarify_number`: In-line text / figure entry with instant submit.
  3. `confirm_yes_no`: 1-click confirmation buttons.
  4. `e_sign`: 1-click electronic acknowledgement.
- **Rationale**: Replaces open-ended email threads with structured, 1-click resolvable tasks that directly update the return state.

### Decision 6.3: Priority-Driven Triage Architecture & In-Context Workbench Collaboration (No Redundant Unread Chat Inboxes)
- **Context**: Evaluating whether to introduce a global unread-messages notification feed / dropdown in the staff navigation bar and a dedicated "Messages" column in the Triage Command Center table.
- **Decision**: Deliberately avoided turning the CPA experience into a chat messenger inbox. Decided that:
  1. *Priority & Blocker State Decide CPA Next Action*: In professional tax practice, returns are prioritized by deterministic urgency score, statutory filing deadline, and blocker severity (`⚠️ BLOCKED: Missing 1099-B`) rather than chat unread timestamps.
  2. *Contextual Collaboration Inside the Workbench*: CPA staff inspect discussions directly attached to the return workpaper via the clean **`[ 💬 Notes & Threads ]`** drawer (with dynamic indicator `(1 Open Request)` when an action item is awaiting client response).
  3. *Zero Read-Receipt Overhead*: Eliminates complex multi-user read/unread state machines and notification fatigue, keeping the CPA interface dense, focused, and professional.
  4. *Client-Facing Prominence*: Maintained the clear **`[ 💬 CPA Inquiries (1) ]`** button in the top navigation bar strictly on the Client Portal side, where taxpayers (infrequent visitors) benefit directly from visible messaging access.
- **Rationale**: Tax preparation is a document, calculation, and regulatory workflow engine, not a social messaging feed. Keeping the Triage Command Center focused on Priority, Blocker, and Immediate Next Action preserves speed and workflow clarity.

---

## 7. Saved Logins Account Chooser & Post-Login Personal Return Access (Phase 7 - US5)

### Decision 7.1: Enterprise Saved Logins Account Chooser Landing Screen (4 Realistic Personas)
- **Context**: Challenge 05 requires robust multi-persona role switching with strict data access boundaries, avoiding artificial or confusing generic demo modes.
- **Decision**: Built `SavedLoginsScreen.tsx` presenting 4 authentic enterprise persona accounts:
  1. *Sam Wilson, CPA* (`tax_preparer`): Lead Tax Preparer with access to firm returns, AI line item verification, and client collaboration.
  2. *Steve Rogers* (`tax_reviewer`): Senior Reviewer & Managing Partner with access to firm triage, partner QA, and IRS MeF gateway transmission.
  3. *Anthony E. Stark* (`individual_client`): High-Net-Worth client with Form 1040 Schedule C, 1099-B, and Form 8879 e-sign authorization.
  4. *Peter Parker* (`individual_client`): Freelance photojournalist with 1099-NEC nonemployee compensation and equipment deductions.
- **Rationale**: Eliminates fake password forms while providing an authentic enterprise SSO feel with clear role descriptions, practice areas, and 1-click authentication.

### Decision 7.2: Post-Login Confidential Personal Return Sandbox for CPA Staff (Employee's Own Form 1040)
- **Context**: Accounting firm employees frequently have their own personal tax returns prepared within the firm's ecosystem, but ethical Chinese walls and Circular 230 privacy rules require complete isolation from standard client triage queues.
- **Decision**: Rather than showing an artificial "Personal Return" user on the login screen, we embedded a post-login **"Switch to My Personal Return"** option inside the top-right `UserAccountMenu.tsx` for authenticated staff members:
  - Clicking switches the workspace directly into the authenticated employee's own Form 1040 return (e.g. Sam Wilson Form 1040 for Sam, Steve Rogers Form 1040 for Steve).
  - Inside this view, firm triage queues and client switcher dropdowns are locked away.
  - Clicking **"Return to Firm Workspace"** immediately returns the CPA to their firm practice environment.
- **Rationale**: Models real-world firm software where employee personal return sandboxes are strictly gated behind staff credentials and isolated from firm client queues.

---

## 8. Action-Oriented AI Integration & Next Action Architecture (Phase 8 - US6 / Challenges 04 & 08)

### Decision 8.1: Action-Oriented AI Integration Roadmap (1A & 4 Immediate, 1C Next Step, Field/Batch in Future Scope)
- **Context**: Evaluating where to surface proactive, action-oriented AI capabilities across the platform to transform the AI from a passive OCR reader into an active workflow driver.
- **Decision**: Adopted a prioritized 3-tier roadmap:
  1. *Immediate Core (Phase 8)*:
     - **1A (Macro Return Action Banner)**: Positioned right above the line items table in the Workbench. Detects active blockers, establishes the explicit Next Action Owner (`client` vs `preparer` vs `reviewer`), and provides a 1-click **`[ 🚀 Send AI-Drafted Request to Client ]`** dispatch button.
     - **4 (Collaboration Thread Summarizer & Blocker Auto-Resolver)**: Sits at the top of the Notes & Threads drawer. Synthesizes client uploads/answers and provides a 1-click **`[ 🤖 Apply Figures & Clear Blocker ]`** button that syncs back to the triage queue.
  2. *Immediate Next Step*:
     - **1C (Document Inspection Actions)**: Document-level quality defect detection (blurry scan, cropped Box 14, tax year mismatch) directly inside the PDF document viewer with 1-click re-upload requests.
  3. *Future Scope*:
     - Inline field discrepancy prompts (1B), Firm-wide batch action bar (2A), Smart deduction opportunities in client portal (3B).
- **Rationale**: Directly solves **Challenge 08 (Next Action Owner & Blocker Visibility)** and **Challenge 04 (Contextual Collaboration Loop)** with maximum user experience impact, high cognitive clarity, and zero data table clutter.

### Decision 8.2: Dual-Track Lifecycle Status Steppers (7-Stage CPA vs. 6-Milestone Client with Identical Rounded-Node Design)
- **Context**: Tax preparers require deep visibility into internal technical workflows (OCR Extraction, Partner Review, IRS Schema Validation), while individual clients experience cognitive friction when exposed to internal accounting stages.
- **Decision**: Built two synchronized status components sharing the exact same clean visual design:
  - `CpaStatusStepper.tsx`: Displays the 7 granular internal stages (`INTAKE`, `EXTRACTION`, `PREPARATION`, `REVIEW`, `CLIENT_SIGN`, `E_FILED`, `ACCEPTED`), urgent blocker tags with pulse animations, and explicit **Next Action Owner** badges (`Client`, `Preparer`, `Reviewer`, `IRS Gateway`).
  - `ClientMilestoneProgress.tsx`: Displays the 6 reassuring consumer milestones with friendly 2-3 word stage titles.
  - `StatusLifecycleSync.tsx`: Deterministic bidirectional mapping ensuring state changes in one view instantly update the other.
- **Rationale**: Completely eliminates the common tax season question "Who is waiting on whom?" while preserving design consistency across both interfaces.

### Decision 8.3: Closed-Loop AI Blocker Dispatch & Auto-Resolution Loop
- **Context**: When a tax return is blocked on missing client documents, CPAs lose significant time writing manual emails and later re-verifying incoming uploads.
- **Decision**: Implemented a closed-loop AI action system:
  1. `AiNextActionBanner.tsx` detects the blocker on the Workbench and generates a tailored client inquiry. The CPA clicks **`[ 🚀 1-Click Send to Client ]`**, which automatically posts a structured `ActionRequest` into the client's portal.
  2. In the Client Portal, the taxpayer sees the action request and uploads the requested workpaper.
  3. In the CPA Workbench, `ThreadAiSummaryWidget.tsx` analyzes the incoming upload, verifies that the numbers match the return schedule, and provides a 1-click **`[ 🤖 Apply Figures & Clear Blocker ]`** action that instantly resolves the blocker and updates the triage queue.
- **Rationale**: Fully closes the collaboration loop between CPA and Client, establishing defensible AI ROI for firm efficiency.

## 9. Consistent 5-State Affordance Visual Language & Manual Override Audit System (Phase 9 - US7 / Challenge 07)

### Decision 9.1: Semantic Color Tokens & Interactive Affordance Guide
- **Context**: In high-volume tax review, CPAs must know with 100% certainty whether a dollar figure came from automated OCR, manual entry, locked calculation, or requires supervisor QA.
- **Decision**: Standardized on 5 semantic tokens across all return tables:
  1. `ai_extracted`: Purple (`bg-purple-100 dark:bg-purple-950/60`) with confidence score (`98%`). Clicking opens AI Explainability and source vector bounding box in split view.
  2. `verified`: Emerald (`bg-emerald-100 dark:bg-emerald-950/60`) with `LOCKED` indicator. Signifies CPA workpaper verification sign-off.
  3. `user_edited`: Amber (`bg-amber-100 dark:bg-amber-950/60`) with `EDITED` badge. Hovering displays CPA author, timestamp, and audit note.
  4. `calculated_locked`: Slate (`bg-slate-100 dark:bg-slate-800`) with `FORMULA` badge. Clicking displays formula inputs and dependency breakdown.
  5. `requires_approval`: Rose (`bg-rose-100 dark:bg-rose-950/60`) with `DISCREPANCY` badge and pulse animation.
- **Interactive Component**: Built `AffordanceLegend.tsx` accessible in the table toolbar to inspect state definitions, regulatory defensibility, and filter table line items by state.
- **Rationale**: Eliminates "clickable vs. editable" confusion and provides defensible audit trails required under Circular 230 regulations.

### Decision 9.2: Mandatory Audit Justification for Manual Overrides (`ManualEditModal.tsx`)
- **Context**: Allowing arbitrary edits to tax figures without tracking the author and justification creates severe regulatory liability during IRS audits.
- **Decision**: Built `ManualEditModal.tsx` requiring preparers to select or write a mandatory audit justification (e.g. *"Taxpayer oral confirmation"*, *"Supporting receipt reconciliation"*, *"K-1 partner basis adjustment"*) before modifying any field.
- **Rationale**: Captures chronological audit logs (`oldValue -> newValue`, `changedBy`, `timestamp`, `reason`) stored directly in `field.auditHistory`, ensuring full defensibility.

---

## 10. Scalable Navigation & Deep Search for Complex Returns (Phase 10 - US8 / Challenge 10)

### Decision 10.1: Hierarchical Categorization & Progressive Disclosure Architecture (`DocumentCategoryTree.tsx`)
- **Context**: Enterprise partnership returns like Wakanda Tech & Design LLC (Form 1065) involve 155+ high-volume receipts, invoices, and expense workpapers. Rendering flat unorganized lists causes cognitive overload and sluggish navigation.
- **Decision**: Built `DocumentCategoryTree.tsx` providing a multi-dimensional hierarchical sidebar:
  - *Expense Categories*: Auto-grouped by AI extraction tags (`supplies`, `cloud_infra`, `hardware`, `materials`, `rent`, `legal_professional`, `travel`, `raw_materials`).
  - *Document Types*: Quick slicing across receipts, W-2s, 1099s, and financial statements.
  - *Ingestion Status*: Instant filtering between `Processed` (98% OCR confidence) and `Needs Review` variance flags.
  - Live count and monetary subtotal indicators for each node.
- **Rationale**: Enables preparers to jump directly from macro partnership ledger categories down to individual vendor receipts in a single click.

### Decision 10.2: Sub-Second Multi-Faceted Deep Search & Batch Operations (`DocumentFilters.tsx` & `DocumentListGrid.tsx`)
- **Context**: Tax auditors and CPAs need to quickly locate specific line items (e.g. searching "Vibranium", filtering by Amount > $5,000, or identifying low-confidence OCR flags) and perform batch verifications without UI latency.
- **Decision**: Implemented an in-memory search pipeline:
  - Sub-second fuzzy search across vendor names, raw OCR text preview, file names, invoice IDs, and dollar amounts.
  - Multi-faceted filter bar supporting document type, expense category, amount tiers (`<$1k`, `$1k-$5k`, `>$5k`, `>$10k`), AI confidence threshold, and status.
  - Container-level horizontal scrolling (`overflow-x-auto min-w-[1100px]`) with expandable columns preventing table column squeezing.
  - High-efficiency batch action toolbar supporting page-scoped selection, 1-click **`[ Batch Verify (X) ]`**, and **`[ Export CSV Ledger ]`**.
- **Rationale**: Directly solves **Challenge 10 (Scalable Navigation & Search)** with immediate responsiveness across 150+ complex documents.

---

## 11. 10-Challenge Solution Matrix & Verification Index (Phase 11)

| # | Product Challenge | Primary Component(s) | Key Architectural Decision & Verification |
| :-: | :--- | :--- | :--- |
| **01** | **Traceability & AI Trust** | [`AIExplainabilityCard.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/ai-explainability/AIExplainabilityCard.tsx), [`VectorDocumentViewer.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/document-viewer/VectorDocumentViewer.tsx) | SVG coordinate overlay; clicking line item highlights source document bounding box with 100% concordance. |
| **02** | **Triage Command Center** | [`CpaDashboard.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/dashboard/CpaDashboard.tsx), [`TriageQueueCard.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/dashboard/TriageQueueCard.tsx) | Deterministic composite urgency score ($0-100$); traffic light badges; zero-icon typography. |
| **03** | **Client Onboarding (10-Sec Flow)** | [`ClientPortalView.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/client-portal/ClientPortalView.tsx), [`PeterParkerOnboardingHero.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/client-portal/PeterParkerOnboardingHero.tsx) | Instant 1-click document upload simulation with auto-closing requests; immediate progress feedback. |
| **04** | **Contextual Collaboration** | [`ContextualThreadDrawer.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/collaboration/ContextualThreadDrawer.tsx), [`ThreadAiSummaryWidget.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/collaboration/ThreadAiSummaryWidget.tsx) | Dual internal vs client-visible threads attached to exact return field IDs; pure-text AI thread synthesis. |
| **05** | **Persona Role Switcher & Personal Mode** | [`UserAccountMenu.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/common/UserAccountMenu.tsx), [`SavedLoginsScreen.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/auth/SavedLoginsScreen.tsx) | Instant persona switcher (Sam Wilson CPA, Steve Rogers Partner, Tony Stark Client, Bruce Banner Personal Return). |
| **06** | **Dual Lifecycle Steppers** | [`CpaStatusStepper.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/status/CpaStatusStepper.tsx), [`ClientMilestoneProgress.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/status/ClientMilestoneProgress.tsx) | 7-stage CPA stepper vs 6-milestone consumer progress sharing identical rounded-node visual design and bidirectional sync. |
| **07** | **5-State Affordance Language** | [`AffordanceLegend.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/return-review/AffordanceLegend.tsx), [`ManualEditModal.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/return-review/ManualEditModal.tsx) | 5 semantic color tokens (`ai_extracted`, `verified`, `user_edited`, `calculated_locked`, `requires_approval`) + Circular 230 audit log. |
| **08** | **IRS MeF Gateway & E-Sign** | [`ReturnReviewWorkbench.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/return-review/ReturnReviewWorkbench.tsx), [`Form8879SignatureModal.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/client-portal/Form8879SignatureModal.tsx) | Form 8879 electronic signature workflow, IRS MeF gateway transmission, and partner acknowledgment. |
| **09** | **Closed-Loop AI Next Actions** | [`AiNextActionBanner.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/return-review/AiNextActionBanner.tsx), [`ThreadAiSummaryWidget.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/collaboration/ThreadAiSummaryWidget.tsx) | 1-click blocker dispatch from CPA Workbench to Client Portal, with AI receipt auto-analysis on taxpayer upload. |
| **10** | **Scalable Deep Search (150+ Docs)** | [`DocumentHub.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/document-hub/DocumentHub.tsx), [`DocumentCategoryTree.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/document-hub/DocumentCategoryTree.tsx), [`DocumentListGrid.tsx`](file:///D:/E/Dhamange/Chirag/dev/miraflores_ai_case_study/src/components/document-hub/DocumentListGrid.tsx) | Sub-second fuzzy search for "Vibranium", multi-attribute filter bar, category sidebar tree, batch verification, and CSV export. |


