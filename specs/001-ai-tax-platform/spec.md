# Feature Specification: AI-Powered Tax Platform (MiraFlores AI Case Study)

**Feature Branch**: `001-ai-tax-platform`  
**Created**: 2026-08-27  
**Status**: Approved  
**Input**: Candidate Case Study — Designing an AI-Powered Tax Platform From Scratch (10 Product Challenges)

---

## Executive Overview & Problem Statement

The goal is to design and build a greenfield, highly interactive, role-aware, and trustworthy AI-powered tax platform serving both clients (individual taxpayers and business owners) and firm professionals (preparers, reviewers, administrators, and seasonal staff).

The platform addresses 10 critical challenges:
1. **Source Document Traceability & AI Output Defensibility**: Trace every number on the return back to its source, connect fields to exact pages/bounding boxes, show calculation transformations, and make every AI extraction transparent and defensible.
2. **Client & CPA Collaboration**: Unified contextual communication tied to documents/issues with clear internal vs. client visibility and action ownership.
3. **Where to Start (Onboarding)**: First-time client experience delivering next-action clarity within 10 seconds.
4. **Context-Preserving Navigation**: Seamless movement across documents, questions, tasks, and messages without losing context.
5. **Role-Aware Experiences**: One unified product serving 6 organizational roles (individual taxpayers, business owners, tax preparers, reviewers, firm administrators, and seasonal staff), with deep prototype focus on the 3 core operational roles: **Individual Taxpayer (Client)**, **Tax Preparer (Firm)**, and **Senior Tax Reviewer (Firm Senior)**, plus firm employee personal return context switching.
6. **Shared Return Status & Progress**: Unambiguous lifecycle stages with dual client/firm views, blockers, and next-action owners.
7. **Actionable CPA Dashboard**: Decision-oriented workbench answering "What should I work on right now?" with real prioritization across hundreds of returns.
8. **Consistent Interaction Affordances (Clickable vs. Editable)**: Clear visual language for AI-generated, verified, user-edited, locked, and approval-pending states.
9. **Complexity Made Navigable**: Progressive disclosure and high-performance search/filtering for returns with 100+ documents/workpapers.
10. **Trustworthy AI**: Explainable AI outputs with confidence scores, underlying evidence, uncertainty reasons, and frictionless correction workflows.

---

## Clarifications

### Session 2026-08-28
- **Q:** How should demo data mutations (such as inline AI corrections, verified field states, client uploads, and new contextual messages) be preserved across browser reloads?  
  **A:** **Option B (Pure In-Memory / Ephemeral)** — State is managed reactively in-memory via a centralized Zustand store. State is preserved live during all in-app navigation and role-switching workflows without page reloads, and cleanly resets back to baseline mock fixtures on hard browser refresh without unnecessary LocalStorage serialization complexity.

---

## User Scenarios & Testing *(Prioritized User Journeys)*

### User Story 1 - CPA Inspects Source Document Traceability & AI Trust (Priority: P1)

**User Journey**: A CPA reviewer opens a Form 1040 (e.g., Schedule C Gross Receipts $142,500 or Line 1a Wages $85,400) and clicks on a field. The app opens a split-screen side-by-side view highlighting the exact PDF source document (e.g., 1099-NEC / W-2), highlighting the bounding box on page 1, explaining the AI extraction confidence (98%), showing the transformation formula (Sum of Box 1 from 3x 1099-NEC forms), and allowing the CPA to verify or adjust the value with one click.

**Why this priority**: Solves Challenge 01, Challenge 08, and Challenge 10. Without traceability and AI explainability, CPAs must manually re-verify every calculation.

**Independent Test**:
- Open return view -> Click on "Schedule C - Gross Receipts ($142,500)" -> Verify side-by-side viewer opens showing source 1099-NEC documents, highlighted bounding box, confidence score (98%), calculation steps ($45k + $55k + $42.5k), and visual state badge "AI-Generated (Needs Review)" -> Click "Verify" to lock the state to "Verified".

**Acceptance Scenarios**:
1. **Given** a return field with AI-extracted source data, **When** the CPA clicks the field, **Then** the source document viewer opens to the exact page with high-contrast bounding box and calculation breakdown.
2. **Given** an AI recommendation with uncertainty (confidence < 85%), **When** the user inspects the explanation card, **Then** the platform displays the evidence, uncertainty rationale, and a quick inline correction button.

---

### User Story 2 - CPA Prioritizes Work via Actionable Dashboard (Priority: P1)

**User Journey**: A CPA logs in and lands on an actionable dashboard. Rather than static vanity charts, the dashboard displays prioritized queues: "Needs Review (3)", "Blocked on Client (5)", "Urgent Approvals (2)", and "Filing Deadlines (Next 48 Hours)". The CPA can filter across 150+ returns, toggle between Manager View (firm workload balance) and Preparer View (personal queue), and jump directly into a return.

