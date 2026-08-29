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

### Session 2026-08-28 (State & Navigation Architecture)
- **Q1 (State Architecture):** How should demo data mutations be preserved?  
  **A:** **Option B (Pure In-Memory / Ephemeral)** — State is managed reactively in-memory via a centralized Zustand store. State is preserved live during all in-app navigation and role-switching workflows without page reloads, and cleanly resets back to baseline mock fixtures on hard browser refresh.
- **Q2 (Saved Logins Screen & Post-Login Personal Return Access):** How should role selection and employee personal return access be presented?  
  **A:** The landing screen is structured realistically as a **"Saved Logins / Account Chooser"** page (matching authentic enterprise SSO / login selectors to eliminate prototype artificiality and reduce cognitive load for interviewers).
    - The Saved Logins page displays realistic persona accounts:
      1. **Sam Wilson, CPA** — `Tax Preparer (Firm Workspace)`
      2. **Steve Rogers** — `Senior Tax Director (Firm Review & Approval)`
      3. **Tony Stark** — `Client Taxpayer Portal`
      4. **Peter Parker** — `Client Taxpayer Portal (Freelance)`
    - There is **NO** standalone "Personal Return Mode" on the initial login screen.
    - For employees/preparers, personal tax filing is accessed **after logging in from within the top-right account dropdown** via **"Switch to My Personal Return"**.
    - The top-right navbar menu contains the account holder's name, `Switch to My Personal Return` (for firm employees), `Settings` (placeholder), `Help` (placeholder), and `Logout` (which returns to the Saved Logins screen).
- **Q3 (Client Portal View Structure):** How is the client interface structured below the navbar?  
  **A:** For the client, the 3 metric/onboarding cards are **removed**. Directly below the navbar, a multi-stage **Progress Bar** is displayed indicating the client's exact stage in the tax return lifecycle. Each stage displays a concise title (maximum 2-3 words, e.g., *"Documents Intake"*, *"AI Processing"*, *"Expert Preparation"*, *"Partner Review"*, *"Ready to Sign"*, *"IRS E-Filed"*, *"Return Accepted"*), with no lengthy card descriptions cluttering the top fold.

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

### User Story 3 - Client Progress Lifecycle & Stage Bar (Priority: P2)

**User Journey**: A client (e.g., Tony Stark or Peter Parker) logs in to their portal. Directly below the top navbar, the client sees a sleek, high-visibility **Return Progress Bar** mapping the full lifecycle. Each stage displays a clear, 2-3 word title (e.g., `1. Documents Intake`, `2. AI Processing`, `3. Expert Prep`, `4. Partner Review`, `5. Client Signature`, `6. IRS Submission`, `7. Accepted`). The active stage is prominently highlighted, showing the next action owner and pending requests (such as upload missing 1099 or Form 8879 e-sign).

**Why this priority**: Solves Challenge 03 and Challenge 06. Delivers instant clarity on "Where is my tax return?" and "What do I need to do next?" in under 5 seconds without UI clutter.

**Independent Test**:
- Log in as Client -> Observe top progress bar with concise 2-3 word stage titles -> View the active highlighted stage and next action callout -> Upload a requested document or click e-sign -> Observe real-time advance in the stage bar.

**Acceptance Scenarios**:
1. **Given** a client session, **When** viewing the client portal, **Then** a multi-stage progress bar with concise 2-3 word stage titles is rendered directly below the navbar.
2. **Given** a stage transition (e.g., preparer completes review), **Then** the client progress bar updates state to "Client Signature" with a direct Form 8879 e-sign action.

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

### User Story 5 - Saved Logins Account Chooser & Navbar Account Dropdown (Priority: P2)

**User Journey**: The application provides an authentic **Saved Logins (Account Chooser)** landing screen where users select their account to sign in:
1. **Sam Wilson, CPA** — `Tax Preparer (Firm Workspace)`
2. **Steve Rogers** — `Senior Tax Director (Firm Review & Approval)`
3. **Tony Stark** — `Client Taxpayer Portal (Stark Enterprises / 1040)`
4. **Peter Parker** — `Client Taxpayer Portal (Freelance Photography)`

When logged in:
- The top-right navbar renders the **Account Holder Name** with a user dropdown.
- For firm employees/preparers, the dropdown contains a **"Switch to My Personal Return"** option, cleanly transitioning into their private employee Form 1040 without exposing personal files on the public login screen.
- The dropdown also contains `Logout` (returns to the Saved Logins page), plus `Settings` and `Help` (inactive placeholders).

**Why this priority**: Solves Challenge 05 and Challenge 04. Enforces authentic authentication flows, minimizes interviewer cognitive load, and maintains strict confidentiality for employee personal returns.

**Acceptance Scenarios**:
1. **Given** the Saved Logins screen, **When** clicking a persona card, **Then** the user logs in directly to that specific persona workspace without exposing a fake "Personal Return" role option on the login screen.
2. **Given** a logged-in firm preparer/reviewer, **When** opening the account dropdown and selecting "Switch to My Personal Return", **Then** the workspace shifts into their private employee 1040 self-filing mode.
3. **Given** any logged-in view, **When** clicking "Logout" in the account dropdown, **Then** the app logs out to the Saved Logins screen.

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
- **FR-005**: System MUST provide an authentic Saved Logins (Account Chooser) landing screen for persona sign-in (Sam Wilson CPA, Steve Rogers Senior Reviewer, Tony Stark Client, Peter Parker Client) and a top-right Navbar Account Menu containing Account Holder Name, Switch to My Personal Return (for firm staff), Settings (placeholder), Help (placeholder), and Logout (returns to Saved Logins).
- **FR-006**: System MUST render a multi-stage Return Progress Bar directly below the navbar for the Client Portal with concise 2-3 word stage titles, hiding the 3 CPA/admin metric cards in client mode.
- **FR-007**: System MUST render consistent visual affordance badges across all data elements (AI-extracted, verified, manual, calculated, locked).
- **FR-008**: System MUST support instant filtering, search, and progressive disclosure over a mock dataset of 100+ documents and returns.
- **FR-009**: System MUST allow inline one-click correction and verification of AI recommendations.
- **FR-010**: System MUST maintain breadcrumbs, persistent context dock, and deep links across interconnected objects.
- **FR-011**: System MUST maintain minimum readable content widths (`min-w-*`) with container-level horizontal scrollability (`overflow-x-auto`) on dense tax tables, side-by-side review panes, and document viewers to prevent data squeezing.

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
