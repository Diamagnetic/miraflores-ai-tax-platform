# Phase 0: Research & Technical Decisions

**Feature**: `001-ai-tax-platform`  
**Date**: 2026-08-27  
**Status**: Completed  

## 0. Executive Defense: The Greenfield Architectural Premise ("Assume Nothing Exists Yet")

### Core Strategic Rationale & Interview Defense
When building an AI-powered tax platform, the prompt directive to *"Assume nothing exists yet: no legacy screens to patch, no prior design system to match, no existing data model to work around"* is not merely a simplifying assumption—it is the **critical competitive differentiator** that enables true AI-native transformation rather than superficial AI retrofitting.

```
+-----------------------------------------------------------------------------------------------+
| LEGACY TAX SOFTWARE PARADIGM                    | AI-NATIVE GREENFIELD PARADIGM (MIRAFLORES) |
| (CCH Axcess, GoSystem, UltraTax)                |                                             |
+-------------------------------------------------+---------------------------------------------+
| - Fragmented 4-tool stack (CRM + OCR + Prep)   | - Single unified reactive state engine      |
| - Static PDF viewing with manual paper tie-outs | - Bi-directional vector bounding box trace  |
| - AI bolted on as opaque "black-box" OCR        | - 4-pillar defensible explainability cards  |
| - Cluttered tables, cramped viewport wrapping   | - Container-level horizontal scroll (min-w) |
| - Confusing role silos with security leaks      | - Authentic Saved Logins & scoped portals   |
+-----------------------------------------------------------------------------------------------+
```

#### Key Pillars of the Greenfield Defense:
1. **AI Provenance as a Native Data Primitive**:
   - In legacy systems, tax lines are static numbers in a database disconnected from OCR coordinates.
   - Starting greenfield allowed us to define every `ReturnField` with embedded provenance from Day 1: `{ boundingBoxId, confidenceScore, formulaBreakdown, auditHistory, affordanceState }`. This eliminates the need for external workpaper binder software (e.g. SurePrep/TicTieCalculate).
2. **Unified Real-Time State vs. Multi-App Fragmentation**:
   - Traditional accounting firms juggle 4-5 disconnected tools: a client intake portal (TaxDome), an OCR utility (GruntWorx), a tax prep monolith (Axcess), and email/phone threads.
   - Our greenfield in-memory architecture unifies intake, triage, preparation, review, and client e-signatures into a single synchronous reactive engine (0ms lag, live updates across all mounted components).
3. **Cognitive Load Reduction via Purpose-Built Views**:
   - Free from legacy desktop UI debt, we created tailored, uncluttered interfaces:
     - **For Clients**: Clean 7-stage progress bar with concise 2-3 word titles and clear next actions (no CPA metric clutter).
     - **For CPAs**: High-density split-screen review workbench, algorithmic triage queues, and sharp-cornered precision tooling (`--radius: 0rem`).
4. **Authentic Security & Identity Architecture**:
   - By avoiding artificial prototype toggles and designing an authentic **"Saved Logins / Account Chooser"** screen with post-login personal return access, the platform mirrors real enterprise SSO systems, ensuring interviewers evaluate the product as a production-grade vision.

---

## 1. Technology Stack & Framework Selection

### Decision: React 19 + TypeScript 7 + Vite 8.0 + Tailwind CSS v4.3 + shadcn/ui + Lucide Icons
- **Rationale**: 
  - Meets the case study requirement for a fast, responsive, and highly polished interactive prototype using modern React 19, Vite 8.0, and Tailwind CSS v4.3 with shadcn/ui primitives.
  - TypeScript 7 provides robust type definitions for tax forms, documents, and AI explainability metadata.
  - shadcn/ui + Tailwind CSS v4.3 provide accessible, composable UI components (Dialog, Tabs, Tooltip, Badge, Popover, Card) ideal for dense professional data tables, split-pane viewers, and explainability drawers.
  - Lucide Icons provides high-quality iconography for trust indicators, document types, roles, and status workflows.
- **Alternatives Considered**:
  - *Next.js / Remix*: Unnecessary server complexity for a client-side simulated prototype where all logic and simulated AI can run in-browser.
  - *Static HTML/JS*: Too cumbersome to maintain the reactive state required for role switching, side-by-side traceability, and multi-faceted search.

---

## 2. State Management & Role Switching Architecture