**Why this priority**: Solves Challenge 07 and Challenge 09. Solves the core CPA pain point of "What should I work on right now?" without resorting to external spreadsheets.

**Independent Test**:
- Load dashboard -> Observe ranked queue based on triage score (Deadline + Client responsiveness + Complexity + AI confidence) -> Filter by "Blocked on Client" -> Instant filter response across mock dataset of 100+ returns.

**Acceptance Scenarios**:
1. **Given** 100+ active returns, **When** viewing the CPA dashboard, **Then** returns are sorted by computed triage urgency with prominent primary action buttons ("Start Review", "Send Reminder", "E-file").
2. **Given** a Manager role, **When** toggling "Team Workload View", **Then** unassigned returns and staff bottlenecks are highlighted with reassign capabilities.

---

### User Story 3 - New Client Onboarding in Under 10 Seconds (Priority: P2)

**User Journey**: A first-time client logs in. Instead of a complex tax tree, they are greeted with a welcoming, zero-jargon onboarding view: a clear greeting, 3 immediate high-priority action cards ("Upload W-2", "Answer 4 Tax Life Questions", "Review Bank 1099"), an estimated time to complete (8 mins), and a visual progress tracker.

**Why this priority**: Solves Challenge 03. Prevents client drop-off and confusion during initial intake.

**Independent Test**:
- Switch role to "First-Time Client" -> Observe 10-second orientation card -> Click "Upload Document" -> Drag-and-drop simulated file -> Notice immediate completion checkmark and progress bar update from 0% to 33%.

**Acceptance Scenarios**:
1. **Given** a new client account, **When** they first log in, **Then** non-essential menus are deferred and a clear 3-step action card banner is presented.
2. **Given** the client completes all initial items, **Then** the interface transitions from onboarding mode into the standard active return tracker.

---

### User Story 4 - Contextual Collaboration & Request Tracking (Priority: P2)

**User Journey**: A CPA identifies an ambiguous $12,000 deduction on Schedule C. Directly from the workpaper/document view, the CPA starts a thread. They can tag it as an "Internal Firm Note" (yellow badge, hidden from client) or "Client Question" (blue badge, sends structured action request to client). The client sees an actionable request banner with one-click reply or document upload.

**Why this priority**: Solves Challenge 02 and Challenge 04. Eliminates fragmented email/phone threads and keeps conversations attached to specific tax objects.

**Independent Test**:
- Open return -> Open Schedule C -> Click "Add Note/Request" on line 24 -> Select "Client Question" -> Submit "Please confirm if vehicle mileage log is available" -> Switch role to "Client" -> Observe notification and dedicated request card with reply input.

**Acceptance Scenarios**:
1. **Given** a document or field thread, **When** marked "Internal Note", **Then** it is strictly invisible to the client role.
2. **Given** a thread with an open request, **When** client responds with document, **Then** next action ownership flips to CPA and request status updates to "Resolved".

---

### User Story 5 - Role Switcher & Context Preservation (Priority: P2)

**User Journey**: The application provides a persistent Role Switcher in the development/demo header allowing instant switching between the 3 core roles:
1. **Individual Taxpayer (Client)**: Focuses on intake, document uploads, action requests, and e-signatures.
2. **Tax Preparer (Firm)**: Focuses on daily return prep, document extraction, workpapers, and internal collaboration.
3. **Senior Tax Reviewer (Firm Senior)**: Focuses on verification overrides, QA approvals, triage oversight, and IRS filing authorization.
Plus a special toggle: **"Firm Employee Personal Return"** showing how the UI cleanly separates professional firm duties from personal tax documents.

**Why this priority**: Solves Challenge 05 and Challenge 04. Demonstrates role-aware frontend architecture, permission clarity, and context preservation without confusing separate products.

**Acceptance Scenarios**:
1. **Given** any screen, **When** switching between the 3 roles, **Then** the navigation, permission buttons (e.g. "Approve Return" only for Reviewer), and visible data adapt immediately.
2. **Given** a firm employee viewing their own personal return, **Then** internal preparer notes on their own return are masked or role-gated per confidentiality rules.

---

### User Story 6 - Shared Return Status & Progress with Zero Ambiguity (Priority: P3)

**User Journey**: Both client and CPA can view the return status lifecycle. The CPA sees granular stages: `Intake (Done) -> AI Extraction (Done) -> Preparation (In Progress) -> Review (Pending) -> Client E-Sign (Pending) -> E-Filed (Pending)`. The client sees simplified, reassuring milestones: `Documents Received -> Under Expert Review -> Ready for Signature -> Filed with IRS`, with an unambiguous badge: `Next Step: CPA preparing return (Estimated completion: Oct 12)`.

**Why this priority**: Solves Challenge 06. Ensures clients never wonder "Who is waiting on whom?"

**Acceptance Scenarios**:
1. **Given** a return in progress, **When** viewing the progress header, **Then** both the current milestone and the exact "Next Action Owner" are explicitly displayed.
2. **Given** a blocker (e.g., missing 1099-K), **Then** a high-visibility blocker tag appears with direct link to resolve it.

---

### User Story 7 - Consistent Visual Language for Affordances (Priority: P3)

**User Journey**: Across all tables, forms, and calculation sheets, every data cell features distinct visual styling indicating its state:
- **AI-Extracted (Pending Verification)**: Purple subtle glow, AI spark icon, clickable for explanation.
- **Verified**: Green subtle check, locked from accidental edits unless unlocked.
- **Human Edited**: Blue indicator with edit audit history.
- **Calculated / Locked**: Gray background with lock icon, tooltip showing calculation formula.
- **Requires Approval**: Amber border with "Review" action button.

**Why this priority**: Solves Challenge 08. Prevents accidental edits and makes data provenance crystal clear.

---

### User Story 8 - Scalable Navigation & Deep Search for Complex Returns (Priority: P3)

**User Journey**: For large returns with 100+ documents (W-2s, 1099s, K-1s, receipts, brokerage statements), the user uses a high-performance sidebar with multi-faceted search (by document type, year, entity, status, confidence score), collapsible category trees, and persistent context pins.

**Why this priority**: Solves Challenge 09. Proves the platform remains intuitive and fast even under professional tax season load.

---

## Functional Requirements

- **FR-001**: System MUST provide interactive side-by-side document and return field inspection with bounding box overlays.
- **FR-002**: System MUST calculate and display AI confidence scores, extraction provenance, and multi-document transformation formulas.
- **FR-003**: System MUST support threaded messaging tied directly to documents, line items, and returns with strict internal vs. external privacy controls.
- **FR-004**: System MUST provide an actionable triage score algorithm ranking returns by deadline, urgency, blocker state, and client responsiveness.
- **FR-005**: System MUST include a zero-friction Role Switcher supporting the 3 core roles (`individual_client`, `tax_preparer`, `tax_reviewer`) plus employee personal/firm context switching.
- **FR-006**: System MUST provide dual-view lifecycle progress (Granular for CPAs, Milestone for Clients) with explicit Next Action Owner indicator.
- **FR-007**: System MUST render consistent visual affordance badges across all data elements (AI-extracted, verified, manual, calculated, locked).
- **FR-008**: System MUST support instant filtering, search, and progressive disclosure over a mock dataset of 100+ documents and returns.
- **FR-009**: System MUST allow inline one-click correction and verification of AI recommendations.
- **FR-010**: System MUST maintain breadcrumbs, persistent context dock, and deep links across interconnected objects.
- **FR-011**: System MUST maintain minimum readable content widths (`min-w-*`) with container-level horizontal scrollability (`overflow-x-auto`) on dense tax tables, side-by-side review panes, and document viewers to prevent awkward data squeezing on smaller screens.

---

## Key Data Entities

- **TaxReturn**: ID, clientName, taxYear, returnType (1040/1120S/1065), stage, blocker, nextActionOwner, dueDate, triageScore, totalIncome, refundAmount, fields.
- **ReturnField**: ID, returnId, formName, fieldName, value, formattedValue, state (ai_extracted, verified, user_edited, calculated_locked, requires_approval), confidence, sourceDocIds, formula, auditHistory.
- **SourceDocument**: ID, name, docType (W-2, 1099-NEC, 1099-DIV, 1098, K-1, Receipt), pages, uploadDate, status, extractedFields, rawText, boundingBoxes.
- **BoundingBox**: page, x, y, width, height, fieldKey, label, confidence.
- **CollaborationThread**: ID, targetType (field, document, return), targetId, title, status (open, waiting_client, resolved), messages.
- **Message**: ID, threadId, senderRole, senderName, timestamp, content, isInternalOnly, attachments, requestedAction.
- **UserRole**: Role enum (`individual_client`, `tax_preparer`, `tax_reviewer`), permissions set, activeReturnContext.

---

## Success Criteria

- **SC-001**: A first-time client understands their next action within 10 seconds of landing on the onboarding view.
- **SC-002**: A CPA can trace any return number to its source document and formula in <= 2 clicks.
- **SC-003**: 100% of the 10 case study challenges are interactive, testable, and demonstrable in the working prototype.
- **SC-004**: The mock dataset contains >= 100 documents and multiple realistic returns (individual 1040, small business 1120S, complex multi-entity) with zero UI lag.
- **SC-005**: Clear visual separation of simulated AI logic vs. client-side prototype in the UI and README documentation.