### Decision: Pure In-Memory Ephemeral Zustand Store (Zero LocalStorage Complexity)
- **Rationale**:
  - Provides a single reactive store for active role, selected tax return, active filters, open drawers, threads, and document annotations.
  - **Real-Time Reactive Updates**: Triggering actions like clicking "Verify" or "Correct" synchronously mutates the in-memory field state, instantly updating the Form 1040 table, side-by-side review drawer, bounding-box overlays, and dashboard triage metrics simultaneously.
  - In-app role switching and view navigation happen purely in React memory without page reloads, fully preserving multi-user workflows live during demos.
  - Cleanly resets to baseline fixtures on browser refresh, eliminating stale cache bugs and LocalStorage serialization overhead.
- **Alternatives Considered**:
  - *LocalStorage / SessionStorage persistence*: Adds unnecessary serialization/hydration complexity and potential stale data corruption without grading benefit.
  - *React Context alone*: Can suffer from re-render overhead when filtering 100+ documents and updating inline cell states.
  - *Redux Toolkit*: Overkill boilerplate for prototype velocity.

---

## 3. Source Document Traceability & Bounding Box Rendering

### Decision: Interactive SVG / Vector Document Renderer with High-Contrast Overlays
- **Rationale**:
  - Simulates authentic tax documents (W-2, 1099-NEC, 1099-DIV, 1098, Schedule K-1, Receipts) rendered as styled vector templates with exact coordinate-based bounding boxes (`{ x, y, width, height }`).
  - Allows instant bi-directional interactivity: clicking a line on Form 1040 immediately scrolls and highlights the source box on the document; hovering over a document box highlights the corresponding return field.
  - Eliminates external PDF loading latency, font rendering quirks, and CORS/canvas security restrictions while delivering 100% reliable click-throughs.
- **Alternatives Considered**:
  - *Real PDF.js viewer*: Heavy asset footprint, slower rendering, potential canvas DPI scaling issues on high-res displays.
  - *Static JPEG screenshots*: Rigid, non-interactive, and difficult to scale across responsive screen sizes.

---

## 4. Scalable Mock Dataset & Triage Prioritization Algorithm

### Decision: Deterministic In-Memory Mock Generator (120+ Documents, 8 Realistic Avengers-Themed Returns)
- **Rationale**:
  - Challenge 09 and Challenge 07 specifically evaluate navigating scale and prioritizing urgent tasks across hundreds of items.
  - The dataset generator creates 8 diverse Avengers-themed tax entities:
    1. *Tony Stark* (1040 Individual + Schedule C Freelance/Consulting — Active Demo Return with 1099-NECs from Stark Labs)
    2. *Stark Industries Clean Energy LLC* (1120S S-Corp with multi-partner K-1s to Pepper Potts and Col. Rhodes)
    3. *Peter Parker* (1040 Individual + Schedule C Freelance Photography — First-time client onboarding test case)
    4. *Natasha Romanoff* (1040 High Net Worth + Foreign Accounts FBAR + 1099-DIV/B Portfolio)
    5. *Wakanda Tech & Design LLC* (1065 Partnership with Shuri & Okoye — 150+ equipment & R&D receipts for scale testing)
    6. *Bruce Banner (CPA Employee / Researcher)* (Self-filing return for firm employee role-switch privacy demo)
    7. *Pym Quantum Technologies Inc* (1120S with urgent April 15 filing deadline)
    8. *Avengers Compound Facilities Management LLC* (Thor & Clint Barton — Return blocked on missing 1099-K / expense receipts)
  - **Firm Staff Personas**:
    - **Senior Tax Reviewer**: *Steve Rogers* (Chief QA Gatekeeper, Reviewer sign-off & IRS authorization)
    - **Tax Preparer**: *Sam Wilson* (Senior Preparer, workpaper tie-out & AI extraction verification)
- **Prioritization Logic (Triage Score Formula)**:
  $$\text{Score} = (\text{DaysUntilDue} \times -10) + (\text{HasBlocker} \times 50) + (\text{NeedsReview} \times 40) + (\text{ClientWaiting} \times 30) + (\text{ComplexityScore} \times 5)$$
  - Returns are categorized into dynamic queues: *Urgent / At Risk (Pym Tech)*, *Ready for Review (Tony Stark)*, *Waiting on Client (Avengers Compound)*, and *Ready to File (Stark Industries)*.

---

## 5. Visual Affordance System & Design Contract

### Decision: 5-Tier Semantic Color Badges & Strict Sharp Corners (`--radius: 0rem`)
- **Rationale**:
  - Challenge 08 requires unambiguous distinction between AI extractions, human edits, calculations, and approvals.
  - Implemented 5 clear states:
    1. **AI-Extracted (Pending Verification)**: Purple badge (`bg-violet-50 text-violet-700 border-violet-200`) with spark icon.
    2. **Verified**: Emerald badge (`bg-emerald-50 text-emerald-700 border-emerald-200`) with shield check.
    3. **Human Edited**: Amber/Sky badge with user attribution tag.
    4. **Calculated / Locked**: Slate badge (`bg-slate-100 text-slate-700`) with formula tooltip.
    5. **Requires Approval**: Crimson/Rose badge (`bg-rose-50 text-rose-700`) with discrepancy alert.
  - Strict sharp-corner design contract (`--radius: 0rem`, `rounded-none`) creates high-density financial tooling aesthetic that avoids generic AI UI templates.

---

## 6. Landing Screen & Authentication Model

### Decision: Authentic "Saved Logins (Account Chooser)" Screen & Post-Login Personal Return Access
- **Rationale**:
  - Structuring the landing screen as an authentic corporate **"Saved Logins / Account Chooser"** (similar to Google or Microsoft 365 enterprise login selectors) significantly reduces cognitive load and feels natural to users and interviewers, eliminating prototype artificiality.
  - Positioning the **"Switch to My Personal Return"** option directly within the top-right navbar account dropdown after login eliminates the friction of requiring firm employees (preparers/reviewers) to log out and re-authenticate under a different credential just to review or manage their personal employee 1040 return.
  - This preserves firm workflow continuity while maintaining strict in-memory permission and visibility boundaries.

---

## 7. Client Portal Top Fold Architecture

### Decision: Multi-Stage Return Progress Bar with Concise 2-3 Word Stage Titles (Zero Metric Card Clutter)
- **Rationale**:
  - Tax clients do not need complex CPA triage metric cards upon logging in; they need immediate, calm clarity on "Where is my return right now?" and "What is the single next action required of me?".
  - Replacing the 3 dashboard cards with a top-mounted **Return Progress Bar** directly under the navbar displays 7 clear stages with concise 2-3 word titles (`1. Documents Intake`, `2. AI Processing`, `3. Expert Prep`, `4. Partner Review`, `5. Client Signature`, `6. IRS Submission`, `7. Accepted`).
  - Active stage is highlighted with an unambiguous next action owner callout (e.g. `Next Step: Client e-Sign Form 8879`).

---

## 8. Trustworthy AI Explainability Framework

### Decision: Four-Pillar Explainability Card
- **Rationale**: Solves Challenge 10 by providing balanced transparency without overwhelming technical noise.
- **Explainability Schema**:
  1. **What AI Did**: Concise natural language summary (e.g., *"Extracted $142,500 Gross Receipts from 3x 1099-NEC forms"*).
  2. **Why / Evidence**: Direct document citations, matched fields, OCR text snippet, and highlighted visual bounding box.
  3. **Uncertainty & Risk**: Clear risk rating (High/Med/Low) with specific flags (e.g., *"1099-NEC from Acme Corp has handwritten correction in Box 1"*).
  4. **Actionable Correction**: Single-click actions: `Accept Extraction`, `Edit Value`, `Request Client Re-upload`, `Flag for Senior Review`.

---

## 7. Viewport Strategy: Horizontal Scroll Containers (Preventing Content Squeezing)

### Decision: Container-Level Horizontal Scrollability (`overflow-x-auto`) with Minimum Readable Widths
- **Rationale**:
  - Tax review tables, side-by-side split workbenches (Form 1040 + PDF Document Viewer + AI Trust Card), and multi-column triage queues require significant horizontal real estate to remain legible.
  - Squeezing multi-column financial data into narrow browser windows causes truncation, overlapping numbers, and degraded affordance visibility.
  - By applying explicit minimum widths (e.g. `min-w-[850px]` on tax schedule tables and `min-w-[1100px]` on split-screen workbenches) wrapped in container-level `overflow-x-auto`, the interface preserves data clarity, allows smooth horizontal panning on smaller screens, and prevents awkward layout collapse.
- **Alternatives Considered**:
  - *Aggressive column collapsing/wrapping*: Makes side-by-side comparison impossible and forces numbers onto multiple lines, creating severe readability issues for tax professionals.
  - *Full page zoom out*: Makes typography unreadably small on lower-resolution laptop displays.
